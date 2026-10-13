"use client";

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { SwimlaneDiagram, DiagramNode, DiagramEdge, Lane, Orientation, Spacing } from "@/types/diagram";
import { layoutDiagram, nodeSize, type LaneBounds } from "@/lib/layout";
import { LANE_HEADER_HEIGHT, LANE_HEADER_WIDTH } from "@/lib/constants";
import { SAMPLE_DIAGRAM, LANE_COLORS } from "@/lib/constants";
import { record, registerHistory } from "./history";

const MAX_HISTORY = 50;

interface DiagramStore {
  diagram: SwimlaneDiagram;
  nodes: Node[];
  edges: Edge[];
  lanes: LaneBounds[];
  selectedNodeId: string | null;
  selectedLaneId: string | null;
  selectedEdgeId: string | null;
  editingNodeId: string | null;

  // history
  _past: SwimlaneDiagram[];
  _future: SwimlaneDiagram[];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  setDiagram: (diagram: SwimlaneDiagram) => void;
  applyRemote: (diagram: SwimlaneDiagram) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  selectLane: (id: string | null) => void;
  moveLane: (id: string, toIndex: number) => void;
  setEditingNode: (id: string | null) => void;
  relayout: () => void;

  addNode: (lane: string, type?: DiagramNode["type"], at?: { x: number; y: number }) => void;
  moveStep: (id: string, position: { x: number; y: number }) => void;
  insertLane: (index: number) => void;
  addEdge: (from: string, to: string) => void;
  updateNode: (id: string, patch: Partial<DiagramNode>) => void;
  updateEdge: (id: string, patch: Partial<DiagramEdge>) => void;
  updateLane: (id: string, patch: Partial<Lane>) => void;
  addLane: () => void;
  deleteLane: (id: string) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  updateTitle: (title: string) => void;
  setOrientation: (o: Orientation) => void;
  setSpacing: (s: Spacing) => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

function applyLayout(diagram: SwimlaneDiagram) {
  return layoutDiagram(diagram);
}

const initial = applyLayout(SAMPLE_DIAGRAM);

function commit(get: () => DiagramStore, updated: SwimlaneDiagram, extra?: Partial<DiagramStore>) {
  const { diagram, _past } = get();
  const { nodes, edges, lanes } = applyLayout(updated);
  record("d");
  return {
    diagram: updated,
    nodes,
    edges,
    lanes,
    _past: [..._past.slice(-(MAX_HISTORY - 1)), diagram],
    _future: [],
    ...extra,
  };
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  diagram: SAMPLE_DIAGRAM,
  nodes: initial.nodes,
  edges: initial.edges,
  lanes: initial.lanes,
  selectedNodeId: null,
  selectedLaneId: null,
  selectedEdgeId: null,
  editingNodeId: null,
  _past: [],
  _future: [],

  canUndo: () => get()._past.length > 0,
  canRedo: () => get()._future.length > 0,

  undo: () => {
    const { _past, _future, diagram } = get();
    if (_past.length === 0) return;
    const prev = _past[_past.length - 1];
    const { nodes, edges, lanes } = applyLayout(prev);
    set({
      diagram: prev,
      nodes,
      edges,
      lanes,
      _past: _past.slice(0, -1),
      _future: [diagram, ..._future],
      selectedNodeId: null,
      selectedEdgeId: null,
      editingNodeId: null,
    });
  },

  redo: () => {
    const { _past, _future, diagram } = get();
    if (_future.length === 0) return;
    const next = _future[0];
    const { nodes, edges, lanes } = applyLayout(next);
    set({
      diagram: next,
      nodes,
      edges,
      lanes,
      _past: [..._past, diagram],
      _future: _future.slice(1),
      selectedNodeId: null,
      selectedEdgeId: null,
      editingNodeId: null,
    });
  },

  setDiagram: (diagram) => {
    set(commit(get, diagram, { selectedNodeId: null, selectedEdgeId: null, editingNodeId: null }));
  },

  // Someone else saved: show their version without adding it to this person's undo history.
  applyRemote: (diagram) => {
    const { nodes, edges, lanes } = applyLayout(diagram);
    set({ diagram, nodes, edges, lanes, _past: [], _future: [], selectedNodeId: null, selectedEdgeId: null, selectedLaneId: null, editingNodeId: null });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null, selectedLaneId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, selectedLaneId: null, editingNodeId: null }),
  selectLane: (id) => set({ selectedLaneId: id, selectedNodeId: null, selectedEdgeId: null, editingNodeId: null }),

  moveLane: (id, toIndex) => {
    const { diagram } = get();
    const from = diagram.lanes.findIndex((l) => l.id === id);
    if (from < 0 || from === toIndex) return;
    const lanes = [...diagram.lanes];
    lanes.splice(toIndex, 0, lanes.splice(from, 1)[0]);
    set(commit(get, { ...diagram, lanes }));
  },
  setEditingNode: (id) => set({ editingNodeId: id }),

  // Tidy: forget hand-placed positions and lay everything out again.
  relayout: () => {
    const { diagram } = get();
    set(commit(get, { ...diagram, nodes: diagram.nodes.map(({ pos: _pos, ...n }) => n) }));
  },

