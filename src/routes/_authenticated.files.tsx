import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getFiles } from "@/lib/api";
import type { FileNode } from "@/lib/mock-data";
import { AppShell } from "@/components/layout/AppShell";
import { Search, Folder, FileText, ChevronRight, MoreVertical } from "lucide-react";

export const Route = createFileRoute("/_authenticated/files")({
  head: () => ({ meta: [{ title: "Files — Omena Codex" }] }),
  component: FilesPage,
});

function flatten(node: FileNode, depth = 0, acc: Array<FileNode & { depth: number }> = []) {
  acc.push({ ...node, depth });
  if (node.children) for (const c of node.children) flatten(c, depth + 1, acc);
  return acc;
}

function FilesPage() {
  const { data: tree } = useQuery({ queryKey: ["files"], queryFn: getFiles });
  const [q, setQ] = useState("");
  if (!tree)
    return (
      <AppShell>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  const all = flatten(tree).slice(1);
  const filtered = q.trim()
    ? all.filter((n) => n.name.toLowerCase().includes(q.toLowerCase()))
    : all;

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Files</h1>
          <p className="text-xs text-muted-foreground font-mono">{tree.path}</p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-card">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search files…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ul className="mt-4 rounded-xl border border-border bg-card divide-y divide-border">
        {filtered.map((n) => (
          <li key={n.path}>
            {n.type === "file" ? (
              <Link
                to="/files/$"
                params={{ _splat: n.path }}
                className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/40"
                style={{ paddingLeft: 12 + n.depth * 12 }}
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{n.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{n.modified}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ) : (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5"
                style={{ paddingLeft: 12 + n.depth * 12 }}
              >
                <Folder className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{n.name}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
