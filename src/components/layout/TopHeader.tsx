import { Bell, ChevronDown, User } from "lucide-react";
import { useApp } from "@/lib/store";
import { MODELS, WORKSPACES, AGENTS, NOTIFICATIONS } from "@/lib/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 rounded-full border border-primary/60 grid place-items-center">
        <div className="absolute inset-1 rounded-full border border-primary/70" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-foreground">Omena Codex</div>
      </div>
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        <Logo />
        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40">
              <span className="hidden xs:inline text-[10px] uppercase tracking-wide">WS</span>
              <span className="text-foreground font-medium max-w-[80px] truncate">{workspace.name}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Active Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {WORKSPACES.map((w) => (
                <DropdownMenuItem key={w.id} onClick={() => setWorkspace(w.id)}>
                  <div className="flex flex-col">
                    <span className="text-sm">{w.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{w.path}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40">
              <span className="text-foreground font-medium max-w-[90px] truncate">{agent.name}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Active Agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AGENTS.map((a) => (
                <DropdownMenuItem key={a.id} onClick={() => setAgent(a.id)}>
                  <div className="flex flex-col">
                    <span className="text-sm">{a.name}</span>
                    <span className="text-[11px] text-muted-foreground">{a.role}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40">
              <span className="text-foreground font-medium max-w-[90px] truncate">{model.label}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MODELS.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => setModel(m.id)}>
                  <span className="text-sm">{m.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-card hover:border-primary/40">
              <Bell className="h-4 w-4 text-muted-foreground" />
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

          <button className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-primary/40">
            <User className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
