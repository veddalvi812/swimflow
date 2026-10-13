"use client";

import type { NodeProps } from "@xyflow/react";
import { EditableLabel } from "./EditableLabel";
import { AllHandles } from "./Handles";
import { stepLook } from "@/lib/look";

export function SubprocessNode({ id, data, selected }: NodeProps) {
  return (
    <div
      style={stepLook(data as { fill?: string; dashed?: boolean; stroke?: string })}
      className={`flex items-center justify-center rounded-lg border-2 border-double bg-[var(--surface-raised)] px-4 py-3 text-[13px] font-medium shadow-sm ${
        selected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
      }`}
    >
      <AllHandles />
      <EditableLabel nodeId={id} label={(data as { label: string }).label} className="text-center leading-tight" />
    </div>
  );
}
