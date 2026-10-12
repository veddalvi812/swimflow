"use client";

import { useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { useFreeStore } from "@/store/free-store";

const SIDES = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
] as const;

function FreeHandles() {
  return SIDES.map(([id, pos]) => (
    <Handle key={id} id={id} type="source" position={pos} className="!h-2.5 !w-2.5 !border-none !bg-[#3b82f6]" />
  ));
}

function EditableText({ id, text, className = "" }: { id: string; text: string; className?: string }) {
  const [editing, setEditing] = useState(false);
  const update = useFreeStore((s) => s.update);

  if (editing) {
    return (
      <textarea
        autoFocus
        defaultValue={text}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={(e) => {
          update(id, { text: e.target.value });
          setEditing(false);
        }}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        className={`nodrag nowheel h-full w-full resize-none bg-transparent outline-none ${className}`}
      />
    );
  }
  return (
    <div onDoubleClick={() => setEditing(true)} className={`w-full whitespace-pre-wrap break-words ${className}`}>
      {text || " "}
    </div>
  );
}

const ring = (selected?: boolean) => (selected ? "outline outline-2 outline-offset-2 outline-[#3b82f6]" : "");

export function StickyNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string; color: string };
  return (
    <div
      className={`h-full w-full p-3 text-[14px] text-[#1a1a1a] shadow-md ${ring(selected)}`}
      style={{ background: d.color, borderRadius: 4 }}
    >
      <EditableText id={id} text={d.text} className="h-full" />
      <FreeHandles />
    </div>
  );
}

export function TextNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string };
  return (
    <div className={`min-w-[80px] px-1 py-0.5 text-[18px] text-[#1a1a1a] ${ring(selected)}`}>
      <EditableText id={id} text={d.text} />
      <FreeHandles />
    </div>
  );
}

export function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string; shape: "rect" | "ellipse" | "diamond"; color: string };
  return (
    <div className="relative h-full w-full">
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} />
      {d.shape === "diamond" ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            points="50,1 99,50 50,99 1,50"
            fill={d.color}
            stroke="#a1a1aa"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <div
          className="absolute inset-0 border-[1.5px] border-[#a1a1aa]"
          style={{ background: d.color, borderRadius: d.shape === "ellipse" ? "50%" : 8 }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] text-[#1a1a1a]">
        <EditableText id={id} text={d.text} className="text-center" />
      </div>
      <FreeHandles />
    </div>
  );
}

export function FrameNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string };
  return (
    <div
      className={`relative h-full w-full rounded-lg border-2 border-dashed border-[#d4d4d8] bg-white/40 ${ring(selected)}`}
    >
      <NodeResizer isVisible={selected} minWidth={120} minHeight={80} />
      <div className="absolute -top-6 left-0 max-w-full text-[12px] font-medium text-[#71717a]">
        <EditableText id={id} text={d.text} />
      </div>
    </div>
  );
}
