"use client";

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { SwimlaneDiagram, DiagramNode, DiagramEdge, Lane } from "@/types/diagram";
import { layoutDiagram, type LaneBounds } from "@/lib/layout";
import { SAMPLE_DIAGRAM } from "@/lib/constants";

interface DiagramStore {
  diagram: SwimlaneDiagram;
  nodes: Node[];
  edges: Edge[];
  lanes: LaneBounds[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  editingNodeId: string | null;

  setDiagram: (diagram: SwimlaneDiagram) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setEditingNode: (id: string | null) => void;
  relayout: () => void;

  addNode: (lane: string, type?: DiagramNode["type"]) => void;
  addEdge: (from: string, to: string) => void;
  updateNode: (id: string, patch: Partial<DiagramNode>) => void;
  updateEdge: (id: string, patch: Partial<DiagramEdge>) => void;
  updateLane: (id: string, patch: Partial<Lane>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  updateTitle: (title: string) => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

function applyLayout(diagram: SwimlaneDiagram) {
  return layoutDiagram(diagram);
}

const initial = applyLayout(SAMPLE_DIAGRAM);

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  diagram: SAMPLE_DIAGRAM,
  nodes: initial.nodes,
  edges: initial.edges,
  lanes: initial.lanes,
  selectedNodeId: null,
  selectedEdgeId: null,
  editingNodeId: null,

  setDiagram: (diagram) => {
    const { nodes, edges, lanes } = applyLayout(diagram);
    set({ diagram, nodes, edges, lanes, selectedNodeId: null, selectedEdgeId: null, editingNodeId: null });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, editingNodeId: null }),
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
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes, selectedNodeId: id, editingNodeId: id });
  },

  addEdge: (from, to) => {
    const { diagram } = get();
    const id = `e-${Date.now()}`;
    const edge: DiagramEdge = { id, from, to, type: "default" };
    const updated = { ...diagram, edges: [...diagram.edges, edge] };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes });
  },

  updateNode: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes });
  },

  updateEdge: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      edges: diagram.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes });
  },

  updateLane: (id, patch) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      lanes: diagram.lanes.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes });
  },

  deleteNode: (id) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      nodes: diagram.nodes.filter((n) => n.id !== id),
      edges: diagram.edges.filter((e) => e.from !== id && e.to !== id),
    };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes, selectedNodeId: null });
  },

  deleteEdge: (id) => {
    const { diagram } = get();
    const updated = {
      ...diagram,
      edges: diagram.edges.filter((e) => e.id !== id),
    };
    const { nodes, edges, lanes } = applyLayout(updated);
    set({ diagram: updated, nodes, edges, lanes, selectedEdgeId: null });
  },

  updateTitle: (title) => {
    const { diagram } = get();
    set({ diagram: { ...diagram, title } });
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
        const { nodes, edges, lanes } = applyLayout(parsed);
        set({ diagram: parsed, nodes, edges, lanes, selectedNodeId: null, selectedEdgeId: null, editingNodeId: null });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
