import type { TaskStatus } from "@/lib/mock-data";

const styles: Record<TaskStatus, string> = {
  running: "bg-primary/15 text-primary border-primary/30",
  waiting: "bg-warning/15 text-warning border-warning/30",
  queued: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/10 text-primary border-primary/25",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
