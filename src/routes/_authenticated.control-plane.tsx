import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { ChevronLeft, ChevronRight, Database, HardDrive, Plug, Briefcase, Cpu, Server } from "lucide-react";
import { listProviders } from "@/lib/providers.functions";
import { listServers } from "@/lib/servers.functions";
import {
  listDatabases,
  listStorage,
  listIntegrations,
  listWorkspaces,
} from "@/lib/control-plane.functions";

export const Route = createFileRoute("/_authenticated/control-plane")({
  head: () => ({ meta: [{ title: "Control Plane — Omena Codex" }] }),
  component: ControlPlanePage,
});

function ControlPlanePage() {
  const providers = useQuery({ queryKey: ["providers"], queryFn: useServerFn(listProviders) });
  const servers = useQuery({ queryKey: ["servers"], queryFn: useServerFn(listServers) });
  const databases = useQuery({ queryKey: ["databases"], queryFn: useServerFn(listDatabases) });
  const storage = useQuery({ queryKey: ["storage"], queryFn: useServerFn(listStorage) });
  const integrations = useQuery({ queryKey: ["integrations"], queryFn: useServerFn(listIntegrations) });
  const workspaces = useQuery({ queryKey: ["workspaces-cp"], queryFn: useServerFn(listWorkspaces) });

  const sections: {
    icon: typeof Server;
    label: string;
    hint: string;
    to: string;
    count: number;
  }[] = [
    {
      icon: Cpu,
      label: "AI Providers",
      hint: "OpenAI, Anthropic, Gemini, OpenRouter, Ollama, custom",
      to: "/settings",
      count: providers.data?.providers.length ?? 0,
    },
    {
      icon: Server,
      label: "Servers",
      hint: "Remote-agent daemons, modes, health",
      to: "/servers",
      count: servers.data?.servers.length ?? 0,
    },
    {
      icon: Briefcase,
      label: "Workspaces",
      hint: "Roots, allowed paths, permissions, active provider",
      to: "/control-plane",
      count: workspaces.data?.workspaces.length ?? 0,
    },
    {
      icon: Database,
      label: "Databases",
      hint: "Postgres, Neon, RDS, MySQL, custom (server-side only)",
      to: "/control-plane",
      count: databases.data?.databases.length ?? 0,
    },
    {
      icon: HardDrive,
      label: "Storage backends",
      hint: "Supabase, S3, R2, Vercel Blob, local, custom-S3",
      to: "/control-plane",
      count: storage.data?.storage.length ?? 0,
    },
    {
      icon: Plug,
      label: "API integrations",
      hint: "External HTTP APIs exposed to agents",
      to: "/control-plane",
      count: integrations.data?.integrations.length ?? 0,
    },
  ];

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Link to="/settings" className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/60 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight leading-tight">Control Plane</h1>
          <p className="text-[12px] text-muted-foreground">
            Foundation for providers, servers, workspaces, databases, storage, and integrations.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-300">
        M4 foundation — schemas, server functions, and validation stubs are wired. Real DB/storage
        probes and per-section CRUD UIs land in M5. All secrets stay server-side.
      </div>

      <div className="mt-3 space-y-2.5">
        {sections.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-3.5 py-3 active:bg-secondary/40 transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/60">
              <s.icon className="h-4 w-4 text-foreground/80" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium">{s.label}</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-border/60 text-muted-foreground">
                  {s.count}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground truncate">{s.hint}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
