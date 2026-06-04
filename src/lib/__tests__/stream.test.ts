import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openLogStream } from "../stream";

class MockWS {
  static instances: MockWS[] = [];
  onopen?: () => void;
  onmessage?: (e: { data: string }) => void;
  onclose?: () => void;
  onerror?: (e: unknown) => void;
  readyState = 0;
  url: string;
  constructor(url: string) {
    this.url = url;
    MockWS.instances.push(this);
    queueMicrotask(() => {
      this.readyState = 1;
      this.onopen?.();
    });
  }
  send() {}
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
  emit(line: object) {
    this.onmessage?.({ data: JSON.stringify(line) });
  }
  fail() {
    this.onerror?.(new Error("boom"));
    this.close();
  }
}

describe("openLogStream (WS)", () => {
  beforeEach(() => {
    MockWS.instances = [];
    vi.stubGlobal("WebSocket", MockWS as unknown as typeof WebSocket);
    vi.stubEnv("VITE_WS_URL", "ws://localhost:9999/logs");
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("connects, receives lines, and exposes state", async () => {
    const onLine = vi.fn();
    const onState = vi.fn();
    const stop = openLogStream({ onLine, onState });
    await vi.runOnlyPendingTimersAsync();
    expect(onState).toHaveBeenCalledWith("open");
    MockWS.instances[0].emit({ id: "1", stream: "stdout", text: "hello", ts: "" });
    expect(onLine).toHaveBeenCalledWith(expect.objectContaining({ text: "hello" }));
    stop();
    expect(onState).toHaveBeenCalledWith("closed");
  });

  it("reconnects with backoff after failure", async () => {
    const onState = vi.fn();
    const stop = openLogStream({ onLine: vi.fn(), onState });
    await vi.runOnlyPendingTimersAsync();
    MockWS.instances[0].fail();
    expect(onState).toHaveBeenCalledWith("error");
    await vi.advanceTimersByTimeAsync(2000);
    expect(MockWS.instances.length).toBeGreaterThanOrEqual(2);
    stop();
  });
});
