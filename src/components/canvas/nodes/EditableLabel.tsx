"use client";

import { useState, useEffect } from "react";
import { useDiagramStore } from "@/store/diagram-store";

export function EditableLabel({
  nodeId,
  label,
  className,
}: {
  nodeId: string;
  label: string;
  className?: string;
}) {
  const editing = useDiagramStore((s) => s.editingNodeId === nodeId);
  const setEditingNode = useDiagramStore((s) => s.setEditingNode);
  const updateNode = useDiagramStore((s) => s.updateNode);
  const [value, setValue] = useState(label);

  useEffect(() => {
    setValue(label);
  }, [label]);

  if (!editing) {
    return <span className={className}>{label}</span>;
  }

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== label) updateNode(nodeId, { label: trimmed });
    else setValue(label);
    setEditingNode(null);
  };

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setValue(label);
          setEditingNode(null);
        }
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="nodrag nowheel nopan bg-transparent text-center outline-none ring-1 ring-[var(--primary)] rounded px-1"
      style={{ width: "100%", font: "inherit", color: "inherit" }}
    />
  );
}
