"use client";

import { useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Search, X } from "lucide-react";
import { useFreeStore } from "@/store/free-store";
import { useDiagramStore } from "@/store/diagram-store";
import { useUi } from "@/store/ui";

type Hit = { id: string; kind: string; text: string; free: boolean };

// Every piece of text an object carries, so search finds a card inside a kanban or a cell in a table.
function textsOf(data: Record<string, unknown>): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => !["id", "color", "src", "points"].includes(k) && walk(x));
  };
  walk(data);
  return out.filter((t) => t.trim());
}

export function SearchBox() {
  const open = useUi((s) => s.searching);
  const [q, setQ] = useState("");
  const freeNodes = useFreeStore((s) => s.nodes);
  const steps = useDiagramStore((s) => s.diagram.nodes);
  const { fitView } = useReactFlow();

  const hits = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const found: Hit[] = [];
    for (const n of steps) if (n.label.toLowerCase().includes(needle)) found.push({ id: n.id, kind: "Step", text: n.label, free: false });
    for (const n of freeNodes) {
      const match = textsOf(n.data).find((t) => t.toLowerCase().includes(needle));
      if (match) found.push({ id: n.id, kind: n.type ?? "Object", text: match, free: true });
    }
    return found.slice(0, 20);
  }, [q, freeNodes, steps]);

  if (!open) return null;

  const close = () => {
    setQ("");
    useUi.setState({ searching: false });
  };

  const go = (h: Hit) => {
    if (h.free) {
      useFreeStore.setState((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: n.id === h.id })) }));
    } else {
      useDiagramStore.getState().selectNode(h.id);
    }
    fitView({ nodes: [{ id: h.id }], padding: 0.8, maxZoom: 1.2, duration: 300 });
  };

  return (
    <div className="pointer-events-auto w-80 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-2 shadow-lg">
      <div className="flex items-center gap-2 px-1">
        <Search className="size-4 text-[var(--muted-foreground)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            if (e.key === "Enter" && hits[0]) go(hits[0]);
          }}
          placeholder="Search this board"
          aria-label="Search this board"
          className="h-8 flex-1 bg-transparent text-sm outline-none"
        />
        <button onClick={close} aria-label="Close search" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X className="size-4" />
        </button>
      </div>
      {q.trim() && (
        <ul className="mt-1 max-h-64 overflow-y-auto border-t border-[var(--border)] pt-1">
          {hits.length === 0 && <li className="px-2 py-2 text-xs text-[var(--muted-foreground)]">Nothing matches “{q}”.</li>}
          {hits.map((h) => (
            <li key={h.id}>
              <button onClick={() => go(h)} className="flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[var(--surface)]">
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{h.kind}</span>
                <span className="truncate text-sm">{h.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
