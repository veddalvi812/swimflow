"use client";

import { useState, type ReactNode } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, BringToFront, Copy, Italic, Link2, List, Lock, MessageSquare,
  MoreHorizontal, SendToBack, Shapes, Square, Strikethrough, Trash2, Unlock,
} from "lucide-react";
import { useFreeStore, STICKY_COLORS } from "@/store/free-store";
import { FONTS, SHAPES, type Look } from "@/lib/style";

const FILLS = ["#ffffff", "#e4e4e7", ...STICKY_COLORS, "#fed7aa", "#fbcfe8"];
const SIZES = [12, 14, 16, 18, 24, 32, 48, 64];
const WIDTHS = [0, 1, 1.5, 2, 3, 4, 6];
const ALIGNS = { left: AlignLeft, center: AlignCenter, right: AlignRight } as const;

const btn = "flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white";
const on = "bg-white/20 text-white";
const field = "h-7 rounded-md bg-transparent px-1 text-xs text-white outline-none hover:bg-white/15 [&>option]:text-black";
const sep = <span className="mx-1 h-4 w-px bg-white/20" />;

function Pop({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`absolute bottom-full left-0 z-20 mb-2 flex flex-col gap-2 rounded-lg bg-[#1f1f23] p-2 text-xs text-white shadow-lg ${wide ? "w-52" : ""}`}>
      {children}
    </div>
  );
}

// Strips or adds a bullet on every non-empty line.
function toggleBullets(text: string) {
  const lines = text.split("\n");
  const bulleted = lines.filter((l) => l.trim()).every((l) => l.startsWith("• "));
  return lines.map((l) => (!l.trim() ? l : bulleted ? l.slice(2) : l.startsWith("• ") ? l : `• ${l}`)).join("\n");
}

