"use client";

import { useState } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { hexToRgba, safeUrl, textStyle, type Look } from "@/lib/style";
import { AllHandles } from "./Handles";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useFreeStore, uid, type KanbanCol, type TimelineItem } from "@/store/free-store";

function InlineEdit({
  value, onCommit, className = "", single = false, force = false, onClose,
}: { value: string; onCommit: (v: string) => void; className?: string; single?: boolean; force?: boolean; onClose?: () => void }) {
  const [local, setEditing] = useState(false);
  const editing = local || force;

  if (editing) {
    return (
      <textarea
        autoFocus
        defaultValue={value}
        rows={single ? 1 : undefined}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={(e) => {
          onCommit(e.target.value);
          setEditing(false);
          onClose?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (single && e.key === "Enter")) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`nodrag nowheel w-full resize-none bg-transparent outline-none [field-sizing:content] ${single ? "" : "h-full"} ${className}`}
      />
    );
  }
  return (
    <div onDoubleClick={() => setEditing(true)} className={`w-full whitespace-pre-wrap break-words ${className}`}>
      {value || " "}
    </div>
  );
}

function EditableText({ id, text, className = "" }: { id: string; text: string; className?: string }) {
  const update = useFreeStore((s) => s.update);
  const force = useFreeStore((s) => s.editing === id);
  return (
    <InlineEdit
      value={text}
      onCommit={(v) => update(id, { text: v })}
      className={className}
      force={force}
      onClose={() => useFreeStore.getState().setEditing(null)}
    />
  );
}

// A small open-link button for objects that carry a link.
function LinkBadge({ href }: { href?: string }) {
  const url = href ? safeUrl(href) : null;
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      aria-label="Open link"
      className="nodrag absolute -right-2 -top-2 z-10 flex size-5 items-center justify-center rounded-full bg-white text-[#3b82f6] shadow ring-1 ring-[#e4e4e7]"
    >
      <ExternalLink className="size-3" />
    </a>
  );
}

const ring = (selected?: boolean) => (selected ? "outline outline-2 outline-offset-2 outline-[#3b82f6]" : "");

export function StickyNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Look & { text: string; color: string; author?: string };
  return (
    <div
      className={`flex h-full w-full flex-col p-3 text-[14px] text-[#1a1a1a] shadow-md ${ring(selected)}`}
      style={{ background: d.color, borderRadius: d.radius ?? 4 }}
    >
      <div className="min-h-0 flex-1" style={textStyle(d)}>
        <EditableText id={id} text={d.text} className="h-full" />
      </div>
      {d.author && <p className="mt-1 truncate text-[11px] text-black/50">{d.author}</p>}
      <LinkBadge href={d.href} />
      <AllHandles />
    </div>
  );
}

export function TextNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Look & { text: string };
  return (
    <div className={`min-w-[80px] px-1 py-0.5 text-[18px] text-[#1a1a1a] ${ring(selected)}`} style={textStyle(d)}>
      <EditableText id={id} text={d.text} />
      <LinkBadge href={d.href} />
      <AllHandles />
    </div>
  );
}

// Outlines on a 0-100 box, stretched to the node's size.
const POLYGONS: Record<string, string> = {
  diamond: "50,1 99,50 50,99 1,50",
  hexagon: "25,2 75,2 99,50 75,98 25,98 1,50",
  parallelogram: "18,2 99,2 82,98 1,98",
  triangle: "50,2 99,98 1,98",
  star: "50,2 61,38 98,38 68,60 79,96 50,74 21,96 32,60 2,38 39,38",
};
const PATHS: Record<string, { body: string; rim?: string }> = {
  cylinder: { body: "M1,12 C1,2 99,2 99,12 L99,88 C99,98 1,98 1,88 Z", rim: "M1,12 C1,22 99,22 99,12" },
  document: { body: "M1,2 H99 V84 Q75,70 50,84 T1,84 Z" },
  cloud: { body: "M25,80 C8,80 3,55 20,50 C15,30 40,20 52,32 C60,15 90,22 88,45 C100,50 98,80 80,80 Z" },
};

