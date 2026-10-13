import dagre from "@dagrejs/dagre";
import type { SwimlaneDiagram } from "@/types/diagram";
import type { Node, Edge } from "@xyflow/react";
import {
  LANE_HEADER_WIDTH,
  LANE_HEADER_HEIGHT,
  LANE_MIN_HEIGHT,
  LANE_MIN_WIDTH,
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

export function nodeSize(type: string): { w: number; h: number } {
  if (type === "decision") return { w: DECISION_SIZE, h: DECISION_SIZE };
  if (type === "start" || type === "end") return { w: 100, h: 40 };
  return { w: NODE_WIDTH, h: NODE_HEIGHT };
}

// Horizontal: lanes are rows, the flow runs left to right.
// Vertical: lanes are columns, the flow runs top to bottom.
export function layoutDiagram(diagram: SwimlaneDiagram): {
  nodes: Node[];
  edges: Edge[];
  lanes: LaneBounds[];
} {
  const vertical = diagram.orientation === "vertical";
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: vertical ? "TB" : "LR", nodesep: 50, ranksep: 80, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of diagram.nodes) {
    const { w, h } = nodeSize(node.type);
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of diagram.edges) {
    g.setEdge(edge.from, edge.to);
  }

  dagre.layout(g);

  // Group nodes by lane
  const laneOrder = diagram.lanes.map((l) => l.id);
  const nodesByLane = new Map<string, typeof diagram.nodes>();
  for (const node of diagram.nodes) {
    const list = nodesByLane.get(node.lane) || [];
    list.push(node);
    nodesByLane.set(node.lane, list);
  }

  // How far the flow runs along its main axis
  let flowEnd = 0;
  for (const node of diagram.nodes) {
    const pos = g.node(node.id);
    const { w, h } = nodeSize(node.type);
    if (pos) flowEnd = Math.max(flowEnd, vertical ? pos.y + h / 2 : pos.x + w / 2);
  }

  // Steps placed by hand can sit past the auto layout; make the lanes long enough for them
  let manualEnd = 0;
  for (const node of diagram.nodes) {
    if (!node.pos) continue;
    const { w, h } = nodeSize(node.type);
    manualEnd = Math.max(manualEnd, (vertical ? node.pos.y + h : node.pos.x + w) + LANE_PADDING);
  }

  // Each lane's size across the flow, from the spread of its nodes
  const laneBounds: LaneBounds[] = [];
  let cursor = 0;

  for (const laneId of laneOrder) {
    const laneDef = diagram.lanes.find((l) => l.id === laneId)!;
    const laneNodes = nodesByLane.get(laneId) || [];

    let min = Infinity;
    let max = -Infinity;
    for (const node of laneNodes) {
      const pos = g.node(node.id);
      const { w, h } = nodeSize(node.type);
      if (!pos) continue;
      min = Math.min(min, vertical ? pos.x - w / 2 : pos.y - h / 2);
      max = Math.max(max, vertical ? pos.x + w / 2 : pos.y + h / 2);
    }
    // Horizontal lanes grow with the spread of their nodes; vertical lanes are as wide as their widest node,
    // since nodes sit centered in the column.
    const widest = Math.max(0, ...laneNodes.map((n) => nodeSize(n.type).w));
    const content = vertical ? widest : min === Infinity ? 0 : max - min;
    const size = laneDef.size ?? Math.max(vertical ? LANE_MIN_WIDTH : LANE_MIN_HEIGHT, content + LANE_PADDING * 2);
    const length = flowEnd + (vertical ? LANE_HEADER_HEIGHT : LANE_HEADER_WIDTH) + LANE_PADDING * 2;

    laneBounds.push({
      id: laneId,
      label: laneDef.label,
      color: laneDef.color,
      x: vertical ? cursor : 0,
      y: vertical ? 0 : cursor,
      width: vertical ? size : length,
      height: vertical ? length : size,
    });
    cursor += size;
  }

  // Normalize lane lengths to the longest
  if (vertical) {
    const maxH = Math.max(...laneBounds.map((l) => l.height), 400, manualEnd);
    for (const lb of laneBounds) lb.height = maxH;
  } else {
    const maxW = Math.max(...laneBounds.map((l) => l.width), 800, manualEnd);
    for (const lb of laneBounds) lb.width = maxW;
  }

  // Lane background nodes (rendered behind content nodes)
  const laneNodes: Node[] = laneBounds.map((lane) => ({
    id: `lane-${lane.id}`,
    type: "lane",
    position: { x: lane.x, y: lane.y },
    data: {
      laneId: lane.id,
      label: lane.label,
      color: lane.color,
      laneWidth: lane.width,
      laneHeight: lane.height,
      orientation: vertical ? "vertical" : "horizontal",
    },
    selectable: false,
    draggable: false,
    connectable: false,
    style: { width: lane.width, height: lane.height, zIndex: -1 },
  }));

  // Position nodes: along the flow from dagre, centered across their lane
  const contentNodes: Node[] = diagram.nodes.map((node) => {
    const pos = g.node(node.id);
    const { w, h } = nodeSize(node.type);
    const lane = laneBounds.find((l) => l.id === node.lane)!;

    return {
      id: node.id,
      type: node.type === "start" || node.type === "end" ? "startEnd" : node.type,
      position: node.pos
        ? node.pos
        : vertical
          ? { x: lane.x + lane.width / 2 - w / 2, y: (pos?.y ?? 0) - h / 2 + LANE_HEADER_HEIGHT }
          : { x: (pos?.x ?? 0) - w / 2 + LANE_HEADER_WIDTH, y: lane.y + lane.height / 2 - h / 2 },
      data: { label: node.label, nodeType: node.type, description: node.description },
      style: { width: w, height: h },
    };
  });

  const rfNodes = [...laneNodes, ...contentNodes];

  // Nodes can have any number of paths in and out. Edges leave and enter along the flow;
  // a decision's extra branches fan out sideways toward the lane they go to.
  const laneIndex = new Map(laneOrder.map((id, i) => [id, i]));
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const outCount = new Map<string, number>();

  const rfEdges: Edge[] = diagram.edges.map((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    const n = outCount.get(edge.from) ?? 0;
    outCount.set(edge.from, n + 1);
    const fromLane = laneIndex.get(from?.lane ?? "") ?? 0;
    const toLane = laneIndex.get(to?.lane ?? "") ?? 0;

    let sourceHandle = vertical ? "b" : "r";
    if (from?.type === "decision" && n > 0 && fromLane !== toLane) {
      const later = toLane > fromLane;
      sourceHandle = vertical ? (later ? "r" : "l") : later ? "b" : "t";
    }

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle: vertical ? "t" : "l",
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
    };
  });

  return { nodes: rfNodes, edges: rfEdges, lanes: laneBounds };
}
