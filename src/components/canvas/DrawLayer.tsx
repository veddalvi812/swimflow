"use client";

import { useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFreeStore } from "@/store/free-store";

const PAD = 8;
const COLOR = "#1a1a1a";
const WIDTH = 3;

// Catches the pointer while the pen or arrow tool is armed and turns the stroke into a canvas object.
export function DrawLayer() {
  const tool = useFreeStore((s) => s.tool);
  const { screenToFlowPosition } = useReactFlow();
  const [pts, setPts] = useState<number[][]>([]);
  const drawing = useRef(false);

  if (tool !== "pen" && tool !== "arrow") return null;

  const finish = () => {
    drawing.current = false;
    const screen = pts;
    setPts([]);
    if (screen.length < 2) return;
    const [sx, sy] = screen[0];
    const [ex, ey] = screen[screen.length - 1];
    if (Math.hypot(ex - sx, ey - sy) < 6 && screen.length < 6) return;

    const flow = screen.map(([x, y]) => {
      const p = screenToFlowPosition({ x, y });
      return [p.x, p.y];
    });
    const xs = flow.map((p) => p[0]);
    const ys = flow.map((p) => p[1]);
    const minX = Math.min(...xs) - PAD;
    const minY = Math.min(...ys) - PAD;
    const w = Math.max(...xs) - minX + PAD;
    const h = Math.max(...ys) - minY + PAD;
    useFreeStore.getState().addBlock(
      "pen",
      {
        points: flow.map(([x, y]) => [Math.round((x - minX) * 10) / 10, Math.round((y - minY) * 10) / 10]),
        vw: w,
        vh: h,
        color: COLOR,
        width: WIDTH,
        arrow: tool === "arrow",
      },
      { x: minX + w / 2, y: minY + h / 2 },
      { w, h, fixed: true, keepTool: true }
    );
  };

  return (
    <div
      className="absolute inset-0 z-[4] cursor-crosshair touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drawing.current = true;
        setPts([[e.clientX, e.clientY]]);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const x = e.clientX;
        const y = e.clientY;
        setPts((p) => {
          if (tool === "arrow") return [p[0], [x, y]];
          const last = p[p.length - 1];
          return Math.hypot(x - last[0], y - last[1]) < 2 || p.length > 2000 ? p : [...p, [x, y]];
        });
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {pts.length > 1 && (
        <svg className="pointer-events-none h-full w-full">
          <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={COLOR} strokeWidth={WIDTH} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
