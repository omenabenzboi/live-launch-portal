import { create } from "zustand";
import { MODELS, WORKSPACES, AGENTS } from "./mock-data";

// NOTE: `permissions` below are UI hints only. They MUST be re-validated and
// enforced server-side per authenticated user/workspace — never trust these
// flags coming from the client. The UI sends them as part of agent requests
// so the backend can log the user's intent, but the backend is the source of
// truth for what the agent is actually allowed to do.

interface AppState {
  workspaceId: string;
  agentId: string;
  modelId: string;
  permissions: {
    autoApproveSafe: boolean;
    allowNetwork: boolean;
    allowFileWrites: boolean;
  };
  setWorkspace: (id: string) => void;
  setAgent: (id: string) => void;
  setModel: (id: string) => void;
  setPermission: (key: keyof AppState["permissions"], value: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  workspaceId: WORKSPACES[0].id,
  agentId: AGENTS.find((a) => a.active)?.id ?? AGENTS[0].id,
  modelId: MODELS[0].id,
  permissions: { autoApproveSafe: true, allowNetwork: true, allowFileWrites: true },
  setWorkspace: (id) => set({ workspaceId: id }),
  setAgent: (id) => set({ agentId: id }),
  setModel: (id) => set({ modelId: id }),
  setPermission: (key, value) => set((s) => ({ permissions: { ...s.permissions, [key]: value } })),
}));
