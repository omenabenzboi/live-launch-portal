import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChatSeed, sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { MODELS, AGENTS, WORKSPACES } from "@/lib/mock-data";
import { AppShell } from "@/components/layout/AppShell";
import { Paperclip, Mic, ArrowUp, ChevronDown, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Omena Codex" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { data: seed = [] } = useQuery({ queryKey: ["chat-seed"], queryFn: getChatSeed });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { modelId, agentId, workspaceId, setModel } = useApp();
  const model = MODELS.find((m) => m.id === modelId)!;
  const agent = AGENTS.find((a) => a.id === agentId)!;
  const workspace = WORKSPACES.find((w) => w.id === workspaceId)!;

  useEffect(() => { if (seed.length && messages.length === 0) setMessages(seed); }, [seed]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`, role: "user", content: input, createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const reply = await sendChatMessage({ content: userMsg.content, model: modelId, agent: agentId, workspace: workspaceId });
      setMessages((m) => [...m, reply]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppShell noPadding>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="mt-12 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-primary/40 bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-3 text-base font-semibold">New conversation</h2>
              <p className="mt-1 text-xs text-muted-foreground">Ask Omena Codex to build, test, or debug.</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
              }`}>
                {m.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" /> Omena Codex
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-3.5 py-2.5">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>
      </AppShell>

      {/* Composer */}
      <div className="fixed bottom-[68px] left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-3 py-2.5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
            <span className="text-foreground">{workspace.name}</span>
            <span>·</span>
            <span>{agent.name}</span>
          </div>
          <div className="rounded-2xl border border-border bg-card px-2.5 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask Omena Codex…"
              rows={1}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-32"
            />
            <div className="flex items-center justify-between gap-2 mt-1">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:border-primary/40">
                  <span className="text-foreground">{model.label}</span>
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
              <div className="flex items-center gap-1.5">
                <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground" aria-label="Attach">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground" aria-label="Voice">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
