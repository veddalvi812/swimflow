"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Shared dark menus for the object bars: a popover shell, a color palette, and fill and stroke panels.
export const PALETTE = [
  "#1e1e1e", "#757575", "#f24822", "#ff9e42", "#ffd02f", "#66d575", "#5ad8cc", "#3dadff", "#9747ff", "#ff4cc4", "#ffffff",
  "#b3b3b3", "#d9d9d9", "#ffc7c2", "#ffe0c2", "#ffecbd", "#cdf4d3", "#c6f7f4", "#bde3ff", "#dcccff", "#ffd1f0",
];

export function Pop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [below, setBelow] = useState(false);
  // Opens above the bar; flips below it when there's no room at the top of the screen.
  useLayoutEffect(() => {
    if (ref.current && ref.current.getBoundingClientRect().top < 8) setBelow(true);
  }, []);
  return (
    <div
      ref={ref}
      className={`absolute left-0 z-20 flex w-64 flex-col gap-2 rounded-xl bg-[#1f1f23] p-2 text-xs text-white shadow-lg ${below ? "top-full mt-2" : "bottom-full mb-2"}`}
    >
      {children}
    </div>
  );
}

function Palette({ value, onPick }: { value?: string; onPick: (c: string) => void }) {
  const hex = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
  return (
    <div className="grid grid-cols-11 gap-1.5 border-t border-white/10 pt-2">
      {PALETTE.map((c) => (
        <button
          key={c}
          aria-label={`Color ${c}`}
          onClick={() => onPick(c)}
          className={`size-4 rounded-full border border-white/25 ${value?.toLowerCase() === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#1f1f23]" : ""}`}
          style={{ background: c }}
        />
      ))}
      <label
        aria-label="Custom color"
        title="Custom color"
        className="relative size-4 cursor-pointer overflow-hidden rounded-full"
        style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
      >
        <input type="color" value={hex} onChange={(e) => onPick(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
    </div>
  );
}

function Modes<T extends string>({ items, value, onPick }: { items: { id: T; label: string }[]; value: T; onPick: (id: T) => void }) {
  return (
    <div className="flex gap-1">
      {items.map((m) => (
        <button
          key={m.id}
          onClick={() => onPick(m.id)}
          className={`flex-1 rounded-md px-2 py-1 font-medium ${value === m.id ? "bg-[#7c3aed] text-white" : "text-white/70 hover:bg-white/10"}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export type FillMode = "fill" | "transparent" | "none";
export type StrokeMode = "solid" | "dashed" | "none";

export function FillMenu({
  color, mode, modes, onColor, onMode,
}: { color?: string; mode: FillMode; modes: FillMode[]; onColor: (c: string) => void; onMode: (m: FillMode) => void }) {
  const names = { fill: "Fill", transparent: "Transparent", none: "No fill" };
  return (
    <>
      <Modes items={modes.map((id) => ({ id, label: names[id] }))} value={mode} onPick={onMode} />
      <Palette value={color} onPick={onColor} />
    </>
  );
}

export function StrokeMenu({
  color, mode, width, onColor, onMode, onWidth,
}: {
  color?: string; mode: StrokeMode; width?: number;
  onColor: (c: string) => void; onMode: (m: StrokeMode) => void; onWidth?: (w: number) => void;
}) {
  return (
    <>
      <Modes
        items={[{ id: "solid", label: "Solid" }, { id: "dashed", label: "Dashed" }, { id: "none", label: "None" }]}
        value={mode}
        onPick={onMode}
      />
      <Palette value={color} onPick={onColor} />
      {onWidth && mode !== "none" && (
        <div className="flex items-center gap-1 border-t border-white/10 pt-2">
          <span className="mr-1 text-white/60">Width</span>
          {[1, 1.5, 2, 3, 4, 6].map((w) => (
            <button key={w} onClick={() => onWidth(w)} className={`flex-1 rounded-md py-1 ${width === w ? "bg-white/20" : "hover:bg-white/10"}`}>
              {w}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
