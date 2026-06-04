import { describe, it, expect } from "vitest";
import { getTasks, sendChatMessage, approveCommand, getTests } from "../api";

describe("api (mock fallback)", () => {
  it("returns seeded tasks", async () => {
    const tasks = await getTasks();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("sends chat messages and gets an assistant reply", async () => {
    const reply = await sendChatMessage({
      content: "ping",
      model: "gpt-5",
      agent: "backend",
      workspace: "omenacore",
    });
    expect(reply.role).toBe("assistant");
    expect(reply.content.length).toBeGreaterThan(0);
  });

  it("approves commands", async () => {
    const res = await approveCommand("cmd_1");
    expect(res.ok).toBe(true);
  });

  it("returns test suite results", async () => {
    const r = await getTests("t_1");
    expect(r.total).toBeGreaterThan(0);
    expect(r.passed + r.failed).toBe(r.total);
  });
});
