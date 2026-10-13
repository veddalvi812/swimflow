"use client";

import { useRef, useState, type ComponentType } from "react";
import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Copy, Trash2 } from "lucide-react";
import { useFreeStore, isFreeId, STICKY_COLORS } from "@/store/free-store";
import { useDiagramStore } from "@/store/diagram-store";

const SHAPE_COLORS = ["#ffffff", ...STICKY_COLORS];

// Adds a small floating toolbar above a node while it's hovered or selected:
// color swatches (stickies and shapes), duplicate (free objects), and delete.
export function withToolbar(Inner: ComponentType<NodeProps>) {
  return function WithToolbar(props: NodeProps) {
    const { id, selected, type, data } = props;
    const [hover, setHover] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    // A short delay lets the pointer cross the gap between the node and its toolbar.
    const enter = () => {
      clearTimeout(timer.current);
      setHover(true);
    };
    const leave = () => {
      timer.current = setTimeout(() => setHover(false), 200);
    };

    const free = isFreeId(id);
    const colors = type === "sticky" ? STICKY_COLORS : type === "shape" ? SHAPE_COLORS : null;
    const color = (data as { color?: string }).color;
    const btn = "flex size-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white";

    return (
      <div className="h-full w-full" onMouseEnter={enter} onMouseLeave={leave}>
        <NodeToolbar isVisible={hover || selected} position={Position.Top} offset={10}>
          <div
            className="nodrag flex items-center gap-0.5 rounded-lg bg-[#1f1f23] p-1 shadow-lg"
            onMouseEnter={enter}
            onMouseLeave={leave}
          >
            {free && colors && (
              <>
                {colors.map((c) => (
                  <button
                    key={c}
                    aria-label={`Color ${c}`}
                    onClick={() => useFreeStore.getState().update(id, { color: c })}
                    className={`mx-0.5 size-4 rounded-full border border-white/30 ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#1f1f23]" : ""}`}
                    style={{ background: c }}
                  />
                ))}
                <span className="mx-1 h-4 w-px bg-white/20" />
              </>
            )}
            {free && (
              <button title="Duplicate" aria-label="Duplicate" onClick={() => useFreeStore.getState().duplicate(id)} className={btn}>
                <Copy className="size-4" />
              </button>
            )}
            <button
              title="Delete"
              aria-label="Delete"
              onClick={() => (free ? useFreeStore.getState().remove(id) : useDiagramStore.getState().deleteNode(id))}
              className={btn}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </NodeToolbar>
        <Inner {...props} />
      </div>
    );
  };
}
