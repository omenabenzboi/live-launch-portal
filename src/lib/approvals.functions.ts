// Approval queue server functions.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idSchema = z.object({ id: z.string().uuid() });

export const listApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: "pending" | "resolved" } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("approvals")
      .select(
        "id, requested_by, workspace_id, conversation_id, action, tool_name, risk_level, input_summary, payload, status, decided_by, decided_at, created_at, expires_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (data?.status === "pending") q = q.eq("status", "pending");
    else if (data?.status === "resolved") q = q.in("status", ["approved", "denied", "expired"]);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { approvals: rows ?? [] };
  });

export const resolveApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; decision: "approved" | "denied" }) =>
    z.object({ id: z.string().uuid(), decision: z.enum(["approved", "denied"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("approvals")
      .update({
        status: data.decision,
        decided_by: userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("approvals")
      .update({ status: "denied", decided_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
