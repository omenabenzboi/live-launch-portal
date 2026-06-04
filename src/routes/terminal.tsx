import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTerminalLogs, getTasks } from "@/lib/api";
import { openLogStream, type StreamState } from "@/lib/stream";
import type { TerminalLine } from "@/lib/mock-data";
import { AppShell } from "@/components/layout/AppShell";
import { Copy, Trash2, ChevronDown, Circle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/terminal")({
  head: () => ({ meta: [{ title: "Terminal — Omena Codex" }] }),
  component: TerminalPage,
});

function TerminalPage() {
  const { data: seed = [] } = useQuery({ queryKey: ["term-seed"], queryFn: getTerminalLogs });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [taskId, setTaskId] = useState<string>("main");
  const [streamState, setStreamState] = useState<StreamState>("connecting");
  const scrollRef = useRef<HTMLPreElement>(null);

  useEffect(() => { setLines(seed); }, [seed]);
  useEffect(() => {
    const close = openLogStream({
      onLine: (l) => setLines((prev) => [...prev, l].slice(-500)),
      onState: setStreamState,
    });
    return close;
  }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);

  const currentTask = tasks.find((t) => t.id === taskId);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:border-primary/40">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-foreground font-medium">{currentTask?.title ?? "Main Process"}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setTaskId("main")}>Main Process</DropdownMenuItem>
            {tasks.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setTaskId(t.id)}>{t.title}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigator.clipboard.writeText(lines.map((l) => l.text).join("\n"))}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] hover:border-primary/40"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
          <button
            onClick={() => setLines([])}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] hover:border-destructive/40"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <Circle className="h-2.5 w-2.5 fill-destructive text-destructive" />
          <Circle className="h-2.5 w-2.5 fill-warning text-warning" />
          <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
          <span className="ml-2 text-[11px] text-muted-foreground font-mono">~ / omenacore</span>
          <span className={`ml-auto text-[10px] uppercase tracking-wide ${streamState === "open" ? "text-primary" : streamState === "error" ? "text-destructive" : "text-warning"}`}>{streamState}</span>
        </div>
        <pre
          ref={scrollRef}
          className="font-mono text-[12px] leading-relaxed p-3 h-[60vh] overflow-auto scrollbar-thin"
        >
{lines.map((l) => (
  <span key={l.id} className={`block ${l.stream === "stderr" ? "text-destructive" : l.text.startsWith("$") ? "text-primary" : l.text.startsWith("PASS") ? "text-primary" : l.text.startsWith("FAIL") ? "text-destructive" : "text-muted-foreground"}`}>
    {l.text || "\u00a0"}
  </span>
))}
          <span className="inline-block w-2 h-3.5 bg-primary animate-pulse align-middle" />
        </pre>
      </div>
    </AppShell>
  );
}
