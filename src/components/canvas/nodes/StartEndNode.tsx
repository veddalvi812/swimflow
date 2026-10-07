"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function StartEndNode({ data, selected }: NodeProps) {
  const nodeType = (data as { nodeType: string }).nodeType;
  const isStart = nodeType === "start";

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
      {!isStart && (
        <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
      )}
      <span>{(data as { label: string }).label}</span>
      {isStart && (
        <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-none !bg-[var(--muted)]" />
      )}
      {!isStart && (
        <Handle type="source" position={Position.Right} className="!h-0 !w-0" style={{ visibility: "hidden" }} />
      )}
      {isStart && (
        <Handle type="target" position={Position.Left} className="!h-0 !w-0" style={{ visibility: "hidden" }} />
      )}
    </div>
  );
}
