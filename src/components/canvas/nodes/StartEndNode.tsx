"use client";

import type { NodeProps } from "@xyflow/react";
import { EditableLabel } from "./EditableLabel";
import { AllHandles } from "./Handles";

export function StartEndNode({ id, data, selected }: NodeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full px-5 py-2 text-[12px] font-semibold transition-shadow ${
        selected ? "ring-2 ring-[var(--primary)]/30" : ""
      }`}
      style={{
        backgroundColor: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <AllHandles />
      <EditableLabel nodeId={id} label={(data as { label: string }).label} />
    </div>
  );
}
