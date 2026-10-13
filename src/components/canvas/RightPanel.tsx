"use client";

import { useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore, snapshotOf, STICKY_COLORS } from "@/store/free-store";
import { applyBoardJSON } from "@/lib/board-json";
import { MakeWizard } from "./MakeWizard";
import { BLOCK_SPECS } from "@/lib/generators";
import { PropertiesPanel } from "./PropertiesPanel";
import { Button } from "@/components/ui/button";

const card =
  "pointer-events-auto flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-md";
const maxH = { maxHeight: "calc(100vh - 170px)" };

function BlockProperties({ id, kind }: { id: string; kind: string }) {
  const node = useFreeStore((s) => s.nodes.find((n) => n.id === id));
  const update = useFreeStore((s) => s.update);
  const removeSelected = useFreeStore((s) => s.removeSelected);
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState("");
  const cfg = BLOCK_SPECS[kind];
  if (!node) return null;
  const d = node.data as { title: string };

  const apply = () => {
    try {
      const raw = paste.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const p = JSON.parse(raw);
      if (!Array.isArray(p[cfg.key])) throw new Error(`Needs a ${cfg.key} array`);
      update(id, { ...cfg.normalize(p), ...(p.title ? { title: p.title } : {}) });
      setPaste("");
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className={card} style={maxH}>
      <h3 className="text-sm font-semibold">{cfg.label}</h3>
      <input
        value={d.title}
        onChange={(e) => update(id, { title: e.target.value })}
        className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 text-sm outline-none focus:border-[var(--border-focus)]"
      />
      <p className="text-xs text-[var(--muted-foreground)]">Generate with any AI: copy the prompt, paste the JSON it returns.</p>
      <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => navigator.clipboard.writeText(cfg.prompt)}>
        <Copy className="size-3.5" /> Copy AI prompt
      </Button>
      <textarea
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste JSON here"
        rows={5}
        className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] p-2 font-mono text-[11px] outline-none focus:border-[var(--border-focus)]"
      />
      {err && <p className="text-xs text-[var(--error)]">{err}</p>}
      <Button size="sm" onClick={apply} disabled={!paste.trim()}>{cfg.replace}</Button>
      <Button variant="destructive" size="sm" className="gap-1.5" onClick={removeSelected}>
        <Trash2 className="size-3.5" /> Delete
      </Button>
    </div>
  );
}

function FreeProperties({ id }: { id: string }) {
  const node = useFreeStore((s) => s.nodes.find((n) => n.id === id));
  const update = useFreeStore((s) => s.update);
  const copy = useFreeStore((s) => s.copy);
  const paste = useFreeStore((s) => s.paste);
  const removeSelected = useFreeStore((s) => s.removeSelected);
  if (!node) return null;
  const d = node.data as { text: string; color?: string; shape?: string };
  const colors = node.type === "sticky" ? STICKY_COLORS : node.type === "shape" ? ["#ffffff", ...STICKY_COLORS] : null;

  return (
    <div className={card} style={maxH}>
      <h3 className="text-sm font-semibold capitalize">{node.type}</h3>
      <textarea
        value={d.text}
        onChange={(e) => update(id, { text: e.target.value })}
        rows={3}
        className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-sm outline-none focus:border-[var(--border-focus)]"
      />
      {colors && (
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              aria-label={`Color ${c}`}
              onClick={() => update(id, { color: c })}
              className={`size-6 rounded-full border ${d.color === c ? "ring-2 ring-[#3b82f6] ring-offset-1" : "border-[var(--border)]"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
      {node.type === "shape" && (
        <select
          value={d.shape}
          onChange={(e) => update(id, { shape: e.target.value })}
          className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none"
        >
          <option value="rect">Rectangle</option>
          <option value="ellipse">Ellipse</option>
          <option value="diamond">Diamond</option>
        </select>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={() => { copy(); paste(); }}>
          <Copy className="size-3.5" /> Duplicate
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={removeSelected}>
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

function JsonPanel() {
  const diagram = useDiagramStore((s) => s.diagram);
  const setDiagram = useDiagramStore((s) => s.setDiagram);
  const nodes = useFreeStore((s) => s.nodes);
  const edges = useFreeStore((s) => s.edges);
  const live = useMemo(
    () => JSON.stringify({ ...diagram, free: snapshotOf(nodes, edges) }, null, 2),
    [diagram, nodes, edges]
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const apply = () => {
    try {
      applyBoardJSON(draft ?? "");
      setDraft(null);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className={card} style={maxH}>
      <textarea
        value={draft ?? live}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="h-80 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] p-2 font-mono text-[11px] leading-relaxed outline-none focus:border-[var(--border-focus)]"
      />
      {err && <p className="text-xs text-[var(--error)]">{err}</p>}
      <div className="flex gap-2">
        {draft !== null ? (
          <>
            <Button size="sm" className="flex-1" onClick={apply}>Apply</Button>
            <Button size="sm" variant="secondary" onClick={() => { setDraft(null); setErr(""); }}>Revert</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" className="flex-1 gap-1.5" onClick={() => navigator.clipboard.writeText(live)}>
            <Copy className="size-3.5" /> Copy JSON
          </Button>
        )}
      </div>
    </div>
  );
}

export function RightPanel() {
  const [tab, setTab] = useState<"props" | "json" | "ai">("props");
  const freeSelected = useFreeStore((s) => s.nodes.find((n) => n.selected));
  const freeSelectedId = freeSelected?.id;

  const tabBtn = (t: typeof tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
        tab === t ? "bg-[var(--surface-raised)] shadow-sm" : "text-[var(--muted-foreground)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2" style={{ width: 300 }}>
      <div className="pointer-events-auto flex gap-1 rounded-lg bg-[var(--surface)] p-1">
        {tabBtn("props", "Properties")}
        {tabBtn("json", "JSON")}
        {tabBtn("ai", "Make with AI")}
      </div>
      {tab === "json" ? <JsonPanel /> : tab === "ai" ? (
        <div className={card} style={maxH}>
          <MakeWizard compact />
        </div>
      ) : freeSelectedId ? (
        freeSelected?.type && BLOCK_SPECS[freeSelected.type] ? <BlockProperties id={freeSelectedId} kind={freeSelected.type} /> : <FreeProperties id={freeSelectedId} />
      ) : <PropertiesPanel />}
    </div>
  );
}