export function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Look & { text: string; shape: string; color: string };
  const stroke = d.stroke ?? "#a1a1aa";
  const width = d.strokeWidth ?? 1.5;
  const dash = d.dashed ? "6 4" : undefined;
  const fillOpacity = d.fillOpacity ?? 1;
  const polygon = POLYGONS[d.shape];
  const path = PATHS[d.shape];
  const line = { stroke, strokeWidth: width, strokeDasharray: dash, vectorEffect: "non-scaling-stroke" as const };

  return (
    <div className="relative h-full w-full">
      <NodeResizer isVisible={selected && !d.locked} minWidth={60} minHeight={40} />
      {polygon || path ? (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {polygon ? (
            <polygon points={polygon} fill={d.color} fillOpacity={fillOpacity} {...line} />
          ) : (
            <>
              <path d={path.body} fill={d.color} fillOpacity={fillOpacity} {...line} />
              {path.rim && <path d={path.rim} fill="none" {...line} />}
            </>
          )}
        </svg>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: hexToRgba(d.color, fillOpacity),
            borderRadius: d.shape === "ellipse" ? "50%" : d.radius ?? 8,
            borderStyle: d.dashed ? "dashed" : "solid",
            borderWidth: width,
            borderColor: stroke,
          }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] text-[#1a1a1a]">
        <div className="w-full" style={textStyle(d)}>
          <EditableText id={id} text={d.text} className="text-center" />
        </div>
      </div>
      <LinkBadge href={d.href} />
      <AllHandles />
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

export function KanbanNode({ id, data, selected }: NodeProps) {
  const d = data as { title: string; columns: KanbanCol[] };
  const update = useFreeStore((s) => s.update);
  const setCols = (columns: KanbanCol[]) => update(id, { columns });
  const patchCol = (cid: string, fn: (c: KanbanCol) => KanbanCol) =>
    setCols(d.columns.map((c) => (c.id === cid ? fn(c) : c)));

  // Drag payload is "fromColumn|cardId"; ignored if it didn't come from this board.
  const move = (raw: string, toCol: string, before?: string) => {
    const [fromCol, cardId] = raw.split("|");
    const card = d.columns.find((c) => c.id === fromCol)?.cards.find((c) => c.id === cardId);
    if (!card) return;
    const stripped = d.columns.map((c) => ({ ...c, cards: c.cards.filter((x) => x.id !== cardId) }));
    setCols(
      stripped.map((c) => {
        if (c.id !== toCol) return c;
        const i = before ? c.cards.findIndex((x) => x.id === before) : -1;
        const cards = [...c.cards];
        cards.splice(i < 0 ? cards.length : i, 0, card);
        return { ...c, cards };
      })
    );
  };

  return (
    <div className={`rounded-xl border border-[#e4e4e7] bg-white shadow-sm ${ring(selected)}`}>
      <div className="border-b border-[#e4e4e7] px-4 py-2.5 text-[14px] font-medium text-[#1a1a1a]">
        <InlineEdit single value={d.title} onCommit={(title) => update(id, { title })} />
      </div>
      <div className="nodrag flex items-start gap-3 p-3">
        {d.columns.map((col) => (
          <div
            key={col.id}
            className="w-56 shrink-0 rounded-lg bg-[#f4f4f5] p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => move(e.dataTransfer.getData("text/plain"), col.id)}
          >
            <div className="group flex items-center gap-1.5 px-1 pb-2 text-[12px] font-medium text-[#52525b]">
              <InlineEdit single value={col.title} onCommit={(title) => patchCol(col.id, (c) => ({ ...c, title }))} />
              <span className="text-[#a1a1aa]">{col.cards.length}</span>
              <button
                aria-label="Delete column"
                onClick={() => setCols(d.columns.filter((c) => c.id !== col.id))}
                className="hidden text-[#a1a1aa] hover:text-[#dc2626] group-hover:block"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", `${col.id}|${card.id}`)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    move(e.dataTransfer.getData("text/plain"), col.id, card.id);
                  }}
                  className="group/card relative cursor-grab rounded-md border border-[#e4e4e7] bg-white px-2.5 py-2 text-[13px] text-[#1a1a1a] shadow-sm"
                >
                  <InlineEdit
                    single
                    value={card.text}
                    onCommit={(text) =>
                      patchCol(col.id, (c) => ({ ...c, cards: c.cards.map((x) => (x.id === card.id ? { ...x, text } : x)) }))
                    }
                  />
                  <button
                    aria-label="Delete card"
                    onClick={() => patchCol(col.id, (c) => ({ ...c, cards: c.cards.filter((x) => x.id !== card.id) }))}
                    className="absolute right-1 top-1 hidden text-[#a1a1aa] hover:text-[#dc2626] group-hover/card:block"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => patchCol(col.id, (c) => ({ ...c, cards: [...c.cards, { id: uid(), text: "New card" }] }))}
              className="mt-2 flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-[#71717a] hover:bg-[#e4e4e7]"
            >
              <Plus className="size-3.5" /> Add card
            </button>
          </div>
        ))}
        <button
          onClick={() => setCols([...d.columns, { id: uid(), title: "New column", cards: [] }])}
          className="flex w-40 shrink-0 items-center gap-1 rounded-lg border border-dashed border-[#d4d4d8] px-3 py-2 text-[12px] text-[#71717a] hover:bg-[#f4f4f5]"
        >
          <Plus className="size-3.5" /> Add column
        </button>
      </div>
      <AllHandles />
    </div>
  );
}

