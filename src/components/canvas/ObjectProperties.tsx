"use client";

import type { ReactNode } from "react";
import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalSpaceAround,
  AlignLeft, AlignCenter, AlignRight, AlignStartHorizontal, AlignStartVertical, AlignVerticalSpaceAround, Bold,
  BringToFront, Copy, Italic, Lock, SendToBack, Trash2, Unlock,
} from "lucide-react";
import { useFreeStore, STICKY_COLORS } from "@/store/free-store";
import { SHAPES, type Look } from "@/lib/style";
import { Button } from "@/components/ui/button";

export const card =
  "pointer-events-auto flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-md";
export const maxH = { maxHeight: "calc(100vh - 170px)" };

const input =
  "h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--border-focus)]";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</span>
      {children}
    </div>
  );
}

function IconBtn({ label, on, onClick, children }: { label: string; on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      title={label}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded-md transition-colors ${
        on ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function Swatches({ colors, value, onPick }: { colors: string[]; value?: string; onPick: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          aria-label={`Color ${c}`}
          onClick={() => onPick(c)}
          className={`size-6 rounded-full border ${value === c ? "ring-2 ring-[#3b82f6] ring-offset-1" : "border-[var(--border)]"}`}
          style={{ background: c }}
        />
      ))}
      <input
        type="color"
        aria-label="Custom color"
        value={value && value.startsWith("#") && value.length === 7 ? value : "#ffffff"}
        onChange={(e) => onPick(e.target.value)}
        className="h-6 w-8 cursor-pointer rounded border border-[var(--border)] p-0"
      />
    </div>
  );
}