  addNode: (lane, type = "process", at) => {
    const { diagram } = get();
    const id = `n-${Date.now()}`;
    const { w, h } = nodeSize(type);
    const home = get().lanes.find((l) => l.id === lane);
    const abs = at && { x: at.x - w / 2, y: at.y - h / 2 };
    const pos = abs && home && (diagram.orientation === "vertical" ? { x: abs.x - home.x, y: abs.y } : { x: abs.x, y: abs.y - home.y });
    const node: DiagramNode = { id, type, label: "New Step", lane, ...(pos ? { pos } : {}) };
    const updated = { ...diagram, nodes: [...diagram.nodes, node] };
    set(commit(get, updated, { selectedNodeId: id, editingNodeId: id }));
  },

  // A step dropped somewhere: remember where, and move it into the lane it landed in.
  moveStep: (id, position) => {
    const { diagram, lanes } = get();
    const step = diagram.nodes.find((n) => n.id === id);
    if (!step || lanes.length === 0) return;
    const vertical = diagram.orientation === "vertical";
    const { w, h } = nodeSize(step.type);
    const center = vertical ? position.x + w / 2 : position.y + h / 2;
    const start = (l: LaneBounds) => (vertical ? l.x : l.y);
    const span = (l: LaneBounds) => (vertical ? l.width : l.height);
    const lane =
      lanes.find((l) => center >= start(l) && center < start(l) + span(l)) ??
      lanes.reduce((best, l) =>
        Math.abs(center - (start(l) + span(l) / 2)) < Math.abs(center - (start(best) + span(best) / 2)) ? l : best
      );
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
    const pos = vertical
      ? { x: clamp(position.x, lane.x, lane.x + lane.width - w), y: Math.max(position.y, LANE_HEADER_HEIGHT) }
      : { x: Math.max(position.x, LANE_HEADER_WIDTH), y: clamp(position.y, lane.y, lane.y + lane.height - h) };
    // Remembered relative to the lane across the flow, so the step goes with its lane when lanes are reordered.
    const rel = vertical ? { x: pos.x - lane.x, y: pos.y } : { x: pos.x, y: pos.y - lane.y };
    if (step.lane === lane.id && step.pos && step.pos.x === rel.x && step.pos.y === rel.y) return;
    set(commit(get, { ...diagram, nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, lane: lane.id, pos: rel } : n)) }));
  },

  insertLane: (index) => {
    const { diagram } = get();
    const id = `lane-${Date.now()}`;
    const color = LANE_COLORS[diagram.lanes.length % LANE_COLORS.length];
    const lanes = [...diagram.lanes];
    lanes.splice(index, 0, { id, label: `Lane ${diagram.lanes.length + 1}`, color });
    set(commit(get, { ...diagram, lanes }, { selectedLaneId: id }));
  },

  addEdge: (from, to) => {
    const { diagram } = get();
    if (diagram.edges.some((e) => e.from === from && e.to === to)) return;
    const id = `e-${Date.now()}`;
    const edge: DiagramEdge = { id, from, to, type: "default" };
    const updated = { ...diagram, edges: [...diagram.edges, edge] };
    set(commit(get, updated));
  },

  updateNode: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    };
    set(commit(get, updated));
  },

  updateEdge: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      edges: diagram.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    };
    set(commit(get, updated));
  },

  updateLane: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      lanes: diagram.lanes.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    };
    set(commit(get, updated));
  },

  addLane: () => {
    const { diagram } = get();
    const id = `lane-${Date.now()}`;
    const color = LANE_COLORS[diagram.lanes.length % LANE_COLORS.length];
    const lane: Lane = { id, label: `Lane ${diagram.lanes.length + 1}`, color };
    const updated = { ...diagram, lanes: [...diagram.lanes, lane] };
    set(commit(get, updated));
  },

  deleteLane: (id) => {
    const { diagram } = get();
    const nodeIds = new Set(diagram.nodes.filter((n) => n.lane === id).map((n) => n.id));
    const updated = {
      ...diagram,
      lanes: diagram.lanes.filter((l) => l.id !== id),
      nodes: diagram.nodes.filter((n) => n.lane !== id),
      edges: diagram.edges.filter((e) => !nodeIds.has(e.from) && !nodeIds.has(e.to)),
    };
    set(commit(get, updated, { selectedLaneId: null }));
  },

  deleteNode: (id) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      nodes: diagram.nodes.filter((n) => n.id !== id),
      edges: diagram.edges.filter((e) => e.from !== id && e.to !== id),
    };
    set(commit(get, updated, { selectedNodeId: null }));
  },

  deleteEdge: (id) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      edges: diagram.edges.filter((e) => e.id !== id),
    };
    set(commit(get, updated, { selectedEdgeId: null }));
  },

  setSpacing: (spacing) => {
    set(commit(get, { ...get().diagram, spacing }));
  },

  setOrientation: (orientation) => {
    set(commit(get, { ...get().diagram, orientation }));
  },

  updateTitle: (title) => {
    const { diagram } = get();
    set(commit(get, { ...diagram, title }));
  },

  exportJSON: () => {
    return JSON.stringify(get().diagram, null, 2);
  },

  importJSON: (json) => {
    try {
      const trimmed = json.trim();
      const str = trimmed.startsWith("```")
        ? trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
        : trimmed;
      const parsed = JSON.parse(str) as SwimlaneDiagram;
      if (parsed.lanes && parsed.nodes && parsed.edges) {
        set(commit(get, parsed, { selectedNodeId: null, selectedEdgeId: null, editingNodeId: null }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));

registerHistory("d", {
  undo: () => useDiagramStore.getState().undo(),
  redo: () => useDiagramStore.getState().redo(),
});
