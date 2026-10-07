export type NodeType =
  | "start"
  | "end"
  | "process"
  | "decision"
  | "subprocess"
  | "delay"
  | "document"
  | "datastore";

export type EdgeType = "default" | "conditional" | "exception";

export type Orientation = "horizontal" | "vertical";

export interface SwimlaneDiagram {
  title: string;
  orientation: Orientation;
  lanes: Lane[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface Lane {
  id: string;
  label: string;
  color: string;
  pool?: string;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  lane: string;
  description?: string;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type: EdgeType;
}
