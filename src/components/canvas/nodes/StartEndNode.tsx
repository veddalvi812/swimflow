"use client";

import type { NodeProps } from "@xyflow/react";
import { EditableLabel } from "./EditableLabel";
import { AllHandles } from "./Handles";
import { safeColor } from "@/lib/look";

export function StartEndNode({ id, data, selected }: NodeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full px-5 py-2 text-[12px] font-semibold transition-shadow ${
        selected ? "ring-2 ring-[var(--primary)]/30" : ""
      }`}
      style={{
        backgroundColor: safeColor((data as { fill?: string }).fill) ?? "var(--foreground)",
        color: safeColor((data as { fill?: string }).fill) ? "#1a1a1a" : "var(--background)",
        ...((data as { dashed?: boolean; stroke?: string }).dashed || safeColor((data as { stroke?: string }).stroke)
          ? { outline: `2px ${(data as { dashed?: boolean }).dashed ? "dashed" : "solid"} ${safeColor((data as { stroke?: string }).stroke) ?? "#3b82f6"}`, outlineOffset: 2 }
          : {}),
      }}
    >
      <AllHandles />
      <EditableLabel nodeId={id} label={(data as { label: string }).label} />
    </div>
  );
}
