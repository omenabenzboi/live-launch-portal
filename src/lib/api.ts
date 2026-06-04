// Typed API client. In dev/no-backend mode it falls back to seeded mock data.
// Set VITE_API_BASE_URL to point at a real backend; all functions then hit HTTP.
import {
  TASKS,
  CHAT_SEED,
  TERMINAL_SEED,
  FILE_TREE,
  FILE_CONTENTS,
  NOTIFICATIONS,
  MODELS,
  WORKSPACES,
  AGENTS,
  type Task,
  type ChatMessage,
  type TerminalLine,
  type FileNode,
  type Notification,
  type ModelOption,
  type Workspace,
  type Agent,
} from "./mock-data";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const USE_MOCK = !BASE;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// --- Tasks ---
export async function getTasks(): Promise<Task[]> {
  if (USE_MOCK) return Promise.resolve(TASKS);
  return http("/tasks");
}
export async function getTask(id: string): Promise<Task | null> {
  if (USE_MOCK) return Promise.resolve(TASKS.find((t) => t.id === id) ?? null);
  return http(`/tasks/${id}`);
}
export async function createTask(input: {
  title: string;
  prompt: string;
  agent?: string;
}): Promise<Task> {
  if (USE_MOCK) {
    const t: Task = {
      id: `t_${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      status: "queued",
      progress: 0,
      agent: input.agent ?? "Backend Agent",
      workspace: "omenacore",
      updatedAt: "just now",
      summary: input.prompt,
      filesChanged: 0,
    };
    TASKS.unshift(t);
    return Promise.resolve(t);
  }
  return http("/tasks", { method: "POST", body: JSON.stringify(input) });
}

// --- Chat ---
export async function sendChatMessage(input: {
  content: string;
  model: string;
  agent: string;
  workspace: string;
}): Promise<ChatMessage> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: `m_${Math.random().toString(36).slice(2, 8)}`,
      role: "assistant",
      content: `Got it. Running with **${input.model}** as ${input.agent}.\n\nI'll start with a plan and stream the implementation.`,
      createdAt: new Date().toISOString(),
    };
  }
  return http("/chat/messages", { method: "POST", body: JSON.stringify(input) });
}
export async function getChatSeed(): Promise<ChatMessage[]> {
  if (USE_MOCK) return Promise.resolve(CHAT_SEED);
  return http("/chat/messages");
}

// --- Terminal ---
export async function getTerminalLogs(): Promise<TerminalLine[]> {
  if (USE_MOCK) return Promise.resolve(TERMINAL_SEED);
  return http("/terminal/logs");
}
export async function approveCommand(id: string): Promise<{ ok: true }> {
  if (USE_MOCK) return Promise.resolve({ ok: true });
  return http(`/commands/${id}/approve`, { method: "POST" });
}
export async function rejectCommand(id: string): Promise<{ ok: true }> {
  if (USE_MOCK) return Promise.resolve({ ok: true });
  return http(`/commands/${id}/reject`, { method: "POST" });
}

// --- Files ---
export async function getFiles(): Promise<FileNode> {
  if (USE_MOCK) return Promise.resolve(FILE_TREE);
  return http("/files");
}
export async function getFileContent(path: string): Promise<string> {
  if (USE_MOCK) return Promise.resolve(FILE_CONTENTS[path] ?? `// ${path}\n// (empty)\n`);
  return http(`/files/${encodeURIComponent(path)}/content`);
}
export async function saveFile(path: string, content: string): Promise<{ ok: true }> {
  if (USE_MOCK) {
    FILE_CONTENTS[path] = content;
    return Promise.resolve({ ok: true });
  }
  return http(`/files/${encodeURIComponent(path)}/content`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

// --- Diffs / Tests ---
export async function getDiffs(taskId: string) {
  if (USE_MOCK) return Promise.resolve({ staged: 5, unstaged: 2, taskId });
  return http(`/tasks/${taskId}/diffs`);
}
export interface TestsResult {
  total: number;
  passed: number;
  failed: number;
  taskId: string;
  suites: Array<{ name: string; ms: number; status: "passed" | "failed" }>;
}
export async function getTests(taskId: string): Promise<TestsResult> {
  if (USE_MOCK)
    return Promise.resolve({
      total: 12,
      passed: 12,
      failed: 0,
      taskId,
      suites: [
        { name: "auth.test.js", ms: 345, status: "passed" },
        { name: "user.test.js", ms: 278, status: "passed" },
        { name: "login.test.js", ms: 412, status: "passed" },
        { name: "middleware.test.js", ms: 198, status: "passed" },
        { name: "validation.test.js", ms: 156, status: "passed" },
      ],
    });
  return http(`/tasks/${taskId}/tests`);
}

// --- Providers / Models / Agents / Workspaces ---
export async function getProviders() {
  if (USE_MOCK)
    return Promise.resolve([
      { id: "openai", connected: true },
      { id: "anthropic", connected: true },
      { id: "google", connected: false },
      { id: "deepseek", connected: false },
      { id: "xai", connected: false },
      { id: "mistral", connected: false },
    ]);
  return http("/providers");
}
export async function updateProvider(id: string, patch: Record<string, unknown>) {
  if (USE_MOCK) return Promise.resolve({ ok: true, id, ...patch });
  return http(`/providers/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export async function getModels(): Promise<ModelOption[]> {
  if (USE_MOCK) return Promise.resolve(MODELS);
  return http("/models");
}
export async function switchModel(id: string) {
  if (USE_MOCK) return Promise.resolve({ ok: true, id });
  return http(`/models/${id}/activate`, { method: "POST" });
}
export async function getAgents(): Promise<Agent[]> {
  if (USE_MOCK) return Promise.resolve(AGENTS);
  return http("/agents");
}
export async function updateAgent(id: string, patch: Partial<Agent>) {
  if (USE_MOCK) return Promise.resolve({ ok: true, id, ...patch });
  return http(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export async function getWorkspaces(): Promise<Workspace[]> {
  if (USE_MOCK) return Promise.resolve(WORKSPACES);
  return http("/workspaces");
}
export async function switchWorkspace(id: string) {
  if (USE_MOCK) return Promise.resolve({ ok: true, id });
  return http(`/workspaces/${id}/activate`, { method: "POST" });
}
export async function getNotifications(): Promise<Notification[]> {
  if (USE_MOCK) return Promise.resolve(NOTIFICATIONS);
  return http("/notifications");
}

// --- Realtime ---
export function openLogStream(onLine: (l: TerminalLine) => void): () => void {
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (!wsUrl) {
    // mock streaming
    let i = 0;
    const samples = [
      "[nodemon] restarting due to changes...",
      "[nodemon] starting `node server.js`",
      "Server running on port 3000",
      "GET /api/health 200 4ms",
      "POST /api/auth/login 200 87ms",
    ];
    const h = setInterval(() => {
      onLine({
        id: `live_${i}`,
        stream: "stdout",
        text: samples[i % samples.length],
        ts: new Date().toISOString(),
      });
      i++;
    }, 1800);
    return () => clearInterval(h);
  }
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (ev) => {
    try {
      onLine(JSON.parse(ev.data));
    } catch {}
  };
  return () => ws.close();
}
