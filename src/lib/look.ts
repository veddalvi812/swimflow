import type { CSSProperties } from "react";
import type { EdgeType } from "@/types/diagram";

// Connector kinds for swimlane diagrams: a color and a short label each. Colored ones label their line with a chip.
export const EDGE_KINDS: Record<EdgeType, { label: string; color?: string; dashed?: boolean }> = {
  default: { label: "Normal" },
  conditional: { label: "Conditional", dashed: true },
  exception: { label: "Exception", color: "#dc2626" },
  approve: { label: "Approve", color: "#22c55e" },
  reject: { label: "Reject", color: "#ef4444" },
  sendback: { label: "Send back", color: "#3b82f6" },
  notify: { label: "Notify", color: "#3b82f6", dashed: true },
};

export const STEP_FILLS = ["#ffffff", "#dbeafe", "#dcfce7", "#fef9c3", "#fee2e2", "#ede9fe", "#fed7aa"];

// Only plain hex colors are accepted from imported JSON.
export const safeColor = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : undefined);

// Fill and outline for a step; dashed outlines mark automated or system steps.
export function stepLook(d: { fill?: string; dashed?: boolean }): CSSProperties {
  return {
    background: safeColor(d.fill),
    ...(d.dashed ? { borderStyle: "dashed", borderColor: "#3b82f6" } : {}),
  };
}
