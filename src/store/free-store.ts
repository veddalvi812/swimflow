"use client";

import { create } from "zustand";
import { record, registerHistory, clearHistory } from "./history";
import { buildFlowchart, STARTER_FLOW, type FlowSpec } from "@/lib/flowchart";
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
// Undo/redo: snapshots of {nodes, edges}, ordered against the swimlane via store/history.ts.

export type Tool =
  | "sticky" | "text" | "rect" | "ellipse" | "diamond" | "hexagon" | "parallelogram" | "triangle" | "star"
  | "cylinder" | "document" | "cloud" | "frame" | "kanban" | "timeline" | "table" | "flowchart" | "pen" | "arrow";

export interface KanbanCol {
  id: string;
  title: string;
  cards: { id: string; text: string }[];
}

export interface TimelineItem {
  id: string;
  date: string;
  text: string;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const STICKY_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];

const DEFAULTS: Record<Exclude<Tool, "flowchart" | "pen" | "arrow">, { type: string; data: Record<string, unknown>; w?: number; h?: number }> = {
  sticky: { type: "sticky", data: { text: "New note", color: STICKY_COLORS[0] }, w: 160, h: 160 },
  text: { type: "text", data: { text: "Text" } },
  rect: { type: "shape", data: { text: "", shape: "rect", color: "#ffffff" }, w: 140, h: 80 },
  ellipse: { type: "shape", data: { text: "", shape: "ellipse", color: "#ffffff" }, w: 140, h: 80 },
  diamond: { type: "shape", data: { text: "", shape: "diamond", color: "#ffffff" }, w: 140, h: 100 },
  hexagon: { type: "shape", data: { text: "", shape: "hexagon", color: "#ffffff" }, w: 140, h: 90 },
  parallelogram: { type: "shape", data: { text: "", shape: "parallelogram", color: "#ffffff" }, w: 160, h: 80 },
  triangle: { type: "shape", data: { text: "", shape: "triangle", color: "#ffffff" }, w: 120, h: 110 },
  star: { type: "shape", data: { text: "", shape: "star", color: "#fef08a" }, w: 120, h: 120 },
  cylinder: { type: "shape", data: { text: "", shape: "cylinder", color: "#ffffff" }, w: 110, h: 130 },
  document: { type: "shape", data: { text: "", shape: "document", color: "#ffffff" }, w: 140, h: 110 },
  cloud: { type: "shape", data: { text: "", shape: "cloud", color: "#ffffff" }, w: 160, h: 110 },
  frame: { type: "frame", data: { text: "Frame" }, w: 400, h: 300 },
  table: {
    type: "table",
    data: {
      title: "Table",
      headers: ["Name", "Owner", "Status"],
      rows: [
        ["Task one", "", "Open"],
        ["Task two", "", "Open"],
      ],
    },
  },
  timeline: {
    type: "timeline",
    data: {
      title: "Timeline",
      items: [
        { id: "t-1", date: "Jan", text: "Kickoff" },
        { id: "t-2", date: "Feb", text: "Build" },
        { id: "t-3", date: "Mar", text: "Launch" },
      ],
    },
  },
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

// Who is placing objects; stickies show it. Set from the signed-in user, empty for guests.
let author = "";
export const setAuthor = (name: string) => {
  author = name;
};

export const isFreeId = (id: string) => id.startsWith("f-");

let seq = 0;
const newId = (p: string) => `${p}-${Date.now()}-${seq++}`;

const hydrate = (n: Node): Node => ({
  ...n,
  selected: false,
  zIndex: n.type === "frame" ? -1 : undefined,
  draggable: n.data?.locked ? false : undefined,
});

export function snapshotOf(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map(({ id, type, position, data, width, height }) => ({ id, type, position, data, width, height })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle, label, type, data }) => ({
      id, source, target, sourceHandle, targetHandle, label, type, data,
    })),
  };
}

type Snap = { nodes: Node[]; edges: Edge[] };
const MAX_HISTORY = 50;

