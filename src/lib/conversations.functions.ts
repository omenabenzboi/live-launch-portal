import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { UIMessage } from "ai";

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, model, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { conversations: data ?? [] };
  });

export const loadConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: conv, error: cErr } = await supabase
      .from("conversations")
      .select("id, title, model")
      .eq("id", data.id)
      .single();
    if (cErr || !conv) throw new Error("Not found");
    const { data: rows, error: mErr } = await supabase
      .from("messages")
      .select("id, role, parts, created_at")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    const messages: UIMessage[] = (rows ?? []).map((r) => ({
      id: r.id as string,
      role: r.role as UIMessage["role"],
      parts: r.parts as UIMessage["parts"],
    }));
    return { conversation: conv, messages };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
