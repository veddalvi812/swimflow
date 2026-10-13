import dagre from "@dagrejs/dagre";
import type { SwimlaneDiagram } from "@/types/diagram";
import type { Node, Edge } from "@xyflow/react";
import { EDGE_KINDS } from "./look";
import { DIRS, markUsed, newUsed, route, simplify, type Dir, type Pt, type Rect } from "./routing";
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
  // Spacing stretches the gaps between steps (and between stacked rows) without changing the steps.
  const k = { compact: 0.7, normal: 1, roomy: 1.7 }[diagram.spacing ?? "normal"];
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: vertical ? "TB" : "LR", nodesep: 50 * k, ranksep: 80 * k, marginx: 20, marginy: 20 });
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
  const ROW_GAP = Math.round(28 * k);
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
    const size =
      laneDef.size ?? Math.round(Math.max((vertical ? LANE_MIN_WIDTH : LANE_MIN_HEIGHT) * k, content + LANE_PADDING * 2 * k));
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
      data: { label: node.label, nodeType: node.type, description: node.description, fill: node.fill, dashed: node.dashed, stroke: node.stroke },
      style: { width: w, height: h },
    };
  });

  const rfNodes = [...laneNodes, ...contentNodes];

  // Nodes can have any number of paths in and out. The first path leaves and enters along the flow; extra
  // ones use the sides of the step facing their lane (or alternate sides in the same lane). Each connector is
  // then routed around the steps, avoiding lines that earlier connectors already use.
  const laneIndex = new Map(laneOrder.map((id, i) => [id, i]));
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  const mainOut = vertical ? "b" : "r";
  const mainIn = vertical ? "t" : "l";
  const before = vertical ? "l" : "t";
  const after = vertical ? "r" : "b";

  const GAP = 14; // how far a connector leaves a step before it may turn
  const rects = new Map<string, Rect>();
  for (const n of contentNodes) {
    rects.set(n.id, { x: n.position.x, y: n.position.y, w: Number(n.style?.width ?? 0), h: Number(n.style?.height ?? 0) });
  }
  const obstacles = [...rects.values()];
  const used = newUsed();
  const anchor = (id: string, side: string) => {
    const r = rects.get(id);
    if (!r) return null;
    const dir: Dir = side === "r" ? 0 : side === "b" ? 1 : side === "l" ? 2 : 3;
    const p: Pt = dir === 0 ? [r.x + r.w, r.y + r.h / 2] : dir === 1 ? [r.x + r.w / 2, r.y + r.h] : dir === 2 ? [r.x, r.y + r.h / 2] : [r.x + r.w / 2, r.y];
    const stub: Pt = [p[0] + DIRS[dir][0] * GAP, p[1] + DIRS[dir][1] * GAP];
    return { p, dir, stub };
  };

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
    const sourceHandle = out === 0 ? mainOut : sideTo;
    const targetHandle = into === 0 ? mainIn : sideFrom;

    let points: Pt[] | undefined;
    const a = anchor(edge.from, sourceHandle);
    const b = anchor(edge.to, targetHandle);
    if (a && b && edge.from !== edge.to) {
      const via: Pt | undefined = edge.via ? [edge.via.x, edge.via.y] : undefined;
      const legs = via
        ? [...route(a.stub, a.dir, via, obstacles, used), ...route(via, null, b.stub, obstacles, used).slice(1)]
        : route(a.stub, a.dir, b.stub, obstacles, used);
      points = simplify([a.p, ...legs, b.p]);
      markUsed(used, points);
    }

    const kind = EDGE_KINDS[edge.type] ?? EDGE_KINDS.default;
    const color = kind.color;

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle,
      label: edge.label,
      type: points ? "routed" : "smoothstep",
      data: { points, via: edge.via },
      animated: kind.dashed && !kind.color,
      style: {
        stroke: color ?? "var(--muted-foreground)",
        strokeWidth: 1.5,
        strokeDasharray: kind.dashed && kind.color ? "6 4" : undefined,
      },
      // Colored kinds label their line with a solid chip
      labelStyle: { fontSize: 12, fontWeight: 500, fill: color ? "#ffffff" : "var(--foreground)" },
      labelBgStyle: color ? { fill: color } : { fill: "var(--background)", fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: { type: "arrowclosed" as const, color: color ?? "var(--muted-foreground)" },
    } as Edge;
  });

  return { nodes: rfNodes, edges: rfEdges, lanes: laneBounds };
}
