// Server-only tool executor. Supports adapter modes: mock | dry-run |
// remote-agent (stub) | ssh (stub). Default is mock so nothing dangerous
// can run from Lovable hosting in M3.
import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyRisk, summarizeInput, type ToolName } from "./risk";

export type AdapterMode = "mock" | "dry-run" | "remote-agent" | "ssh";

export interface ExecContext {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string | null;
  workspaceId?: string | null;
  adapterMode: AdapterMode;
}

export interface ToolResult {
  ok: boolean;
  pending?: boolean;
  approvalId?: string;
  mode: AdapterMode;
  risk: "safe" | "restricted" | "dangerous";
  summary: string;
  note?: string;
  data?: unknown;
}

/**
 * Decide whether a tool call should execute or wait for approval.
 * - safe → run in current adapter mode (mock returns synthetic data)
 * - restricted → create approval row, return pending
 * - dangerous → create approval row flagged dangerous, return pending
 */
export async function executeTool(
  tool: ToolName,
  input: Record<string, unknown>,
  ctx: ExecContext,
): Promise<ToolResult> {
  const { risk, reason } = classifyRisk({ tool, input });
  const summary = summarizeInput(tool, input);

  if (risk === "safe") {
    return runSafe(tool, input, ctx, summary);
  }

  // Restricted / dangerous → queue an approval row, do NOT execute.
  const { data: approval, error } = await ctx.supabase
    .from("approvals")
    .insert({
      requested_by: ctx.userId,
      workspace_id: ctx.workspaceId ?? null,
      conversation_id: ctx.conversationId,
      action: tool,
      tool_name: tool,
      risk_level: risk,
      input_summary: summary,
      payload: input,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[executor] approval insert failed", error);
    return {
      ok: false,
      pending: true,
      mode: ctx.adapterMode,
      risk,
      summary,
      note: `Could not enqueue approval: ${error.message}`,
    };
  }

  return {
    ok: false,
    pending: true,
    approvalId: approval.id,
    mode: ctx.adapterMode,
    risk,
    summary,
    note: `${reason} Awaiting human approval. Open the Approvals tab to review.`,
  };
}

async function runSafe(
  tool: ToolName,
  input: Record<string, unknown>,
  ctx: ExecContext,
  summary: string,
): Promise<ToolResult> {
  if (tool === "plan") {
    return {
      ok: true,
      mode: ctx.adapterMode,
      risk: "safe",
      summary,
      data: { steps: input.steps },
    };
  }

  if (tool === "web_search") {
    // Web search adapter not wired yet — return a clear note so the model
    // doesn't pretend it has fresh data.
    return {
      ok: true,
      mode: ctx.adapterMode,
      risk: "safe",
      summary,
      data: { query: input.query, results: [] },
      note:
        "Web search provider not yet connected. Reply from existing knowledge and recommend the user verify time-sensitive facts.",
    };
  }

  if (tool === "read_file") {
    return mockOrDryRun(tool, input, ctx, summary, "safe", {
      path: input.path,
      content: `// [mock] Contents of ${input.path} would appear here. Connect a workspace adapter (Settings → Servers) to enable real reads.`,
    });
  }

  return {
    ok: false,
    mode: ctx.adapterMode,
    risk: "safe",
    summary,
    note: "Unhandled safe tool.",
  };
}

/** Called by the approval resolver when a restricted/dangerous tool is approved. */
export async function executeApproved(
  tool: ToolName,
  input: Record<string, unknown>,
  ctx: ExecContext,
): Promise<ToolResult> {
  const summary = summarizeInput(tool, input);
  return mockOrDryRun(tool, input, ctx, summary, "restricted", {
    tool,
    input,
    note: "Approval recorded. Real execution will run via the configured server-agent adapter (M4+).",
  });
}

function mockOrDryRun(
  tool: ToolName,
  input: Record<string, unknown>,
  ctx: ExecContext,
  summary: string,
  risk: "safe" | "restricted" | "dangerous",
  payload: unknown,
): ToolResult {
  const mode = ctx.adapterMode;
  if (mode === "dry-run") {
    return {
      ok: true,
      mode,
      risk,
      summary,
      data: { dryRun: true, would: { tool, input } },
      note: "Dry-run mode — no side effects performed.",
    };
  }
  if (mode === "remote-agent" || mode === "ssh") {
    return {
      ok: false,
      pending: true,
      mode,
      risk,
      summary,
      note: `Adapter "${mode}" is not yet connected. Falling back to mock. Configure the server-agent in Settings → Servers (M4).`,
    };
  }
  // mock
  return {
    ok: true,
    mode,
    risk,
    summary,
    data: payload,
    note: "Mock adapter — no real workspace touched.",
  };
}
