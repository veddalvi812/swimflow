"use client";

import { useRef, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, useReactFlow, useStore, type EdgeProps } from "@xyflow/react";
import { useDiagramStore } from "@/store/diagram-store";
import { EDGE_KINDS } from "@/lib/look";
import type { EdgeType } from "@/types/diagram";

type Pt = [number, number];

// A polyline with softly rounded corners.
function roundedPath(pts: Pt[], radius = 8) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const ax = x - ((x - px) / inLen) * r;
    const ay = y - ((y - py) / inLen) * r;
    const bx = x + ((nx - x) / outLen) * r;
    const by = y + ((ny - y) / outLen) * r;
    d += ` L ${ax} ${ay} Q ${x} ${y} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

// The middle of the longest straight run: a roomy spot for the label and the steering dot.
function anchorPoint(pts: Pt[]): Pt {
  let best = 0;
  let at: Pt = pts[0];
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (len > best) {
      best = len;
      at = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    }
  }
  return at;
}

// A swimlane connector drawn along a route worked out by the layout. Select it to steer it with the dot.
export function RoutedEdge({
  id, data, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius, markerEnd, style,
}: EdgeProps) {
  const selected = useDiagramStore((s) => s.selectedEdgeId === id);
  const { screenToFlowPosition } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);
  const kindNow = useDiagramStore((s) => s.diagram.edges.find((e) => e.id === id)?.type ?? "default");
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  // The latest pointer position, kept outside React state so a quick release still commits it.
  const latest = useRef<{ x: number; y: number } | null>(null);

  const { points, via } = (data ?? {}) as { points?: Pt[]; via?: { x: number; y: number } };
  if (!points || points.length < 2) return null;
  const [lx, ly] = anchorPoint(points);
  const dot = drag ?? via ?? { x: lx, y: ly };

  return (
    <>
      <BaseEdge
        id={id}
        path={roundedPath(points)}
        markerEnd={markerEnd}
        style={style}
        label={label}
        labelX={lx}
        labelY={ly}
        labelStyle={labelStyle}
        labelShowBg
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute flex items-center gap-1 rounded-lg bg-[#1f1f23] p-1 shadow-lg"
            style={{ transform: `translate(-50%, -100%) translate(${dot.x}px, ${dot.y - 14 / zoom}px) scale(${1 / zoom})`, transformOrigin: "50% 100%", pointerEvents: "all" }}
          >
            {(Object.entries(EDGE_KINDS) as [EdgeType, (typeof EDGE_KINDS)[EdgeType]][]).map(([k, v]) => (
              <button
                key={k}
                title={v.label}
                aria-label={v.label}
                onClick={() => useDiagramStore.getState().updateEdge(id, { type: k })}
                className={`flex h-6 items-center rounded px-1.5 text-[11px] font-medium text-white ${kindNow === k ? "ring-2 ring-white" : "opacity-80 hover:opacity-100"}`}
                style={{ background: v.color ?? "#71717a" }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            title="Drag to steer this connector. Double-click to reset."
            aria-label="Steer connector"
            className="nodrag nopan absolute size-3.5 cursor-grab rounded-full border-2 border-white bg-[#3b82f6] shadow ring-1 ring-[#3b82f6]"
            style={{ transform: `translate(-50%, -50%) translate(${dot.x}px, ${dot.y}px)`, pointerEvents: "all" }}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onPointerMove={(e) => {
              if (!e.buttons) return;
              latest.current = screenToFlowPosition({ x: e.clientX, y: e.clientY });
              setDrag(latest.current);
            }}
            onPointerUp={() => {
              const at = latest.current;
              latest.current = null;
              setDrag(null);
              if (at) useDiagramStore.getState().setEdgeVia(id, { x: Math.round(at.x), y: Math.round(at.y) });
            }}
            onDoubleClick={() => useDiagramStore.getState().setEdgeVia(id, undefined)}
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
}
