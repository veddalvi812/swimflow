"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function DecisionNode({ data, selected }: NodeProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 80 80" className="absolute inset-0" width={80} height={80}>
        <polygon
          points="40,4 76,40 40,76 4,40"
          className={`fill-[var(--surface-raised)] transition-colors ${
            selected ? "stroke-[var(--primary)]" : "stroke-[var(--border)]"
          }`}
          strokeWidth={selected ? 2 : 1.5}
        />
      </svg>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
      <span className="relative z-10 max-w-[50px] text-center text-[11px] font-medium leading-tight">
        {(data as { label: string }).label}
      </span>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
    </div>
  );
}