export function TimelineNode({ id, data, selected }: NodeProps) {
  const d = data as { title: string; items: TimelineItem[] };
  const update = useFreeStore((s) => s.update);
  const setItems = (items: TimelineItem[]) => update(id, { items });
  const patch = (iid: string, p: Partial<TimelineItem>) =>
    setItems(d.items.map((i) => (i.id === iid ? { ...i, ...p } : i)));
  const shift = (idx: number, by: number) => {
    const items = [...d.items];
    [items[idx], items[idx + by]] = [items[idx + by], items[idx]];
    setItems(items);
  };

  return (
    <div className={`rounded-xl border border-[#e4e4e7] bg-white shadow-sm ${ring(selected)}`}>
      <div className="border-b border-[#e4e4e7] px-4 py-2.5 text-[14px] font-medium text-[#1a1a1a]">
        <InlineEdit single value={d.title} onCommit={(title) => update(id, { title })} />
      </div>
      <div className="nodrag flex items-start px-3 py-4">
        {d.items.map((item, idx) => (
          <div key={item.id} className="group relative w-40 shrink-0 px-2">
            <div className="mb-2 text-center text-[12px] font-medium text-[#3b82f6]">
              <InlineEdit single value={item.date} onCommit={(date) => patch(item.id, { date })} className="text-center" />
            </div>
            <div className="relative h-3">
              <div
                className="absolute top-1/2 h-px -translate-y-1/2 bg-[#d4d4d8]"
                style={{ left: idx === 0 ? "50%" : "-0.5rem", right: idx === d.items.length - 1 ? "50%" : "-0.5rem" }}
              />
              <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#3b82f6] bg-white" />
            </div>
            <div className="relative mt-2 rounded-md border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-2 text-center text-[13px] text-[#1a1a1a]">
              <InlineEdit value={item.text} onCommit={(text) => patch(item.id, { text })} className="text-center" />
              <div className="absolute -top-2 right-1 hidden gap-0.5 rounded bg-white shadow-sm ring-1 ring-[#e4e4e7] group-hover:flex">
                {idx > 0 && (
                  <button aria-label="Move left" onClick={() => shift(idx, -1)} className="text-[#71717a] hover:text-[#1a1a1a]">
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                {idx < d.items.length - 1 && (
                  <button aria-label="Move right" onClick={() => shift(idx, 1)} className="text-[#71717a] hover:text-[#1a1a1a]">
                    <ChevronRight className="size-4" />
                  </button>
                )}
                <button
                  aria-label="Delete item"
                  onClick={() => setItems(d.items.filter((i) => i.id !== item.id))}
                  className="text-[#a1a1aa] hover:text-[#dc2626]"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setItems([...d.items, { id: uid(), date: "Date", text: "New milestone" }])}
          className="ml-2 mt-6 flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-[#d4d4d8] px-3 py-2 text-[12px] text-[#71717a] hover:bg-[#f4f4f5]"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
      <AllHandles />
    </div>
  );
}

export function TableNode({ id, data, selected }: NodeProps) {
  const d = data as { title: string; headers: string[]; rows: string[][] };
  const update = useFreeStore((s) => s.update);
  const setHeader = (c: number, v: string) => update(id, { headers: d.headers.map((h, i) => (i === c ? v : h)) });
  const setCell = (r: number, c: number, v: string) =>
    update(id, { rows: d.rows.map((row, i) => (i === r ? d.headers.map((_, j) => (j === c ? v : row[j] ?? "")) : row)) });
  const addCol = () => update(id, { headers: [...d.headers, "Column"], rows: d.rows.map((r) => [...r, ""]) });
  const delCol = (c: number) =>
    update(id, { headers: d.headers.filter((_, i) => i !== c), rows: d.rows.map((r) => r.filter((_, i) => i !== c)) });
  const addRow = () => update(id, { rows: [...d.rows, d.headers.map(() => "")] });
  const delRow = (r: number) => update(id, { rows: d.rows.filter((_, i) => i !== r) });
  const hoverX = "hidden text-[#a1a1aa] hover:text-[#dc2626]";

  return (
    <div className={`rounded-xl border border-[#e4e4e7] bg-white shadow-sm ${ring(selected)}`}>
      <div className="border-b border-[#e4e4e7] px-4 py-2.5 text-[14px] font-medium text-[#1a1a1a]">
        <InlineEdit single value={d.title} onCommit={(title) => update(id, { title })} />
      </div>
      <div className="nodrag p-3">
        <div className="flex items-start gap-2">
          <table className="border-collapse text-[13px] text-[#1a1a1a]">
            <thead>
              <tr>
                {d.headers.map((h, c) => (
                  <th key={c} className="group relative w-36 border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-1.5 text-left font-medium">
                    <InlineEdit single value={h} onCommit={(v) => setHeader(c, v)} />
                    {d.headers.length > 1 && (
                      <button aria-label="Delete column" onClick={() => delCol(c)} className={`${hoverX} absolute right-1 top-1.5 group-hover:block`}>
                        <X className="size-3.5" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.rows.map((row, r) => (
                <tr key={r} className="group">
                  {d.headers.map((_, c) => (
                    <td key={c} className="border border-[#e4e4e7] px-2 py-1.5">
                      <InlineEdit single value={row[c] ?? ""} onCommit={(v) => setCell(r, c, v)} />
                    </td>
                  ))}
                  <td className="w-6 pl-1">
                    <button aria-label="Delete row" onClick={() => delRow(r)} className={`${hoverX} group-hover:block`}>
                      <X className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addCol}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-[#71717a] hover:bg-[#f4f4f5]"
          >
            <Plus className="size-3.5" /> Column
          </button>
        </div>
        <button
          onClick={addRow}
          className="mt-2 flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-[#71717a] hover:bg-[#f4f4f5]"
        >
          <Plus className="size-3.5" /> Row
        </button>
      </div>
      <AllHandles />
    </div>
  );
}

export function ImageNode({ data, selected }: NodeProps) {
  const d = data as { src: string; alt?: string; locked?: boolean };
  return (
    <div className={`relative h-full w-full ${ring(selected)}`}>
      <NodeResizer isVisible={selected && !d.locked} keepAspectRatio minWidth={40} minHeight={40} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.src} alt={d.alt ?? ""} draggable={false} className="h-full w-full select-none object-contain" />
      <AllHandles />
    </div>
  );
}

export function StampNode({ data, selected }: NodeProps) {
  const d = data as unknown as Look & { emoji: string };
  return (
    <div className={`select-none leading-none ${ring(selected)}`} style={{ fontSize: d.fontSize ?? 48 }}>
      {d.emoji}
      <AllHandles />
    </div>
  );
}

export function LinkNode({ id, data, selected }: NodeProps) {
  const d = data as { url: string; title: string };
  const update = useFreeStore((s) => s.update);
  const href = safeUrl(d.url);
  return (
    <div className={`flex w-64 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white p-3 text-[13px] shadow-sm ${ring(selected)}`}>
      <LinkIcon className="size-4 shrink-0 text-[#3b82f6]" />
      <div className="min-w-0 flex-1">
        <InlineEdit single value={d.title} onCommit={(title) => update(id, { title })} className="truncate font-medium text-[#1a1a1a]" />
        <p className="truncate text-[11px] text-[#a1a1aa]">{d.url}</p>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title="Open link"
          aria-label="Open link"
          className="nodrag shrink-0 rounded p-1 text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#1a1a1a]"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
      <AllHandles />
    </div>
  );
}

// A pen stroke or straight arrow. Points are in the stroke's own box so it can be resized.
export function PenNode({ id, data, selected }: NodeProps) {
  const d = data as { points: number[][]; vw: number; vh: number; color: string; width: number; arrow?: boolean; locked?: boolean };
  return (
    <div className={`h-full w-full ${selected ? "outline outline-1 outline-dashed outline-[#3b82f6]" : ""}`}>
      <NodeResizer isVisible={selected && !d.locked} minWidth={8} minHeight={8} />
      <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${d.vw} ${d.vh}`} preserveAspectRatio="none">
        {d.arrow && (
          <defs>
            <marker id={`head-${id}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" fill={d.color} />
            </marker>
          </defs>
        )}
        <polyline
          points={d.points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={d.color}
          strokeWidth={d.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          markerEnd={d.arrow ? `url(#head-${id})` : undefined}
        />
      </svg>
    </div>
  );
}