// Duplicate, delete, lock, and stacking order for whatever is selected.
export function ArrangeRow() {
  const duplicateSel = () => {
    const s = useFreeStore.getState();
    s.copy();
    s.paste();
  };
  const locked = useFreeStore((s) => s.nodes.some((n) => n.selected && n.data?.locked));
  const { bringToFront, sendToBack, setLocked, removeSelected } = useFreeStore.getState();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 rounded-md bg-[var(--surface)] p-0.5">
        <IconBtn label="Bring to front" onClick={bringToFront}><BringToFront className="size-4" /></IconBtn>
        <IconBtn label="Send to back" onClick={sendToBack}><SendToBack className="size-4" /></IconBtn>
        <IconBtn label={locked ? "Unlock" : "Lock in place"} on={locked} onClick={() => setLocked(!locked)}>
          {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
        </IconBtn>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={duplicateSel}>
          <Copy className="size-3.5" /> Duplicate
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={removeSelected}>
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

const SIZES = [12, 14, 16, 18, 24, 32, 48, 64];
const WIDTHS = [0, 1, 1.5, 2, 3, 4, 6];
const PEN_COLORS = ["#1a1a1a", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];

export function FreeProperties({ id }: { id: string }) {
  const node = useFreeStore((s) => s.nodes.find((n) => n.id === id));
  const update = useFreeStore((s) => s.update);
  if (!node) return null;
  const d = node.data as Look & Record<string, string | number | boolean | undefined>;
  const set = (patch: Record<string, unknown>) => update(id, patch);
  const type = node.type ?? "";
  const hasText = ["sticky", "text", "shape"].includes(type);
  const fills = type === "sticky" ? STICKY_COLORS : type === "shape" ? ["#ffffff", ...STICKY_COLORS] : null;

  return (
    <div className={card} style={maxH}>
      <h3 className="text-sm font-semibold capitalize">{type === "pen" ? (d.arrow ? "Arrow" : "Pen stroke") : type}</h3>

      {hasText && (
        <>
          <textarea
            value={String(d.text ?? "")}
            onChange={(e) => set({ text: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-sm outline-none focus:border-[var(--border-focus)]"
          />
          <Row label="Text">
            <div className="flex items-center gap-1">
              <select
                aria-label="Font size"
                value={d.fontSize ?? ""}
                onChange={(e) => set({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
                className="h-7 rounded-md border border-[var(--border)] bg-[var(--background)] px-1 text-xs"
              >
                <option value="">Auto</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <IconBtn label="Bold" on={!!d.bold} onClick={() => set({ bold: !d.bold })}><Bold className="size-4" /></IconBtn>
              <IconBtn label="Italic" on={!!d.italic} onClick={() => set({ italic: !d.italic })}><Italic className="size-4" /></IconBtn>
              <IconBtn label="Align left" on={d.align === "left"} onClick={() => set({ align: "left" })}><AlignLeft className="size-4" /></IconBtn>
              <IconBtn label="Align center" on={d.align === "center"} onClick={() => set({ align: "center" })}><AlignCenter className="size-4" /></IconBtn>
              <IconBtn label="Align right" on={d.align === "right"} onClick={() => set({ align: "right" })}><AlignRight className="size-4" /></IconBtn>
              <input
                type="color"
                aria-label="Text color"
                value={d.textColor ?? "#1a1a1a"}
                onChange={(e) => set({ textColor: e.target.value })}
                className="ml-auto h-6 w-7 cursor-pointer rounded border border-[var(--border)] p-0"
              />
            </div>
          </Row>
        </>
      )}

      {fills && (
        <Row label="Fill">
          <Swatches colors={fills} value={String(d.color ?? "")} onPick={(color) => set({ color })} />
        </Row>
      )}

      {type === "shape" && (
        <>
          <Row label="Shape">
            <select value={String(d.shape)} onChange={(e) => set({ shape: e.target.value })} className={input}>
              {SHAPES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Row>
          <Row label="Border">
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Border color"
                value={d.stroke ?? "#a1a1aa"}
                onChange={(e) => set({ stroke: e.target.value })}
                className="h-7 w-8 cursor-pointer rounded border border-[var(--border)] p-0"
              />
              <select
                aria-label="Border width"
                value={d.strokeWidth ?? 1.5}
                onChange={(e) => set({ strokeWidth: Number(e.target.value) })}
                className="h-7 rounded-md border border-[var(--border)] bg-[var(--background)] px-1 text-xs"
              >
                {WIDTHS.map((w) => (
                  <option key={w} value={w}>{w === 0 ? "None" : `${w} px`}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={!!d.dashed} onChange={(e) => set({ dashed: e.target.checked })} /> Dashed
              </label>
            </div>
          </Row>
          <Row label={`Fill opacity ${Math.round((d.fillOpacity ?? 1) * 100)}%`}>
            <input type="range" min={0} max={1} step={0.05} value={d.fillOpacity ?? 1} onChange={(e) => set({ fillOpacity: Number(e.target.value) })} />
          </Row>
          {d.shape === "rect" && (
            <Row label={`Corner radius ${d.radius ?? 8}`}>
              <input type="range" min={0} max={40} step={1} value={d.radius ?? 8} onChange={(e) => set({ radius: Number(e.target.value) })} />
            </Row>
          )}
        </>
      )}

      {type === "stamp" && (
        <Row label="Size">
          <select value={d.fontSize ?? 48} onChange={(e) => set({ fontSize: Number(e.target.value) })} className={input}>
            {[24, 32, 48, 64, 96, 128].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Row>
      )}

      {type === "pen" && (
        <>
          <Row label="Color">
            <Swatches colors={PEN_COLORS} value={String(d.color ?? "")} onPick={(color) => set({ color })} />
          </Row>
          <Row label="Thickness">
            <select value={Number(d.width ?? 3)} onChange={(e) => set({ width: Number(e.target.value) })} className={input}>
              {[1, 2, 3, 5, 8, 12].map((w) => (
                <option key={w} value={w}>{w} px</option>
              ))}
            </select>
          </Row>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!d.arrow} onChange={(e) => set({ arrow: e.target.checked })} /> Arrowhead
          </label>
        </>
      )}

      {type === "link" && (
        <>
          <Row label="Title">
            <input value={String(d.title ?? "")} onChange={(e) => set({ title: e.target.value })} className={input} />
          </Row>
          <Row label="Address">
            <input value={String(d.url ?? "")} onChange={(e) => set({ url: e.target.value })} className={input} />
          </Row>
        </>
      )}

      {type === "image" && (
        <Row label="Description (for screen readers)">
          <input value={String(d.alt ?? "")} onChange={(e) => set({ alt: e.target.value })} className={input} />
        </Row>
      )}

      <ArrangeRow />
    </div>
  );
}

// Two or more objects selected: line them up, spread them out, or change them together.
export function MultiProperties({ count }: { count: number }) {
  const { align, distribute } = useFreeStore.getState();
  return (
    <div className={card} style={maxH}>
      <h3 className="text-sm font-semibold">{count} objects selected</h3>
      <Row label="Align">
        <div className="flex items-center gap-1 rounded-md bg-[var(--surface)] p-0.5">
          <IconBtn label="Align left" onClick={() => align("left")}><AlignStartVertical className="size-4" /></IconBtn>
          <IconBtn label="Align centers" onClick={() => align("center")}><AlignCenterVertical className="size-4" /></IconBtn>
          <IconBtn label="Align right" onClick={() => align("right")}><AlignEndVertical className="size-4" /></IconBtn>
          <span className="mx-0.5 h-4 w-px bg-[var(--border)]" />
          <IconBtn label="Align top" onClick={() => align("top")}><AlignStartHorizontal className="size-4" /></IconBtn>
          <IconBtn label="Align middles" onClick={() => align("middle")}><AlignCenterHorizontal className="size-4" /></IconBtn>
          <IconBtn label="Align bottom" onClick={() => align("bottom")}><AlignEndHorizontal className="size-4" /></IconBtn>
        </div>
      </Row>
      <Row label="Distribute (3 or more)">
        <div className="flex items-center gap-1 rounded-md bg-[var(--surface)] p-0.5">
          <IconBtn label="Space evenly across" onClick={() => distribute("x")}><AlignHorizontalSpaceAround className="size-4" /></IconBtn>
          <IconBtn label="Space evenly down" onClick={() => distribute("y")}><AlignVerticalSpaceAround className="size-4" /></IconBtn>
        </div>
      </Row>
      <ArrangeRow />
    </div>
  );
}

const STYLES = [
  { id: "smoothstep", label: "Elbow" },
  { id: "straight", label: "Straight" },
  { id: "default", label: "Curved" },
];
const ARROWS = [
  { id: "none", label: "None" },
  { id: "end", label: "End" },
  { id: "both", label: "Both" },
];

export function EdgeProperties({ id }: { id: string }) {
  const edge = useFreeStore((s) => s.edges.find((e) => e.id === id));
  const updateEdge = useFreeStore((s) => s.updateEdge);
  if (!edge) return null;
  const data = (edge.data ?? {}) as { arrow?: string; dashed?: boolean; color?: string };
  const style = edge.type ?? "smoothstep";
  const arrow = data.arrow ?? "end";

  const seg = (items: { id: string; label: string }[], value: string, onPick: (id: string) => void) => (
    <div className="flex gap-1 rounded-md bg-[var(--surface)] p-0.5">
      {items.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.id)}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
            value === o.id ? "bg-[var(--surface-raised)] shadow-sm" : "text-[var(--muted-foreground)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={card} style={maxH}>
      <h3 className="text-sm font-semibold">Connector</h3>
      <Row label="Label">
        <input
          value={typeof edge.label === "string" ? edge.label : ""}
          onChange={(e) => updateEdge(id, { label: e.target.value })}
          placeholder="Add a label"
          className={input}
        />
      </Row>
      <Row label="Line">{seg(STYLES, style, (type) => updateEdge(id, { type }))}</Row>
      <Row label="Arrowheads">{seg(ARROWS, arrow, (a) => updateEdge(id, { data: { arrow: a } }))}</Row>
      <Row label="Color">
        <Swatches colors={["#71717a", "#1a1a1a", "#ef4444", "#22c55e", "#3b82f6"]} value={data.color} onPick={(color) => updateEdge(id, { data: { color } })} />
      </Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!data.dashed} onChange={(e) => updateEdge(id, { data: { dashed: e.target.checked } })} /> Dashed
      </label>
      <Button
        variant="destructive"
        size="sm"
        className="gap-1.5"
        onClick={() => useFreeStore.getState().applyEdgeChanges([{ id, type: "remove" }])}
      >
        <Trash2 className="size-3.5" /> Delete connector
      </Button>
    </div>
  );
}
