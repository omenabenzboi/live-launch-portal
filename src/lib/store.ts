import { create } from "zustand";
import { MODELS, WORKSPACES, AGENTS } from "./mock-data";

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
  setPermission: (key, value) =>
    set((s) => ({ permissions: { ...s.permissions, [key]: value } })),
}));
