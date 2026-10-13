"use client";

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { SwimlaneDiagram, DiagramNode, DiagramEdge, Lane, Orientation } from "@/types/diagram";
import { layoutDiagram, type LaneBounds } from "@/lib/layout";
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
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  selectLane: (id: string | null) => void;
  moveLane: (id: string, toIndex: number) => void;
  setEditingNode: (id: string | null) => void;
  relayout: () => void;

  addNode: (lane: string, type?: DiagramNode["type"]) => void;
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

  relayout: () => {
    const { diagram } = get();
    const { nodes, edges, lanes } = applyLayout(diagram);
    set({ nodes, edges, lanes });
  },

  addNode: (lane, type = "process") => {
    const { diagram } = get();
    const id = `n-${Date.now()}`;
    const node: DiagramNode = { id, type, label: "New Step", lane };
    const updated = { ...diagram, nodes: [...diagram.nodes, node] };
    set(commit(get, updated, { selectedNodeId: id, editingNodeId: id }));
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
