"use client";

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { SwimlaneDiagram } from "@/types/diagram";
import { layoutDiagram, type LaneBounds } from "@/lib/layout";
import { SAMPLE_DIAGRAM } from "@/lib/constants";

interface DiagramStore {
  diagram: SwimlaneDiagram;
  nodes: Node[];
  edges: Edge[];
  lanes: LaneBounds[];
  selectedNodeId: string | null;

  setDiagram: (diagram: SwimlaneDiagram) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  relayout: () => void;
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

  setDiagram: (diagram) => {
    const { nodes, edges, lanes } = applyLayout(diagram);
    set({ diagram, nodes, edges, lanes });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),

  relayout: () => {
    const { diagram } = get();
    const { nodes, edges, lanes } = applyLayout(diagram);
    set({ nodes, edges, lanes });
  },
}));
