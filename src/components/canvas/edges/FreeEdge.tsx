"use client";

import { useState } from "react";
import {
  BaseEdge, EdgeLabelRenderer, useStore, getBezierPath, getSmoothStepPath, getStraightPath, type EdgeProps,
} from "@xyflow/react";
import { ArrowRight, ArrowLeftRight, Minus, Pencil, Spline, Trash2, Waypoints } from "lucide-react";
import { useFreeStore } from "@/store/free-store";

const COLORS = ["#71717a", "#1a1a1a", "#ef4444", "#22c55e", "#3b82f6"];
const LINES = [
  { id: "smoothstep", label: "Elbow", Icon: Waypoints },
  { id: "straight", label: "Straight", Icon: Minus },
  { id: "default", label: "Curved", Icon: Spline },
] as const;
const ARROWS = ["none", "end", "both"] as const;

const btn = "flex h-7 min-w-7 items-center justify-center rounded-md px-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white";
const on = "bg-white/20 text-white";

// A connector between free objects. Select it to restyle it from the bar above its middle.
export function FreeEdge(p: EdgeProps) {
  const { id, selected, data, label, markerStart, markerEnd, style, labelStyle } = p;
  const { kind = "smoothstep", arrow = "end", dashed, color = "#71717a" } = (data ?? {}) as {
    kind?: string; arrow?: string; dashed?: boolean; color?: string;
  };
  const zoom = useStore((s) => s.transform[2]);
  const [open, setOpen] = useState<"color" | "label" | null>(null);
  const geo = { sourceX: p.sourceX, sourceY: p.sourceY, targetX: p.targetX, targetY: p.targetY, sourcePosition: p.sourcePosition, targetPosition: p.targetPosition };
  const [path, lx, ly] =
    kind === "straight" ? getStraightPath(geo) : kind === "default" ? getBezierPath(geo) : getSmoothStepPath({ ...geo, borderRadius: 8 });
  const update = useFreeStore.getState().updateEdge;
  const toggle = (name: "color" | "label") => setOpen((o) => (o === name ? null : name));

  return (
    <>
      <BaseEdge id={id} path={path} markerStart={markerStart} markerEnd={markerEnd} style={style} label={label} labelX={lx} labelY={ly} labelStyle={labelStyle} labelShowBg labelBgStyle={{ fill: "#ffffff", fillOpacity: 0.9 }} labelBgPadding={[6, 3]} labelBgBorderRadius={4} />
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute flex items-center gap-0.5 rounded-xl bg-[#1f1f23] p-1 shadow-lg"
            style={{ transform: `translate(-50%, -100%) translate(${lx}px, ${ly - 18 / zoom}px) scale(${1 / zoom})`, transformOrigin: "50% 100%", pointerEvents: "all" }}
          >
            {LINES.map(({ id: k, label: l, Icon }) => (
              <button key={k} title={l} aria-label={l} onClick={() => update(id, { type: k })} className={`${btn} ${kind === k ? on : ""}`}>
                <Icon className="size-4" />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-white/20" />
            <button
              title={`Arrowheads: ${arrow}`}
              aria-label="Arrowheads"
              onClick={() => update(id, { data: { arrow: ARROWS[(ARROWS.indexOf(arrow as never) + 1) % 3] } })}
              className={btn}
            >
              {arrow === "both" ? <ArrowLeftRight className="size-4" /> : <ArrowRight className={`size-4 ${arrow === "none" ? "opacity-30" : ""}`} />}
            </button>
            <button title="Dashed" aria-label="Dashed" aria-pressed={!!dashed} onClick={() => update(id, { data: { dashed: !dashed } })} className={`${btn} ${dashed ? on : ""}`}>
              <span className="w-4 border-t-2 border-dashed border-current" />
            </button>
            <div className="relative">
              <button title="Color" aria-label="Color" onClick={() => toggle("color")} className={`${btn} ${open === "color" ? on : ""}`}>
                <span className="size-4 rounded-full border border-white/40" style={{ background: color }} />
              </button>
              {open === "color" && (
                <div className="absolute bottom-full left-0 z-20 mb-2 flex items-center gap-1.5 rounded-lg bg-[#1f1f23] p-2 shadow-lg">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      aria-label={`Color ${c}`}
                      onClick={() => update(id, { data: { color: c } })}
                      className={`size-5 rounded-full border border-white/30 ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#1f1f23]" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button title="Label" aria-label="Label" onClick={() => toggle("label")} className={`${btn} ${open === "label" ? on : ""}`}>
                <Pencil className="size-4" />
              </button>
              {open === "label" && (
                <div className="absolute bottom-full left-0 z-20 mb-2 rounded-lg bg-[#1f1f23] p-2 shadow-lg">
                  <input
                    autoFocus
                    defaultValue={typeof label === "string" ? label : ""}
                    placeholder="Label, press Enter"
                    onChange={(e) => update(id, { label: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") setOpen(null);
                      e.stopPropagation();
                    }}
                    className="h-7 w-44 rounded-md bg-white/10 px-2 text-xs text-white outline-none placeholder:text-white/40"
                  />
                </div>
              )}
            </div>
            <button title="Delete" aria-label="Delete" onClick={() => useFreeStore.getState().applyEdgeChanges([{ id, type: "remove" }])} className={btn}>
              <Trash2 className="size-4" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