interface FreeStore {
  _past: Snap[];
  _future: Snap[];
  undo: () => void;
  redo: () => void;
  replace: (free?: { nodes: Node[]; edges: Edge[] }) => void;
  nodes: Node[];
  edges: Edge[];
  tool: Tool | null;
  clipboard: Node[];
  setTool: (t: Tool | null) => void;
  place: (pos: { x: number; y: number }) => void;
  addFlowchart: (spec: FlowSpec, pos: { x: number; y: number }) => void;
  addBlock: (
    type: string,
    data: Record<string, unknown>,
    pos: { x: number; y: number },
    opts?: { w?: number; h?: number; fixed?: boolean; keepTool?: boolean }
  ) => void;
  selectAll: () => void;
  nudge: (dx: number, dy: number) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  setLocked: (locked: boolean) => void;
  align: (kind: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distribute: (axis: "x" | "y") => void;
  updateEdge: (id: string, patch: { label?: string; type?: string; data?: Record<string, unknown> }) => void;
  reconnect: (id: string, c: Connection) => void;
  applyNodeChanges: (c: NodeChange[]) => void;
  applyEdgeChanges: (c: EdgeChange[]) => void;
  update: (id: string, patch: Record<string, unknown>) => void;
  connect: (c: Connection) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  copy: () => void;
  paste: () => void;
  removeSelected: () => void;
  load: (free?: { nodes: Node[]; edges: Edge[] }) => void;
}

export const useFreeStore = create<FreeStore>((set, get) => {
  // Pushes the current state onto the undo stack. Repeated saves with the same key inside `windowMs`
  // (typing in a field, one delete touching nodes and edges) collapse into a single undo step.
  let lastKey = "";
  let lastAt = 0;
  let gesture = false;
  const save = (key = "", windowMs = 0) => {
    const now = Date.now();
    const merge = key !== "" && key === lastKey && now - lastAt < windowMs;
    lastKey = key;
    lastAt = now;
    if (merge) return;
    const { nodes, edges, _past } = get();
    set({ _past: [..._past.slice(-(MAX_HISTORY - 1)), { nodes, edges }], _future: [] });
    record("f");
  };

  return {
  _past: [],
  _future: [],

  undo: () => {
    const { _past, _future, nodes, edges } = get();
    const prev = _past[_past.length - 1];
    if (!prev) return;
    set({ ...prev, _past: _past.slice(0, -1), _future: [..._future, { nodes, edges }] });
  },

  redo: () => {
    const { _past, _future, nodes, edges } = get();
    const next = _future[_future.length - 1];
    if (!next) return;
    set({ ...next, _past: [..._past, { nodes, edges }], _future: _future.slice(0, -1) });
  },

  nodes: [],
  edges: [],
  tool: null,
  clipboard: [],

  setTool: (tool) => set({ tool }),

  place: (pos) => {
    const { tool, nodes } = get();
    if (!tool) return;
    if (tool === "flowchart") return get().addFlowchart(STARTER_FLOW, pos);
    if (tool === "pen" || tool === "arrow") return;
    const d = DEFAULTS[tool];
    save();
    const node: Node = hydrate({
      id: newId("f"),
      type: d.type,
      position: { x: pos.x - (d.w ?? 60) / 2, y: pos.y - (d.h ?? 20) / 2 },
      data: { ...d.data, ...(author ? { author } : {}) },
      width: d.w,
      height: d.h,
    });
    set({ nodes: [...nodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }], tool: null });
  },

  // Drops an object centered on `pos`. `fixed` also pins its size; otherwise it sizes to its content.
  addBlock: (type, data, pos, opts = {}) => {
    save();
    const { w = 600, h = 240, fixed = false, keepTool = false } = opts;
    const node = hydrate({
      id: newId("f"),
      type,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      data: { ...data, ...(author && type === "sticky" ? { author } : {}) },
      ...(fixed ? { width: w, height: h } : {}),
    });
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }],
      ...(keepTool ? {} : { tool: null }),
    });
  },

  selectAll: () => set({ nodes: get().nodes.map((n) => ({ ...n, selected: true })) }),

  nudge: (dx, dy) => {
    const movable = (n: Node) => n.selected && !n.data?.locked;
    if (!get().nodes.some(movable)) return;
    save("nudge", 600);
    set({ nodes: get().nodes.map((n) => (movable(n) ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)) });
  },

  bringToFront: () => {
    const { nodes } = get();
    save();
    set({ nodes: [...nodes.filter((n) => !n.selected), ...nodes.filter((n) => n.selected)] });
  },

  sendToBack: () => {
    const { nodes } = get();
    save();
    set({ nodes: [...nodes.filter((n) => n.selected), ...nodes.filter((n) => !n.selected)] });
  },

  setLocked: (locked) => {
    save();
    set({
      nodes: get().nodes.map((n) =>
        n.selected ? { ...n, draggable: locked ? false : undefined, data: { ...n.data, locked } } : n
      ),
    });
  },

  align: (kind) => {
    const sel = get().nodes.filter((n) => n.selected && !n.data?.locked);
    if (sel.length < 2) return;
    const box = (n: Node) => ({ w: n.measured?.width ?? n.width ?? 0, h: n.measured?.height ?? n.height ?? 0 });
    const minX = Math.min(...sel.map((n) => n.position.x));
    const maxX = Math.max(...sel.map((n) => n.position.x + box(n).w));
    const minY = Math.min(...sel.map((n) => n.position.y));
    const maxY = Math.max(...sel.map((n) => n.position.y + box(n).h));
    save();
    set({
      nodes: get().nodes.map((n) => {
        if (!n.selected || n.data?.locked) return n;
        const { w, h } = box(n);
        const p = { ...n.position };
        if (kind === "left") p.x = minX;
        if (kind === "center") p.x = (minX + maxX) / 2 - w / 2;
        if (kind === "right") p.x = maxX - w;
        if (kind === "top") p.y = minY;
        if (kind === "middle") p.y = (minY + maxY) / 2 - h / 2;
        if (kind === "bottom") p.y = maxY - h;
        return { ...n, position: p };
      }),
    });
  },

  // Spreads three or more selected objects so the gaps between them are equal.
  distribute: (axis) => {
    const sel = get().nodes.filter((n) => n.selected && !n.data?.locked);
    if (sel.length < 3) return;
    const size = (n: Node) => (axis === "x" ? n.measured?.width ?? n.width ?? 0 : n.measured?.height ?? n.height ?? 0);
    const at = (n: Node) => (axis === "x" ? n.position.x : n.position.y);
    const sorted = [...sel].sort((a, b) => at(a) - at(b));
    const first = at(sorted[0]);
    const last = at(sorted[sorted.length - 1]) + size(sorted[sorted.length - 1]);
    const gap = (last - first - sorted.reduce((sum, n) => sum + size(n), 0)) / (sorted.length - 1);
    const target = new Map<string, number>();
    let cursor = first;
    for (const n of sorted) {
      target.set(n.id, cursor);
      cursor += size(n) + gap;
    }
    save();
    set({
      nodes: get().nodes.map((n) =>
        target.has(n.id) ? { ...n, position: axis === "x" ? { x: target.get(n.id)!, y: n.position.y } : { x: n.position.x, y: target.get(n.id)! } } : n
      ),
    });
  },

  updateEdge: (id, patch) => {
    save(`e:${id}`, 1000);
    set({
      edges: get().edges.map((e) =>
        e.id === id
          ? {
              ...e,
              ...(patch.label !== undefined ? { label: patch.label } : {}),
              ...(patch.type ? { type: patch.type } : {}),
              data: { ...e.data, ...patch.data },
            }
          : e
      ),
    });
  },

  reconnect: (id, c) => {
    if (!c.source || !c.target || c.source === c.target) return;
    save();
    set({
      edges: get().edges.map((e) =>
        e.id === id
          ? { ...e, source: c.source, target: c.target, sourceHandle: c.sourceHandle, targetHandle: c.targetHandle }
          : e
      ),
    });
  },

  addFlowchart: (spec, pos) => {
    save();
    const built = buildFlowchart(spec, pos);
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), ...built.nodes],
      edges: [...get().edges, ...built.edges],
      tool: null,
    });
  },

  applyNodeChanges: (c) => {
    const starts = c.some((x) => (x.type === "position" && x.dragging) || (x.type === "dimensions" && x.resizing));
    const ends = c.some((x) => (x.type === "position" && x.dragging === false) || (x.type === "dimensions" && x.resizing === false));
    if (c.some((x) => x.type === "remove")) save("rm", 100);
    else if (starts && !gesture) save();
    if (starts) gesture = true;
    if (ends) gesture = false;
    set({ nodes: applyNodeChanges(c, get().nodes) });
  },
  applyEdgeChanges: (c) => {
    if (c.some((x) => x.type === "remove")) save("rm", 100);
    set({ edges: applyEdgeChanges(c, get().edges) });
  },

  update: (id, patch) => {
    save(`u:${id}`, 1000);
    set({ nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) });
  },

  connect: (c) => {
    if (!c.source || !c.target || c.source === c.target) return;
    save();
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

  remove: (id) => {
    save();
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  duplicate: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    save();
    const copy = { ...node, id: newId("f"), position: { x: node.position.x + 30, y: node.position.y + 30 }, selected: true };
    set({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), copy] });
  },

  copy: () => set({ clipboard: get().nodes.filter((n) => n.selected) }),

  paste: () => {
    const { clipboard, nodes } = get();
    if (!clipboard.length) return;
    save();
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
    if (!nodes.some((n) => n.selected) && !edges.some((e) => e.selected)) return;
    save();
    const gone = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    set({
      nodes: nodes.filter((n) => !gone.has(n.id)),
      edges: edges.filter((e) => !e.selected && !gone.has(e.source) && !gone.has(e.target)),
    });
  },

  // Undoable swap of the whole canvas (JSON panel apply).
  replace: (free) => {
    save();
    set({ nodes: (free?.nodes ?? []).map(hydrate), edges: free?.edges ?? [], tool: null });
  },

  // Hard reset when a board is opened or closed: nothing before this point can be undone.
  load: (free) => {
    set({ nodes: (free?.nodes ?? []).map(hydrate), edges: free?.edges ?? [], tool: null, _past: [], _future: [] });
    clearHistory();
  },
  };
});

registerHistory("f", {
  undo: () => useFreeStore.getState().undo(),
  redo: () => useFreeStore.getState().redo(),
});
