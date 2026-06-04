import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTasks, getNotifications, getTerminalLogs } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronRight, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Omena Codex" }] }),
  component: DashboardPage,
});

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`text-2xl font-semibold ${accent ?? "text-foreground"}`}>{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function DashboardPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });
  const { data: logs = [] } = useQuery({ queryKey: ["logs"], queryFn: getTerminalLogs });

  const running = tasks.filter((t) => t.status === "running").length;
  const waiting = tasks.filter((t) => t.status === "waiting").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const failed = tasks.filter((t) => t.status === "failed").length;

  return (
    <AppShell>
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-xs text-muted-foreground">Operator console — all agent activity</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Stat label="Running" value={running} accent="text-primary" />
          <Stat label="Waiting" value={waiting} accent="text-warning" />
          <Stat label="Done" value={completed} />
          <Stat label="Failed" value={failed} accent="text-destructive" />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Active Tasks</h2>
          <Link to="/tasks" className="text-[11px] text-primary hover:underline">View all</Link>
        </div>
        <div className="mt-2 space-y-2">
          {tasks.filter((t) => t.status !== "completed").slice(0, 4).map((t) => (
            <Link
              key={t.id}
              to="/tasks/$id"
              params={{ id: t.id }}
              className="block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{t.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <StatusBadge status={t.status} />
                    <span>•</span>
                    <span>{t.agent}</span>
                    <span>•</span>
                    <span>{t.updatedAt}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${t.progress}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{t.summary.slice(0, 60)}{t.summary.length > 60 ? "…" : ""}</span>
                <span className="font-mono">{t.progress}%</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-sm font-semibold">Recent Terminal</h3>
          </div>
          <pre className="mt-2 max-h-44 overflow-auto scrollbar-thin font-mono text-[11px] leading-relaxed text-muted-foreground">
{logs.slice(-12).map((l) => l.text).join("\n")}
          </pre>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <ul className="mt-2 space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id} className="flex items-start gap-2 text-[12px]">
                {n.kind === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />}
                {n.kind === "warning" && <Clock className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />}
                {n.kind === "danger" && <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                {n.kind === "info" && <Activity className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                <div className="min-w-0">
                  <div className="text-foreground font-medium">{n.title}</div>
                  <div className="text-muted-foreground text-[11px] truncate">{n.body} · {n.at}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
