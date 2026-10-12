"use client";

import { useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useFreeStore, uid, type KanbanCol, type TimelineItem } from "@/store/free-store";

const SIDES = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
] as const;

function FreeHandles() {
  return SIDES.map(([id, pos]) => (
    <Handle key={id} id={id} type="source" position={pos} className="!h-2.5 !w-2.5 !border-none !bg-[#3b82f6]" />
  ));
}

function InlineEdit({
  value, onCommit, className = "", single = false,
}: { value: string; onCommit: (v: string) => void; className?: string; single?: boolean }) {
  const [editing, setEditing] = useState(false);

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
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (single && e.key === "Enter")) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`nodrag nowheel w-full resize-none bg-transparent outline-none ${single ? "" : "h-full"} ${className}`}
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
  return <InlineEdit value={text} onCommit={(v) => update(id, { text: v })} className={className} />;
}

const ring = (selected?: boolean) => (selected ? "outline outline-2 outline-offset-2 outline-[#3b82f6]" : "");

export function StickyNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string; color: string };
  return (
    <div
      className={`h-full w-full p-3 text-[14px] text-[#1a1a1a] shadow-md ${ring(selected)}`}
      style={{ background: d.color, borderRadius: 4 }}
    >
      <EditableText id={id} text={d.text} className="h-full" />
      <FreeHandles />
    </div>
  );
}

export function TextNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string };
  return (
    <div className={`min-w-[80px] px-1 py-0.5 text-[18px] text-[#1a1a1a] ${ring(selected)}`}>
      <EditableText id={id} text={d.text} />
      <FreeHandles />
    </div>
  );
}

export function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as { text: string; shape: "rect" | "ellipse" | "diamond"; color: string };
  return (
    <div className="relative h-full w-full">
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} />
      {d.shape === "diamond" ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            points="50,1 99,50 50,99 1,50"
            fill={d.color}
            stroke="#a1a1aa"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <div
          className="absolute inset-0 border-[1.5px] border-[#a1a1aa]"
          style={{ background: d.color, borderRadius: d.shape === "ellipse" ? "50%" : 8 }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] text-[#1a1a1a]">
        <EditableText id={id} text={d.text} className="text-center" />
      </div>
      <FreeHandles />
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
      <FreeHandles />
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
      <FreeHandles />
    </div>
  );
}
