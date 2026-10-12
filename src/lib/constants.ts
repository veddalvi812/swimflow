export const LANE_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // rose
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#64748b", // slate
];

export const LANE_HEADER_WIDTH = 160;
export const LANE_MIN_HEIGHT = 200;
export const LANE_PADDING = 40;
export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 50;
export const DECISION_SIZE = 80;

export const SAMPLE_DIAGRAM = {
  title: "Employee Onboarding Process",
  orientation: "horizontal" as const,
  lanes: [
    { id: "hr", label: "HR Department", color: LANE_COLORS[0] },
    { id: "it", label: "IT Department", color: LANE_COLORS[1] },
    { id: "manager", label: "Hiring Manager", color: LANE_COLORS[2] },
  ],
  nodes: [
    { id: "start", type: "start" as const, label: "Start", lane: "hr" },
    { id: "review", type: "process" as const, label: "Review Application", lane: "hr" },
    { id: "interview", type: "process" as const, label: "Schedule Interview", lane: "manager" },
    { id: "decision", type: "decision" as const, label: "Hire?", lane: "manager" },
    { id: "setup-account", type: "process" as const, label: "Setup Accounts", lane: "it" },
    { id: "setup-workspace", type: "process" as const, label: "Prepare Workspace", lane: "it" },
    { id: "orientation", type: "process" as const, label: "Orientation Session", lane: "hr" },
    { id: "end", type: "end" as const, label: "Complete", lane: "hr" },
    { id: "reject", type: "end" as const, label: "Rejected", lane: "manager" },
  ],
  edges: [
    { id: "e1", from: "start", to: "review", type: "default" as const },
    { id: "e2", from: "review", to: "interview", type: "default" as const },
    { id: "e3", from: "interview", to: "decision", type: "default" as const },
    { id: "e4", from: "decision", to: "setup-account", label: "Yes", type: "default" as const },
    { id: "e5", from: "decision", to: "reject", label: "No", type: "conditional" as const },
    { id: "e6", from: "setup-account", to: "setup-workspace", type: "default" as const },
    { id: "e7", from: "setup-workspace", to: "orientation", type: "default" as const },
    { id: "e8", from: "orientation", to: "end", type: "default" as const },
  ],
};
