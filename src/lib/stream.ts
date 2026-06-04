// Streaming harness for terminal logs.
// - Connects to WebSocket if VITE_WS_URL is set (with exponential-backoff reconnects).
// - Falls back to SSE at `${VITE_API_BASE_URL}/terminal/stream` when only HTTP base is provided.
// - Falls back to a deterministic mock stream in dev/no-backend.
// Returns an unsubscribe that fully tears down sockets and timers.

import type { TerminalLine } from "./mock-data";

export type StreamState = "connecting" | "open" | "reconnecting" | "closed" | "error";

export interface StreamHandlers {
  onLine: (line: TerminalLine) => void;
  onState?: (s: StreamState) => void;
  onError?: (err: unknown) => void;
}

const MOCK_LINES = [
  "[nodemon] restarting due to changes...",
  "[nodemon] starting `node server.js`",
  "Server running on port 3000",
  "GET /api/health 200 4ms",
  "POST /api/auth/login 200 87ms",
  "[worker] processing job batch (12)",
  "PASS  src/auth.test.js (3.41s)",
];

export function openLogStream(handlers: StreamHandlers): () => void {
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (wsUrl) return openWS(wsUrl, handlers);
  if (apiBase) return openSSE(`${apiBase}/terminal/stream`, handlers);
  return openMock(handlers);
}

function openMock(h: StreamHandlers): () => void {
  h.onState?.("open");
  let i = 0;
  const t = setInterval(() => {
    h.onLine({
      id: `live_${i}`,
      stream: i % 9 === 0 ? "stderr" : "stdout",
      text: MOCK_LINES[i % MOCK_LINES.length],
      ts: new Date().toISOString(),
    });
    i++;
  }, 1500);
  return () => {
    clearInterval(t);
    h.onState?.("closed");
  };
}

function openWS(url: string, h: StreamHandlers): () => void {
  let attempt = 0;
  let ws: WebSocket | null = null;
  let stopped = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (stopped) return;
    h.onState?.(attempt === 0 ? "connecting" : "reconnecting");
    try {
      ws = new WebSocket(url);
    } catch (e) {
      h.onError?.(e);
      scheduleRetry();
      return;
    }
    ws.onopen = () => {
      attempt = 0;
      h.onState?.("open");
    };
    ws.onmessage = (ev) => {
      try {
        h.onLine(JSON.parse(ev.data) as TerminalLine);
      } catch (e) {
        h.onError?.(e);
      }
    };
    ws.onerror = (e) => {
      h.onState?.("error");
      h.onError?.(e);
    };
    ws.onclose = () => {
      if (stopped) return;
      scheduleRetry();
    };
  };

  const scheduleRetry = () => {
    if (stopped) return;
    const delay = Math.min(15000, 500 * 2 ** attempt) + Math.random() * 250;
    attempt++;
    retryTimer = setTimeout(connect, delay);
  };

  connect();
  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (ws && ws.readyState <= 1) ws.close();
    h.onState?.("closed");
  };
}

function openSSE(url: string, h: StreamHandlers): () => void {
  let stopped = false;
  let es: EventSource | null = null;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (stopped) return;
    h.onState?.(attempt === 0 ? "connecting" : "reconnecting");
    try {
      es = new EventSource(url, { withCredentials: true });
    } catch (e) {
      h.onError?.(e);
      scheduleRetry();
      return;
    }
    es.onopen = () => {
      attempt = 0;
      h.onState?.("open");
    };
    es.onmessage = (ev) => {
      try {
        h.onLine(JSON.parse(ev.data) as TerminalLine);
      } catch (e) {
        h.onError?.(e);
      }
    };
    es.onerror = (e) => {
      h.onState?.("error");
      h.onError?.(e);
      es?.close();
      scheduleRetry();
    };
  };

  const scheduleRetry = () => {
    if (stopped) return;
    const delay = Math.min(15000, 500 * 2 ** attempt) + Math.random() * 250;
    attempt++;
    retryTimer = setTimeout(connect, delay);
  };

  connect();
  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    es?.close();
    h.onState?.("closed");
  };
}
