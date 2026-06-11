import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getTasks } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Omena Codex" }] }),
  component: TasksPage,
});

const FILTERS = ["All", "Running", "Waiting", "Queued", "Completed", "Failed"] as const;

function TasksPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });

  const filtered = tasks.filter(
    (t) =>
      (filter === "All" || t.status.toLowerCase() === filter.toLowerCase()) &&
      (q.trim() === "" || t.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppShell>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight">Tasks</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            <span className="text-foreground/90 font-medium">{filtered.length}</span> active · live
            updates
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-[0_0_16px_-4px] shadow-primary/60 hover:bg-primary/90 active:scale-95 transition">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New Task
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 -mx-1 flex gap-1 overflow-x-auto scrollbar-none px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              filter === f
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((t) => (
          <Link
            key={t.id}
            to="/tasks/$id"
            params={{ id: t.id }}
            className="block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium block truncate">{t.title}</span>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <StatusBadge status={t.status} />
                  <span>•</span>
                  <span>{t.agent}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${t.progress}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>
                {t.workspace} · {t.filesChanged} files · {t.updatedAt}
              </span>
              <span className="font-mono">{t.progress}%</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No tasks match.
          </div>
        )}
      </div>
    </AppShell>
  );
}
