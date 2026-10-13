"use client";

import type { NodeProps } from "@xyflow/react";
import { LANE_HEADER_HEIGHT, LANE_HEADER_WIDTH } from "@/lib/constants";
import { useDiagramStore } from "@/store/diagram-store";

export function LaneNode({ data }: NodeProps) {
  const { laneId, label, color, laneWidth, laneHeight, orientation } = data as {
    laneId: string;
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
      {/* The header is the lane's handle: click to select it, drag it onto another lane to reorder. */}
      <div
        draggable
        title="Click to select, drag to reorder"
        onClick={() => useDiagramStore.getState().selectLane(laneId)}
        onDragStart={(e) => e.dataTransfer.setData("application/x-lane", laneId)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const from = e.dataTransfer.getData("application/x-lane");
          const { diagram, moveLane } = useDiagramStore.getState();
          if (from) moveLane(from, diagram.lanes.findIndex((l) => l.id === laneId));
        }}
        className="nopan nodrag pointer-events-auto absolute left-0 top-0 flex cursor-grab items-center justify-center px-2"
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