// The formatting bar over a selected sticky, text, shape, or other free object.
export function FormatBar({
  id, type, canComment, onComment,
}: { id: string; type: string; canComment: boolean; onComment: () => void }) {
  const d = (useFreeStore((s) => s.nodes.find((n) => n.id === id)?.data) ?? {}) as Look & Record<string, string | number | boolean | undefined>;
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (name: string) => setOpen((o) => (o === name ? null : name));
  const set = (patch: Record<string, unknown>) => useFreeStore.getState().update(id, patch);
  const s = useFreeStore.getState;

  const hasText = ["sticky", "text", "shape"].includes(type);
  const hasFill = type === "sticky" || type === "shape";
  const align = d.align ?? (type === "shape" ? "center" : "left");
  const Align = ALIGNS[align];
  const locked = !!d.locked;
  const fillOpts = type === "sticky" ? STICKY_COLORS : FILLS;

  return (
    <div className="nodrag relative flex items-center gap-0.5 rounded-xl bg-[#1f1f23] p-1 shadow-lg">
      {type === "shape" && (
        <div className="relative">
          <button title="Shape" aria-label="Shape" onClick={() => toggle("shape")} className={`${btn} ${open === "shape" ? on : ""}`}>
            <Shapes className="size-4" />
          </button>
          {open === "shape" && (
            <Pop wide>
              <div className="grid grid-cols-2 gap-1">
                {SHAPES.map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => set({ shape: sh.id })}
                    className={`rounded-md px-2 py-1 text-left hover:bg-white/15 ${d.shape === sh.id ? on : ""}`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </Pop>
          )}
        </div>
      )}

      {hasFill && (
        <div className="relative">
          <button title="Fill color" aria-label="Fill color" onClick={() => toggle("fill")} className={`${btn} ${open === "fill" ? on : ""}`}>
            <span className="size-4 rounded-full border border-white/40" style={{ background: String(d.color ?? "#fff") }} />
          </button>
          {open === "fill" && (
            <Pop wide>
              <div className="flex flex-wrap items-center gap-1.5">
                {fillOpts.map((c) => (
                  <button
                    key={c}
                    aria-label={`Fill ${c}`}
                    onClick={() => set({ color: c })}
                    className={`size-5 rounded-full border border-white/30 ${d.color === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#1f1f23]" : ""}`}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Custom fill"
                  value={String(d.color ?? "#ffffff").length === 7 ? String(d.color) : "#ffffff"}
                  onChange={(e) => set({ color: e.target.value })}
                  className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </div>
              {type === "shape" && (
                <label className="flex items-center gap-2">
                  Opacity
                  <input type="range" min={0} max={1} step={0.05} value={d.fillOpacity ?? 1} onChange={(e) => set({ fillOpacity: Number(e.target.value) })} className="flex-1" />
                </label>
              )}
            </Pop>
          )}
        </div>
      )}

      {type === "shape" && (
        <div className="relative">
          <button title="Border" aria-label="Border" onClick={() => toggle("border")} className={`${btn} ${open === "border" ? on : ""}`}>
            <Square className="size-4" style={{ color: d.stroke ?? "#a1a1aa" }} />
          </button>
          {open === "border" && (
            <Pop wide>
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Border color" value={d.stroke ?? "#a1a1aa"} onChange={(e) => set({ stroke: e.target.value })} className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" />
                <select aria-label="Border width" value={d.strokeWidth ?? 1.5} onChange={(e) => set({ strokeWidth: Number(e.target.value) })} className={field}>
                  {WIDTHS.map((w) => (
                    <option key={w} value={w}>{w === 0 ? "None" : `${w} px`}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!d.dashed} onChange={(e) => set({ dashed: e.target.checked })} /> Dashed
                </label>
              </div>
              {d.shape === "rect" && (
                <label className="flex items-center gap-2">
                  Corners
                  <input type="range" min={0} max={40} value={d.radius ?? 8} onChange={(e) => set({ radius: Number(e.target.value) })} className="flex-1" />
                </label>
              )}
            </Pop>
          )}
        </div>
      )}

      {hasText && (
        <>
          {(hasFill || type === "shape") && sep}
          <select aria-label="Font" value={d.font ?? "sans"} onChange={(e) => set({ font: e.target.value })} className={field}>
            {Object.entries(FONTS).map(([k, f]) => (
              <option key={k} value={k}>{f.label}</option>
            ))}
          </select>
          <select
            aria-label="Font size"
            value={d.fontSize ?? ""}
            onChange={(e) => set({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
            className={field}
          >
            <option value="">Auto</option>
            {SIZES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {sep}
          <button title="Bold" aria-label="Bold" aria-pressed={!!d.bold} onClick={() => set({ bold: !d.bold })} className={`${btn} ${d.bold ? on : ""}`}>
            <Bold className="size-4" />
          </button>
          <button title="Italic" aria-label="Italic" aria-pressed={!!d.italic} onClick={() => set({ italic: !d.italic })} className={`${btn} ${d.italic ? on : ""}`}>
            <Italic className="size-4" />
          </button>
          <button title="Strikethrough" aria-label="Strikethrough" aria-pressed={!!d.strike} onClick={() => set({ strike: !d.strike })} className={`${btn} ${d.strike ? on : ""}`}>
            <Strikethrough className="size-4" />
          </button>
          <label title="Text color" className={`${btn} cursor-pointer`}>
            <span className="flex size-4 items-center justify-center rounded-sm border border-white/40 text-[10px] font-bold leading-none" style={{ color: d.textColor ?? "#fff" }}>A</span>
            <input type="color" aria-label="Text color" value={d.textColor ?? "#1a1a1a"} onChange={(e) => set({ textColor: e.target.value })} className="sr-only" />
          </label>
          <button
            title="Align"
            aria-label="Align text"
            onClick={() => set({ align: align === "left" ? "center" : align === "center" ? "right" : "left" })}
            className={btn}
          >
            <Align className="size-4" />
          </button>
          <button title="Bullet list" aria-label="Bullet list" onClick={() => set({ text: toggleBullets(String(d.text ?? "")) })} className={btn}>
            <List className="size-4" />
          </button>
          <div className="relative">
            <button title="Link" aria-label="Link" onClick={() => toggle("link")} className={`${btn} ${d.href || open === "link" ? on : ""}`}>
              <Link2 className="size-4" />
            </button>
            {open === "link" && (
              <Pop wide>
                <input
                  autoFocus
                  defaultValue={d.href ?? ""}
                  placeholder="Paste a link, press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      set({ href: e.currentTarget.value.trim() || undefined });
                      setOpen(null);
                    }
                    e.stopPropagation();
                  }}
                  className="h-7 rounded-md bg-white/10 px-2 text-xs text-white outline-none placeholder:text-white/40"
                />
                {d.href && (
                  <button onClick={() => { set({ href: undefined }); setOpen(null); }} className="rounded-md px-2 py-1 text-left hover:bg-white/15">
                    Remove link
                  </button>
                )}
              </Pop>
            )}
          </div>
          {sep}
        </>
      )}

      {canComment && (
        <button title="Comment" aria-label="Comment" onClick={onComment} className={btn}>
          <MessageSquare className="size-4" />
        </button>
      )}
      <div className="relative">
        <button title="More" aria-label="More" onClick={() => toggle("more")} className={`${btn} ${open === "more" ? on : ""}`}>
          <MoreHorizontal className="size-4" />
        </button>
        {open === "more" && (
          <Pop wide>
            <button onClick={() => { s().duplicate(id); setOpen(null); }} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/15"><Copy className="size-4" /> Duplicate</button>
            <button onClick={() => s().setLocked(!locked)} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/15">
              {locked ? <Unlock className="size-4" /> : <Lock className="size-4" />} {locked ? "Unlock" : "Lock in place"}
            </button>
            <button onClick={() => s().bringToFront()} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/15"><BringToFront className="size-4" /> Bring to front</button>
            <button onClick={() => s().sendToBack()} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/15"><SendToBack className="size-4" /> Send to back</button>
          </Pop>
        )}
      </div>
      <button title="Delete" aria-label="Delete" onClick={() => s().remove(id)} className={btn}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
