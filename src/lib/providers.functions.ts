import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ProviderKind = z.enum(["openai", "anthropic", "google", "openrouter", "custom"]);

const UpsertInput = z.object({
  id: z.string().uuid().optional(),
  kind: ProviderKind,
  name: z.string().min(1).max(64),
  api_key: z.string().min(1).max(8192).optional(),
  base_url: z.string().url().max(512).optional().nullable(),
  default_model: z.string().max(128).optional().nullable(),
  enabled: z.boolean().optional(),
});

// List provider configs (admin-managed, shared). API keys are never returned.
export const listProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("provider_configs")
      .select("id, kind, name, base_url, default_model, enabled, models, created_at, updated_at")
      .order("name");
    if (error) throw new Error(error.message);
    return { providers: data ?? [] };
  });

// Upsert a provider config (admin-only via RLS policy).
export const upsertProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertInput.parse(input))
  .handler(async ({ data, context }) => {
    const row: {
      id?: string;
      kind: z.infer<typeof ProviderKind>;
      name: string;
      base_url: string | null;
      default_model: string | null;
      enabled: boolean;
      api_key_encrypted?: string;
      created_by: string;
    } = {
      kind: data.kind,
      name: data.name,
      base_url: data.base_url ?? null,
      default_model: data.default_model ?? null,
      enabled: data.enabled ?? true,
      created_by: context.userId,
    };
    if (data.id) row.id = data.id;
    if (data.api_key) row.api_key_encrypted = data.api_key; // TODO: encrypt at rest via pgcrypto.

    const { error } = await context.supabase.from("provider_configs").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("provider_configs")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
