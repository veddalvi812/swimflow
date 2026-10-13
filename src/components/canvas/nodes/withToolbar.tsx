"use client";

import { useRef, useState, type ComponentType } from "react";
import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Copy, MessageSquare, Square, Trash2 } from "lucide-react";
import { useFreeStore, isFreeId } from "@/store/free-store";
import type { NodeType } from "@/types/diagram";
import { NODE_TYPE_LABELS } from "../PropertiesPanel";
import { FillMenu, Pop, StrokeMenu } from "./menus";
import { FormatBar } from "./FormatBar";
import { useDiagramStore } from "@/store/diagram-store";
import { useBoardCtx } from "@/store/board-ctx";
import { useUi } from "@/store/ui";

// Adds a small floating toolbar above a node while it's hovered or selected:
// color swatches (stickies and shapes), duplicate (free objects), and delete.
export function withToolbar(Inner: ComponentType<NodeProps>) {
  return function WithToolbar(props: NodeProps) {
    const { id, selected, type, data } = props;
    const step = data as { fill?: string; dashed?: boolean; stroke?: string };
    const [menu, setMenu] = useState<"fill" | "stroke" | null>(null);
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
    const canComment = useBoardCtx((b) => !!b.boardId) && free;
    const open = useBoardCtx((b) => b.comments.filter((c) => c.node_id === id && !c.resolved).length);
    const several = useFreeStore((s) => s.nodes.reduce((n, x) => n + (x.selected ? 1 : 0), 0)) > 1;
    const btn = "flex size-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white";
    const comment = () => {
      useFreeStore.setState((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: n.id === id })) }));
      useUi.setState({ requestTab: "comments" });
    };

    return (
      <div className="relative h-full w-full" onMouseEnter={enter} onMouseLeave={leave}>
        {open > 0 && (
          <span className="pointer-events-none absolute -right-2 -top-2 z-10 flex size-5 items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-medium text-white shadow">
            {open}
          </span>
        )}
        <NodeToolbar isVisible={(hover || selected) && !(selected && several)} position={Position.Top} offset={10}>
          {free && selected ? (
            <FormatBar id={id} type={type ?? ""} canComment={canComment} onComment={comment} />
          ) : (
            <div className="nodrag flex items-center gap-0.5 rounded-lg bg-[#1f1f23] p-1 shadow-lg" onMouseEnter={enter} onMouseLeave={leave}>
              {!free && (
                <select
                  aria-label="Step type"
                  value={type}
                  onChange={(e) => useDiagramStore.getState().updateNode(id, { type: e.target.value as NodeType })}
                  className="h-7 rounded-md bg-transparent px-1 text-xs text-white outline-none hover:bg-white/15 [&>option]:text-black"
                >
                  {Object.entries(NODE_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              )}
              {!free && selected && (
                <>
                  <span className="mx-0.5 h-4 w-px bg-white/20" />
                  <div className="relative">
                    <button title="Fill" aria-label="Fill color" onClick={() => setMenu(menu === "fill" ? null : "fill")} className={`${btn} ${menu === "fill" ? "bg-white/20" : ""}`}>
                      <span className="size-4 rounded-full border border-white/40" style={{ background: step.fill ?? "#ffffff" }} />
                    </button>
                    {menu === "fill" && (
                      <Pop>
                        <FillMenu
                          color={step.fill}
                          mode={step.fill ? "fill" : "none"}
                          modes={["fill", "none"]}
                          onColor={(fill) => useDiagramStore.getState().updateNode(id, { fill })}
                          onMode={(m) => m === "none" && useDiagramStore.getState().updateNode(id, { fill: undefined })}
                        />
                      </Pop>
                    )}
                  </div>
                  <div className="relative">
                    <button title="Outline" aria-label="Outline" onClick={() => setMenu(menu === "stroke" ? null : "stroke")} className={`${btn} ${menu === "stroke" ? "bg-white/20" : ""}`}>
                      <Square className="size-4" style={{ color: step.stroke === "none" ? "#ffffff55" : step.stroke ?? "#ffffffcc" }} strokeDasharray={step.dashed ? "3 2" : undefined} />
                    </button>
                    {menu === "stroke" && (
                      <Pop>
                        <StrokeMenu
                          color={step.stroke === "none" ? undefined : step.stroke}
                          mode={step.stroke === "none" ? "none" : step.dashed ? "dashed" : "solid"}
                          onColor={(stroke) => useDiagramStore.getState().updateNode(id, { stroke })}
                          onMode={(m) =>
                            useDiagramStore.getState().updateNode(id, {
                              dashed: m === "dashed" || undefined,
                              stroke: m === "none" ? "none" : step.stroke === "none" ? undefined : step.stroke,
                            })
                          }
                        />
                      </Pop>
                    )}
                  </div>
                </>
              )}
              {canComment && (
                <button title="Comment" aria-label="Comment" onClick={comment} className={btn}>
                  <MessageSquare className="size-4" />
                </button>
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
          )}
        </NodeToolbar>
        <Inner {...props} />
      </div>
    );
  };
}
