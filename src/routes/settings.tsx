import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import { MODELS, AGENTS, WORKSPACES } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Omena Codex" }] }),
  component: SettingsPage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-foreground">{label}</div>
      <div className="text-right text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{title}</h2>
      <div className="rounded-xl border border-border bg-card px-4 divide-y divide-border">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const { workspaceId, agentId, modelId, permissions, setWorkspace, setAgent, setModel, setPermission } = useApp();

  return (
    <AppShell>
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="text-xs text-muted-foreground">Configure workspace & agents</p>

      <Group title="Workspace">
        <Row label="Current Workspace">
          <select
            value={workspaceId}
            onChange={(e) => setWorkspace(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
          >
            {WORKSPACES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Row>
      </Group>

      <Group title="Agent">
        <Row label="Active Agent">
          <select
            value={agentId}
            onChange={(e) => setAgent(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
          >
            {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Row>
        <Row label="Model">
          <select
            value={modelId}
            onChange={(e) => setModel(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
          >
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Row>
      </Group>

      <Group title="Permissions">
        <Row label="Auto-approve safe commands">
          <Switch checked={permissions.autoApproveSafe} onCheckedChange={(v) => setPermission("autoApproveSafe", v)} />
        </Row>
        <Row label="Allow network access">
          <Switch checked={permissions.allowNetwork} onCheckedChange={(v) => setPermission("allowNetwork", v)} />
        </Row>
        <Row label="Allow file writes">
          <Switch checked={permissions.allowFileWrites} onCheckedChange={(v) => setPermission("allowFileWrites", v)} />
        </Row>
      </Group>

      <Group title="Danger Zone">
        <button className="flex items-center justify-between w-full py-3 text-destructive">
          <span className="text-sm">Clear Workspace</span>
          <Trash2 className="h-4 w-4" />
        </button>
      </Group>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">Omena Codex v1.0 · Production Ready</p>
    </AppShell>
  );
}
