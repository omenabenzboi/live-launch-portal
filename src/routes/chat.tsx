import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChatSeed, sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { MODELS, AGENTS, WORKSPACES } from "@/lib/mock-data";
import { AppShell } from "@/components/layout/AppShell";
import { Paperclip, Mic, ArrowUp, ChevronDown, Hexagon, Plus, Globe, Wrench } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Omena Codex" }] }),
  component: ChatPage,
});

const QUICK = [
  "Implement JWT login API",
  "Review failed E2E test",
  "Refactor checkout flow",
];

function ChatPage() {
  const { data: seed = [] } = useQuery({ queryKey: ["chat-seed"], queryFn: getChatSeed });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { modelId, agentId, workspaceId, setModel } = useApp();
  const model = MODELS.find((m) => m.id === modelId)!;
  const agent = AGENTS.find((a) => a.id === agentId)!;
  const workspace = WORKSPACES.find((w) => w.id === workspaceId)!;

  useEffect(() => { if (seed.length && messages.length === 0) setMessages(seed); }, [seed]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);
  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(140, ta.scrollHeight) + "px";
  }, [input]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    const userMsg: ChatMessage = { id: `m_${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const reply = await sendChatMessage({ content, model: modelId, agent: agentId, workspace: workspaceId });
      setMessages((m) => [...m, reply]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <AppShell noPadding>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 pt-3 space-y-4"
          style={{ paddingBottom: "calc(168px + env(safe-area-inset-bottom))" }}
        >
          {messages.length === 0 && (
            <div className="mt-10 mx-auto max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 shadow-[0_0_40px_-8px] shadow-primary/40">
                <Hexagon className="h-7 w-7 text-primary" strokeWidth={1.6} />
              </div>
              <h2 className="mt-4 text-[20px] font-semibold tracking-tight">How can I help you ship?</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Ask the {agent.name.toLowerCase()} to plan, build, test, or debug across {workspace.name}.
              </p>
              <div className="mt-5 grid gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 text-left text-[13px] text-foreground hover:border-primary/40 transition active:scale-[0.99]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[14px] leading-relaxed text-primary-foreground whitespace-pre-wrap font-medium">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[92%] text-[14px] leading-relaxed text-foreground/95 whitespace-pre-wrap">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-primary/90">
                    <Hexagon className="h-3 w-3" /> Omena Codex
                  </div>
                  {m.content}
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="text-[12px] text-muted-foreground inline-flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
                </span>
                Thinking…
              </div>
            </div>
          )}
        </div>
      </AppShell>

      {/* Composer */}
      <div
        className="fixed left-0 right-0 z-30 bg-gradient-to-t from-background via-background/95 to-background/0"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-2xl px-3 pt-6 pb-3">
          {/* Context strip */}
          <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-mono">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-2 py-0.5 text-foreground/85">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/80" />
              {workspace.name}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="rounded-full border border-border/70 bg-card/60 px-2 py-0.5 text-foreground/85">{agent.name}</span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] focus-within:border-primary/50 transition-colors">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask Omena Codex to build, test, or debug…"
              rows={1}
              className="w-full resize-none bg-transparent px-2.5 pt-1.5 pb-1 text-[14.5px] leading-relaxed outline-none placeholder:text-muted-foreground/80"
            />
            <div className="flex items-center gap-1 pt-1">
              <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Attach">
                <Plus className="h-4 w-4" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Tools">
                <Wrench className="h-4 w-4" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Browse">
                <Globe className="h-4 w-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-0.5 inline-flex items-center gap-1 rounded-lg border border-border/70 bg-secondary/40 px-2 py-1 text-[11px] text-foreground hover:border-primary/40">
                  <span className="font-mono uppercase tracking-wider text-[10px] text-primary">{model.label}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {MODELS.map((m) => (
                    <DropdownMenuItem key={m.id} onClick={() => setModel(m.id)}>{m.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="ml-auto flex items-center gap-1">
                <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60" aria-label="Voice">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || sending}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_18px_-2px] shadow-primary/50 hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none active:scale-95 transition"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
