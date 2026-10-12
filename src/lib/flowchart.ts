import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

export type FlowType = "start" | "end" | "process" | "decision";

export interface FlowSpec {
  nodes: { id: string; label: string; type?: FlowType }[];
  edges: { from: string; to: string; label?: string }[];
}

const SIZE: Record<FlowType, [number, number]> = {
  start: [140, 56],
  end: [140, 56],
  process: [160, 64],
  decision: [170, 100],
};

const LOOK: Record<FlowType, { shape: string; color: string }> = {
  start: { shape: "ellipse", color: "#bbf7d0" },
  end: { shape: "ellipse", color: "#fecaca" },
  process: { shape: "rect", color: "#ffffff" },
  decision: { shape: "diamond", color: "#fef08a" },
};

export const FLOW_PROMPT = `Generate a flowchart as JSON for: "{describe your process}"

Return only this structure. Node types: start, process, decision, end.
Put a label on each edge that leaves a decision (e.g. "Yes", "No").
{
  "nodes": [ { "id": "n1", "label": "...", "type": "start" } ],
  "edges": [ { "from": "n1", "to": "n2", "label": "" } ]
}`;

export const STARTER_FLOW: FlowSpec = {
  nodes: [
    { id: "a", label: "Start", type: "start" },
    { id: "b", label: "Do the work", type: "process" },
    { id: "c", label: "Done?", type: "decision" },
    { id: "d", label: "End", type: "end" },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
    { from: "c", to: "d", label: "Yes" },
    { from: "c", to: "b", label: "No" },
  ],
};

export function parseFlow(raw: string): FlowSpec {
  const json = raw.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const p = JSON.parse(json);
  if (!Array.isArray(p.nodes) || !p.nodes.length) throw new Error("Needs a nodes array");
  const nodes: FlowSpec["nodes"] = p.nodes.map((n: Record<string, unknown>, i: number) => ({
    id: String(n.id ?? `n${i}`),
    label: String(n.label ?? ""),
    type: typeof n.type === "string" && n.type in SIZE ? (n.type as FlowType) : "process",
  }));
  const ids = new Set(nodes.map((n) => n.id));
  const edges: FlowSpec["edges"] = (Array.isArray(p.edges) ? p.edges : [])
    .filter((e: { from?: unknown; to?: unknown }) => ids.has(String(e.from)) && ids.has(String(e.to)))
    .map((e: { from: unknown; to: unknown; label?: unknown }) => ({
      from: String(e.from),
      to: String(e.to),
      label: e.label ? String(e.label) : undefined,
    }));
  return { nodes, edges };
}

// Lays the spec out top-to-bottom with dagre and returns free-canvas nodes/edges centered on `origin`.
export function buildFlowchart(spec: FlowSpec, origin: { x: number; y: number }) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 60 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of spec.nodes) {
    const [width, height] = SIZE[n.type ?? "process"];
    g.setNode(n.id, { width, height });
  }
  for (const e of spec.edges) g.setEdge(e.from, e.to);
  dagre.layout(g);

  const { width: gw = 0, height: gh = 0 } = g.graph();
  const stamp = Date.now();
  const ids = new Map(spec.nodes.map((n, i) => [n.id, `f-${stamp}-fc${i}`]));

  const nodes: Node[] = spec.nodes.map((n) => {
    const type = n.type ?? "process";
    const [width, height] = SIZE[type];
    const pos = g.node(n.id);
    return {
      id: ids.get(n.id)!,
      type: "shape",
      position: { x: pos.x - width / 2 + origin.x - gw / 2, y: pos.y - height / 2 + origin.y - gh / 2 },
      data: { text: n.label, ...LOOK[type] },
      width,
      height,
    };
  });
  const edges: Edge[] = spec.edges.map((e, i) => ({
    id: `fe-${stamp}-fc${i}`,
    source: ids.get(e.from)!,
    target: ids.get(e.to)!,
    sourceHandle: "b",
    targetHandle: "t",
    label: e.label,
  }));
  return { nodes, edges };
}
