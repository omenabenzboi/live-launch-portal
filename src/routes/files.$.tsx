import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getFileContent, saveFile } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/files/$")({
  head: () => ({ meta: [{ title: "File — Omena Codex" }] }),
  component: FileViewer,
});

function FileViewer() {
  const { _splat } = Route.useParams();
  const path = _splat ?? "";
  const { data } = useQuery({ queryKey: ["file", path], queryFn: () => getFileContent(path), enabled: !!path });
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const qc = useQueryClient();
  const saveMut = useMutation({
    mutationFn: () => saveFile(path, content),
    onSuccess: () => {
      setOriginal(content);
      qc.invalidateQueries({ queryKey: ["file", path] });
      toast.success("File saved");
    },
  });
  useEffect(() => { if (data !== undefined) { setContent(data); setOriginal(data); } }, [data]);

  const dirty = content !== original;
  const segments = path.split("/").filter(Boolean);
  const name = segments[segments.length - 1] ?? "file";

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Link to="/files" className="grid h-8 w-8 place-items-center rounded-md hover:bg-card">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-mono truncate">{name}</span>
          {dirty && (
            <span className="text-[10px] uppercase tracking-wide text-warning ml-1">Modified</span>
          )}
        </div>
        <button
          onClick={() => saveMut.mutate()}
          disabled={!dirty || saveMut.isPending}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      </div>

      <nav className="mt-2 text-[11px] text-muted-foreground font-mono truncate">
        {segments.map((s: string, i: number) => (
          <span key={i}>{s}{i < segments.length - 1 ? " / " : ""}</span>
        ))}
      </nav>

      <div className="mt-3 rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border">
          <div className="select-none py-2 px-2 font-mono text-[11px] text-muted-foreground/60 border-r border-border">
            {content.split("\n").map((_: string, i: number) => (
              <div key={i} className="text-right pr-1.5">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-transparent font-mono text-[12px] leading-[1.5rem] p-2 outline-none resize-none min-h-[60vh]"
          />
        </div>
      </div>
    </AppShell>
  );
}
