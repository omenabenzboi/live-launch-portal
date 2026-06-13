// Remote-agent adapter. Calls a user-deployed daemon over HTTPS with a bearer
// token. Daemon URL + token are read SERVER-SIDE only and never leave the
// server boundary. This file must only be imported from .server.ts modules or
// inside a server-fn / server-route handler.
//
// Daemon contract (the user runs this themselves on their own host):
//   GET  {daemon_url}/health                                   -> { ok: true, version, uptime }
//   POST {daemon_url}/exec     { command, cwd?, timeoutMs? }   -> { exitCode, stdout, stderr, durationMs }
//   POST {daemon_url}/fs/read  { path }                        -> { path, content, truncated? }
//   POST {daemon_url}/fs/write { path, content }               -> { path, bytes }
// All requests carry: Authorization: Bearer <daemon_token>.

export interface DaemonConfig {
  url: string;
  token: string;
  workspaceRoot?: string | null;
  timeoutMs?: number;
}

export interface DaemonResult<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function daemonFetch<T>(
  cfg: DaemonConfig,
  path: string,
  init: RequestInit,
): Promise<DaemonResult<T>> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), cfg.timeoutMs ?? 30_000);
  try {
    const res = await fetch(`${cfg.url.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.token}`,
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    let data: unknown = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : text) || `Daemon HTTP ${res.status}`,
      };
    }
    return { ok: true, status: res.status, data: data as T };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : "Network error reaching daemon",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function daemonHealth(cfg: DaemonConfig) {
  return daemonFetch<{ ok: boolean; version?: string; uptime?: number }>(
    cfg,
    "/health",
    { method: "GET" },
  );
}

export function daemonExec(
  cfg: DaemonConfig,
  input: { command: string; cwd?: string; timeoutMs?: number },
) {
  return daemonFetch<{
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
  }>(cfg, "/exec", {
    method: "POST",
    body: JSON.stringify({
      command: input.command,
      cwd: input.cwd ?? cfg.workspaceRoot ?? undefined,
      timeoutMs: input.timeoutMs ?? 60_000,
    }),
  });
}

export function daemonReadFile(cfg: DaemonConfig, input: { path: string }) {
  return daemonFetch<{ path: string; content: string; truncated?: boolean }>(
    cfg,
    "/fs/read",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function daemonWriteFile(
  cfg: DaemonConfig,
  input: { path: string; content: string },
) {
  return daemonFetch<{ path: string; bytes: number }>(cfg, "/fs/write", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Resolve daemon config from a workspace id using the admin client. Returns null when not configured/enabled. */
export async function resolveDaemonConfig(
  workspaceId: string | null | undefined,
): Promise<DaemonConfig | null> {
  if (!workspaceId) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: ws } = await supabaseAdmin
    .from("workspaces")
    .select("server_id")
    .eq("id", workspaceId)
    .maybeSingle();
  const serverId = (ws as { server_id?: string | null } | null)?.server_id;
  if (!serverId) return null;
  const { data: srv } = await supabaseAdmin
    .from("servers")
    .select("daemon_url, daemon_token, workspace_root, enabled, adapter_mode")
    .eq("id", serverId)
    .maybeSingle();
  const s = srv as
    | {
        daemon_url?: string | null;
        daemon_token?: string | null;
        workspace_root?: string | null;
        enabled?: boolean | null;
        adapter_mode?: string | null;
      }
    | null;
  if (!s || !s.enabled || s.adapter_mode !== "remote-agent" || !s.daemon_url || !s.daemon_token) {
    return null;
  }
  return {
    url: s.daemon_url,
    token: s.daemon_token,
    workspaceRoot: s.workspace_root ?? null,
  };
}
