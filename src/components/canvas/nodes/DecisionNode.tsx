"use client";

import type { NodeProps } from "@xyflow/react";
import { EditableLabel } from "./EditableLabel";
import { AllHandles } from "./Handles";
import { safeColor } from "@/lib/look";

export function DecisionNode({ id, data, selected }: NodeProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 80 80" className="absolute inset-0" width={80} height={80}>
        <polygon
          points="40,4 76,40 40,76 4,40"
          fill={safeColor((data as { fill?: string }).fill) ?? "#ffffff"}
          stroke={selected || (data as { dashed?: boolean }).dashed ? "#3b82f6" : "#a1a1aa"}
          strokeDasharray={(data as { dashed?: boolean }).dashed ? "5 3" : undefined}
          strokeWidth={selected ? 2 : 1.5}
        />
      </svg>
      <AllHandles />
      <EditableLabel nodeId={id} label={(data as { label: string }).label} className="relative z-10 max-w-[50px] text-center text-[11px] font-medium leading-tight" />
    </div>
  );
}
