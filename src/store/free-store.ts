"use client";

import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";

// Free-form canvas objects (stickies, text, shapes, frames) that live beside the swimlane diagram.
// ponytail: no undo/redo for these yet; Ctrl+Z only covers the swimlane. Add a history stack when needed.

export type Tool = "sticky" | "text" | "rect" | "ellipse" | "diamond" | "frame" | "kanban";

export interface KanbanCol {
  id: string;
  title: string;
  cards: { id: string; text: string }[];
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const STICKY_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];

const DEFAULTS: Record<Tool, { type: string; data: Record<string, unknown>; w?: number; h?: number }> = {
  sticky: { type: "sticky", data: { text: "New note", color: STICKY_COLORS[0] }, w: 160, h: 160 },
  text: { type: "text", data: { text: "Text" } },
  rect: { type: "shape", data: { text: "", shape: "rect", color: "#ffffff" }, w: 140, h: 80 },
  ellipse: { type: "shape", data: { text: "", shape: "ellipse", color: "#ffffff" }, w: 140, h: 80 },
  diamond: { type: "shape", data: { text: "", shape: "diamond", color: "#ffffff" }, w: 140, h: 100 },
  frame: { type: "frame", data: { text: "Frame" }, w: 400, h: 300 },
  kanban: {
    type: "kanban",
    data: {
      title: "Kanban board",
      columns: [
        { id: "col-todo", title: "To do", cards: [{ id: "c-1", text: "First task" }] },
        { id: "col-doing", title: "In progress", cards: [] },
        { id: "col-done", title: "Done", cards: [] },
      ],
    },
  },
};

export const isFreeId = (id: string) => id.startsWith("f-");

let seq = 0;
const newId = (p: string) => `${p}-${Date.now()}-${seq++}`;

const hydrate = (n: Node): Node => ({ ...n, selected: false, zIndex: n.type === "frame" ? -1 : undefined });

export function snapshotOf(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map(({ id, type, position, data, width, height }) => ({ id, type, position, data, width, height })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
      id, source, target, sourceHandle, targetHandle,
    })),
  };
}

interface FreeStore {
  nodes: Node[];
  edges: Edge[];
  tool: Tool | null;
  clipboard: Node[];
  setTool: (t: Tool | null) => void;
  place: (pos: { x: number; y: number }) => void;
  applyNodeChanges: (c: NodeChange[]) => void;
  applyEdgeChanges: (c: EdgeChange[]) => void;
  update: (id: string, patch: Record<string, unknown>) => void;
  connect: (c: Connection) => void;
  copy: () => void;
  paste: () => void;
  removeSelected: () => void;
  load: (free?: { nodes: Node[]; edges: Edge[] }) => void;
}

export const useFreeStore = create<FreeStore>((set, get) => ({
  nodes: [],
  edges: [],
  tool: null,
  clipboard: [],

  setTool: (tool) => set({ tool }),

  place: (pos) => {
    const { tool, nodes } = get();
    if (!tool) return;
    const d = DEFAULTS[tool];
    const node: Node = hydrate({
      id: newId("f"),
      type: d.type,
      position: { x: pos.x - (d.w ?? 60) / 2, y: pos.y - (d.h ?? 20) / 2 },
      data: { ...d.data },
      width: d.w,
      height: d.h,
    });
    set({ nodes: [...nodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }], tool: null });
  },

  applyNodeChanges: (c) => set({ nodes: applyNodeChanges(c, get().nodes) }),
  applyEdgeChanges: (c) => set({ edges: applyEdgeChanges(c, get().edges) }),

  update: (id, patch) =>
    set({ nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) }),

  connect: (c) => {
    if (!c.source || !c.target || c.source === c.target) return;
    set({
      edges: [
        ...get().edges,
        {
          id: newId("fe"),
          source: c.source,
          target: c.target,
          sourceHandle: c.sourceHandle,
          targetHandle: c.targetHandle,
        },
      ],
    });
  },

  copy: () => set({ clipboard: get().nodes.filter((n) => n.selected) }),

  paste: () => {
    const { clipboard, nodes } = get();
    if (!clipboard.length) return;
    const copies = clipboard.map((n) => ({
      ...n,
      id: newId("f"),
      position: { x: n.position.x + 30, y: n.position.y + 30 },
      selected: true,
    }));
    // Shift the clipboard so repeated pastes keep cascading.
    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...copies],
      clipboard: copies.map((n) => ({ ...n, selected: false })),
    });
  },

  removeSelected: () => {
    const { nodes, edges } = get();
    const gone = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    set({
      nodes: nodes.filter((n) => !gone.has(n.id)),
      edges: edges.filter((e) => !e.selected && !gone.has(e.source) && !gone.has(e.target)),
    });
  },

  load: (free) => set({ nodes: (free?.nodes ?? []).map(hydrate), edges: free?.edges ?? [], tool: null }),
}));
