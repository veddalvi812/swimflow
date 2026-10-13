"use client";

import { Handle, Position } from "@xyflow/react";

const SIDES = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
] as const;

// A connection point on every side. With the canvas in loose connection mode any handle
// can start or end a connector, so a node can have as many paths in and out as you like.
export function AllHandles({ className = "!h-2.5 !w-2.5 !border-none !bg-[#3b82f6]" }: { className?: string }) {
  return SIDES.map(([id, pos]) => <Handle key={id} id={id} type="source" position={pos} className={className} />);
}
