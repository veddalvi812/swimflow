"use client";

import type { NodeProps } from "@xyflow/react";
import { LANE_HEADER_WIDTH } from "@/lib/constants";

export function LaneNode({ data }: NodeProps) {
  const { label, color, laneWidth, laneHeight } = data as {
    label: string;
    color: string;
    laneWidth: number;
    laneHeight: number;
  };

  return (
    <div
      className="pointer-events-none"
      style={{ width: laneWidth, height: laneHeight, position: "relative" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: color, opacity: 0.06 }}
      />
      <div
        className="absolute left-0 top-0 flex items-center justify-center border-r border-[var(--border)]"
        style={{
          width: LANE_HEADER_WIDTH,
          height: laneHeight,
          backgroundColor: color,
          opacity: 0.12,
        }}
      />
      <div
        className="absolute left-0 top-0 flex items-center justify-center"
        style={{ width: LANE_HEADER_WIDTH, height: laneHeight }}
      >
        <span className="text-[13px] font-semibold select-none" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
      </div>
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]" />
    </div>
  );
}
