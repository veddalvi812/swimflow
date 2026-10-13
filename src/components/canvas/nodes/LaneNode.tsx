"use client";

import { useState } from "react";
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
  const [editing, setEditing] = useState(false);
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
        draggable={!editing}
        onDoubleClick={() => setEditing(true)}
        title="Click to select, double-click to rename, drag to reorder"
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
        {editing ? (
          <input
            autoFocus
            defaultValue={label}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => {
              useDiagramStore.getState().updateLane(laneId, { label: e.target.value.trim() || label });
              setEditing(false);
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && e.currentTarget.blur()}
            className="w-full rounded border border-[var(--border-focus)] bg-white px-1.5 py-0.5 text-center text-[13px] font-semibold outline-none"
          />
        ) : (
          <span className="text-[13px] font-semibold select-none" style={{ color: "var(--foreground)" }}>
            {label}
          </span>
        )}
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
