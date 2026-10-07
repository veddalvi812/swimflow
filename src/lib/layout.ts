import dagre from "@dagrejs/dagre";
import type { SwimlaneDiagram } from "@/types/diagram";
import type { Node, Edge } from "@xyflow/react";
import {
  LANE_HEADER_WIDTH,
  LANE_MIN_HEIGHT,
  LANE_PADDING,
  NODE_WIDTH,
  NODE_HEIGHT,
  DECISION_SIZE,
} from "./constants";

export interface LaneBounds {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function nodeSize(type: string): { w: number; h: number } {
  if (type === "decision") return { w: DECISION_SIZE, h: DECISION_SIZE };
  if (type === "start" || type === "end") return { w: 100, h: 40 };
  return { w: NODE_WIDTH, h: NODE_HEIGHT };
}

export function layoutDiagram(diagram: SwimlaneDiagram): {
  nodes: Node[];
  edges: Edge[];
  lanes: LaneBounds[];
} {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 80, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of diagram.nodes) {
    const { w, h } = nodeSize(node.type);
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of diagram.edges) {
    g.setEdge(edge.from, edge.to);
  }

  dagre.layout(g);

  // Group nodes by lane, compute lane y offsets
  const laneOrder = diagram.lanes.map((l) => l.id);
  const nodesByLane = new Map<string, typeof diagram.nodes>();
  for (const node of diagram.nodes) {
    const list = nodesByLane.get(node.lane) || [];
    list.push(node);
    nodesByLane.set(node.lane, list);
  }

  // Compute the x-range from dagre layout
  let globalMaxX = 0;
  for (const node of diagram.nodes) {
    const pos = g.node(node.id);
    const { w } = nodeSize(node.type);
    if (pos) globalMaxX = Math.max(globalMaxX, pos.x + w / 2);
  }

  // Build lane bounds — each lane is a horizontal row
  const laneBounds: LaneBounds[] = [];
  let currentY = 0;

  for (const laneId of laneOrder) {
    const laneDef = diagram.lanes.find((l) => l.id === laneId)!;
    const laneNodes = nodesByLane.get(laneId) || [];

    // Compute the height needed for this lane's nodes
    let maxNodeBottom = 0;
    for (const node of laneNodes) {
      const { h } = nodeSize(node.type);
      maxNodeBottom = Math.max(maxNodeBottom, h);
    }
    // Multiple nodes vertically? Check dagre y spread within this lane
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of laneNodes) {
      const pos = g.node(node.id);
      const { h } = nodeSize(node.type);
      if (pos) {
        minY = Math.min(minY, pos.y - h / 2);
        maxY = Math.max(maxY, pos.y + h / 2);
      }
    }
    const contentHeight = minY === Infinity ? 0 : maxY - minY;
    const laneHeight = Math.max(LANE_MIN_HEIGHT, contentHeight + LANE_PADDING * 2);

    laneBounds.push({
      id: laneId,
      label: laneDef.label,
      color: laneDef.color,
      x: 0,
      y: currentY,
      width: globalMaxX + LANE_HEADER_WIDTH + LANE_PADDING * 2,
      height: laneHeight,
    });

    currentY += laneHeight;
  }

  // Normalize lane widths to the widest
  const maxWidth = Math.max(...laneBounds.map((l) => l.width), 800);
  for (const lb of laneBounds) lb.width = maxWidth;

  // Lane background nodes (rendered behind content nodes)
  const laneNodes: Node[] = laneBounds.map((lane) => ({
    id: `lane-${lane.id}`,
    type: "lane",
    position: { x: lane.x, y: lane.y },
    data: {
      label: lane.label,
      color: lane.color,
      laneWidth: lane.width,
      laneHeight: lane.height,
    },
    selectable: false,
    draggable: false,
    connectable: false,
    style: { width: lane.width, height: lane.height, zIndex: -1 },
  }));

  // Position nodes: x from dagre, y centered in their lane
  const contentNodes: Node[] = diagram.nodes.map((node) => {
    const pos = g.node(node.id);
    const { w, h } = nodeSize(node.type);
    const lane = laneBounds.find((l) => l.id === node.lane)!;

    return {
      id: node.id,
      type: node.type === "start" || node.type === "end" ? "startEnd" : node.type,
      position: {
        x: (pos?.x ?? 0) - w / 2 + LANE_HEADER_WIDTH,
        y: lane.y + lane.height / 2 - h / 2,
      },
      data: { label: node.label, nodeType: node.type, description: node.description },
      style: { width: w, height: h },
    };
  });

  const rfNodes = [...laneNodes, ...contentNodes];

  const rfEdges: Edge[] = diagram.edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    type: "smoothstep",
    animated: edge.type === "conditional",
    style: {
      stroke: edge.type === "exception" ? "#dc2626" : "var(--muted-foreground)",
      strokeWidth: 1.5,
    },
    labelStyle: { fontSize: 12, fontWeight: 500, fill: "var(--foreground)" },
    labelBgStyle: { fill: "var(--background)", fillOpacity: 0.8 },
    markerEnd: { type: "arrowclosed" as const, color: "var(--muted-foreground)" },
  }));

  return { nodes: rfNodes, edges: rfEdges, lanes: laneBounds };
}
