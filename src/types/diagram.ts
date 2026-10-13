export type NodeType =
  | "start"
  | "end"
  | "process"
  | "decision"
  | "subprocess"
  | "delay"
  | "document"
  | "datastore";

export type EdgeType = "default" | "conditional" | "exception" | "approve" | "reject" | "sendback" | "notify";

export type Orientation = "horizontal" | "vertical";

export type Spacing = "compact" | "normal" | "roomy";

export interface SwimlaneDiagram {
  title: string;
  orientation: Orientation;
  spacing?: Spacing; // how far apart steps are laid out; default normal
  lanes: Lane[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// What a board stores: the swimlane diagram plus its free-form canvas objects.
export type BoardContent = SwimlaneDiagram & {
  free?: { nodes: import("@xyflow/react").Node[]; edges: import("@xyflow/react").Edge[] };
};

export interface Lane {
  id: string;
  label: string;
  color: string;
  pool?: string;
  size?: number; // set by hand; otherwise the lane fits its steps
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  lane: string;
  description?: string;
  fill?: string; // background color of the step
  dashed?: boolean; // dashed outline, for automated or system steps
  stroke?: string; // outline color, or "none" for no outline
  pos?: { x: number; y: number }; // set by dragging: along the flow it's absolute, across it's the offset inside the lane; otherwise auto-laid out
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type: EdgeType;
  via?: { x: number; y: number }; // a point the connector is steered through; otherwise it's routed automatically
}
