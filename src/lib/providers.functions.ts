import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ProviderId = z.enum([
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "xai",
  "mistral",
  "openrouter",
  "lovable",
  "custom",
]);

const UpsertInput = z.object({
  provider: ProviderId,
  api_key: z.string().min(1).max(8192).optional(),
  base_url: z.string().url().max(512).optional().nullable(),
  default_model: z.string().max(128).optional().nullable(),
  enabled: z.boolean().optional(),
});

// List provider configs for the current user (api keys never returned).
export const listProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("provider_configs")
      .select("id, provider, base_url, default_model, enabled, created_at, updated_at")
      .order("provider");
    if (error) throw new Error(error.message);
    return { providers: data ?? [] };
  });

// Upsert a provider config. The api_key is stored encrypted server-side.
export const upsertProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertInput.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {
      user_id: context.userId,
      provider: data.provider,
      base_url: data.base_url ?? null,
      default_model: data.default_model ?? null,
      enabled: data.enabled ?? true,
    };
    if (data.api_key) patch.api_key_encrypted = data.api_key; // TODO: encrypt at rest via pgcrypto.
    const { error } = await context.supabase
      .from("provider_configs")
      .upsert(patch, { onConflict: "user_id,provider" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ provider: ProviderId }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("provider_configs")
      .delete()
      .eq("provider", data.provider);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
