"use client";

import type { NodeProps } from "@xyflow/react";
import { LANE_HEADER_HEIGHT, LANE_HEADER_WIDTH } from "@/lib/constants";

export function LaneNode({ data }: NodeProps) {
  const { label, color, laneWidth, laneHeight, orientation } = data as {
    label: string;
    color: string;
    laneWidth: number;
    laneHeight: number;
    orientation?: "horizontal" | "vertical";
  };
  const vertical = orientation === "vertical";
  const header = vertical
    ? { width: laneWidth, height: LANE_HEADER_HEIGHT }
    : { width: LANE_HEADER_WIDTH, height: laneHeight };

  return (
    <div
      className="pointer-events-none"
      style={{ width: laneWidth, height: laneHeight, position: "relative" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: color, opacity: 0.08 }}
      />
      <div
        className={`absolute left-0 top-0 flex items-center justify-center ${vertical ? "border-b" : "border-r"} border-[var(--border)]`}
        style={{ ...header, backgroundColor: color, opacity: 0.15 }}
      />
      <div
        className="absolute left-0 top-0 flex items-center justify-center px-2"
        style={header}
      >
        <span className="text-[13px] font-semibold select-none" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
      </div>
      {/* Lane divider: bottom for rows, right for columns */}
      {vertical ? (
        <div className="absolute bottom-0 right-0 top-0 w-px bg-[var(--border)]" />
      ) : (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]" />
      )}
    </div>
  );
}
