import { Bell, ChevronDown, User, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { MODELS, WORKSPACES, AGENTS, NOTIFICATIONS } from "@/lib/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Mark() {
  return (
    <div className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/50">
      <div className="absolute inset-[5px] rounded-full border border-primary/60" />
      <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
    </div>
  );
}

export function TopHeader() {
  const { workspaceId, agentId, modelId, setWorkspace, setAgent, setModel } = useApp();
  const workspace = WORKSPACES.find((w) => w.id === workspaceId)!;
  const agent = AGENTS.find((a) => a.id === agentId)!;
  const model = MODELS.find((m) => m.id === modelId)!;
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 min-w-0">
        <Mark />
        {/* Unified context pill: workspace + agent + model in one tappable control */}
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 hover:border-primary/40 active:scale-[0.99] transition">
            <div className="min-w-0 flex-1 text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">{workspace.name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="truncate text-[11px] text-muted-foreground">{agent.name}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/80" />
                <span className="text-[10px] uppercase tracking-wider text-primary font-mono">{model.label}</span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</DropdownMenuLabel>
            {WORKSPACES.map((w) => (
              <DropdownMenuItem key={w.id} onClick={() => setWorkspace(w.id)} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">{w.name}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{w.path}</span>
                </div>
                {w.id === workspaceId && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Agent</DropdownMenuLabel>
            {AGENTS.map((a) => (
              <DropdownMenuItem key={a.id} onClick={() => setAgent(a.id)} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">{a.name}</span>
                  <span className="text-[11px] text-muted-foreground">{a.role}</span>
                </div>
                {a.id === agentId && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</DropdownMenuLabel>
            {MODELS.map((m) => (
              <DropdownMenuItem key={m.id} onClick={() => setModel(m.id)} className="flex items-center justify-between">
                <span className="text-sm">{m.label}</span>
                {m.id === modelId && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card/80 hover:border-primary/40">
            <Bell className="h-4 w-4 text-foreground/80" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2">
                <div className="flex w-full items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    n.kind === "success" ? "bg-primary" :
                    n.kind === "warning" ? "bg-warning" :
                    n.kind === "danger" ? "bg-destructive" : "bg-muted-foreground"
                  }`} />
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{n.at}</span>
                </div>
                <span className="text-[11px] text-muted-foreground pl-3.5">{n.body}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card/80 hover:border-primary/40" aria-label="Profile">
          <User className="h-4 w-4 text-foreground/80" />
        </button>
      </div>
    </header>
  );
}
