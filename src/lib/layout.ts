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

  // Steps in the same lane that would land on top of each other (same stage of the flow) are split into
  // extra rows across the lane, so nothing overlaps. Steps placed by hand are left where the user put them.
  const ROW_GAP = 28;
  const packing = new Map<string, { rows: number; rowSize: number }>();
  const rowOf = new Map<string, number>();
  for (const laneId of laneOrder) {
    const auto = (nodesByLane.get(laneId) || []).filter((n) => !n.pos && g.node(n.id));
    const along = (n: (typeof auto)[number]) => {
      const pos = g.node(n.id);
      const { w, h } = nodeSize(n.type);
      return vertical ? { start: pos.y - h / 2, end: pos.y + h / 2 } : { start: pos.x - w / 2, end: pos.x + w / 2 };
    };
    const rowEnds: number[] = [];
    for (const n of [...auto].sort((x, y) => along(x).start - along(y).start)) {
      const { start, end } = along(n);
      let row = rowEnds.findIndex((e) => e + ROW_GAP <= start);
      if (row === -1) row = rowEnds.push(end) - 1;
      else rowEnds[row] = end;
      rowOf.set(n.id, row);
    }
    const rowSize = Math.max(0, ...auto.map((n) => (vertical ? nodeSize(n.type).w : nodeSize(n.type).h)));
    packing.set(laneId, { rows: Math.max(1, rowEnds.length), rowSize });
  }

  // Each lane is as tall (or wide) as its rows need
  const laneBounds: LaneBounds[] = [];
  let cursor = 0;

  for (const laneId of laneOrder) {
    const laneDef = diagram.lanes.find((l) => l.id === laneId)!;
    const { rows, rowSize } = packing.get(laneId)!;
    const content = rows * rowSize + (rows - 1) * ROW_GAP;
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
        ? vertical
          ? { x: lane.x + node.pos.x, y: node.pos.y }
          : { x: node.pos.x, y: lane.y + node.pos.y }
        : (() => {
            const { rows, rowSize } = packing.get(node.lane) ?? { rows: 1, rowSize: 0 };
            const row = rowOf.get(node.id) ?? 0;
            const block = rows * rowSize + (rows - 1) * ROW_GAP;
            const across = (vertical ? lane.width : lane.height) / 2 - block / 2 + row * (rowSize + ROW_GAP);
            return vertical
              ? { x: lane.x + across + (rowSize - w) / 2, y: (pos?.y ?? 0) - h / 2 + LANE_HEADER_HEIGHT }
              : { x: (pos?.x ?? 0) - w / 2 + LANE_HEADER_WIDTH, y: lane.y + across + (rowSize - h) / 2 };
          })(),
      data: { label: node.label, nodeType: node.type, description: node.description },
      style: { width: w, height: h },
    };
  });

  const rfNodes = [...laneNodes, ...contentNodes];

  // Nodes can have any number of paths in and out. The first path leaves and enters along the flow; extra
  // ones use the sides of the step facing their lane (or alternate sides in the same lane) and run at their own
  // distance, so lines and labels don't pile up on each other.
  const laneIndex = new Map(laneOrder.map((id, i) => [id, i]));
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  const mainOut = vertical ? "b" : "r";
  const mainIn = vertical ? "t" : "l";
  const before = vertical ? "l" : "t";
  const after = vertical ? "r" : "b";

  const rfEdges: Edge[] = diagram.edges.map((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    const out = outCount.get(edge.from) ?? 0;
    const into = inCount.get(edge.to) ?? 0;
    outCount.set(edge.from, out + 1);
    inCount.set(edge.to, into + 1);
    const fromLane = laneIndex.get(from?.lane ?? "") ?? 0;
    const toLane = laneIndex.get(to?.lane ?? "") ?? 0;

    // Which side of the step faces the other lane (odd/even alternation when they share a lane)
    const sideTo = toLane > fromLane ? after : toLane < fromLane ? before : out % 2 === 1 ? before : after;
    const sideFrom = fromLane < toLane ? before : fromLane > toLane ? after : into % 2 === 1 ? before : after;

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      sourceHandle: out === 0 ? mainOut : sideTo,
      targetHandle: into === 0 ? mainIn : sideFrom,
      label: edge.label,
      type: "smoothstep",
      pathOptions: { offset: 24 + 14 * out, borderRadius: 8 },
      animated: edge.type === "conditional",
      style: {
        stroke: edge.type === "exception" ? "#dc2626" : "var(--muted-foreground)",
        strokeWidth: 1.5,
      },
      labelStyle: { fontSize: 12, fontWeight: 500, fill: "var(--foreground)" },
      labelBgStyle: { fill: "var(--background)", fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: { type: "arrowclosed" as const, color: "var(--muted-foreground)" },
    } as Edge;
  });

  return { nodes: rfNodes, edges: rfEdges, lanes: laneBounds };
}
