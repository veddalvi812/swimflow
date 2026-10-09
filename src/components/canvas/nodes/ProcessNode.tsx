"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { EditableLabel } from "./EditableLabel";

export function ProcessNode({ id, data, selected }: NodeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border bg-[var(--surface-raised)] px-4 py-3 text-[13px] font-medium shadow-sm transition-shadow ${
        selected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
      <EditableLabel nodeId={id} label={(data as { label: string }).label} className="text-center leading-tight" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
    </div>
  );
}
