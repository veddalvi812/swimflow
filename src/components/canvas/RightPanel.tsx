"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { FreeProperties, MultiProperties, EdgeProperties, ArrangeRow, card, maxH } from "./ObjectProperties";
import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore, snapshotOf } from "@/store/free-store";
import { applyBoardJSON } from "@/lib/board-json";
import { MakeWizard } from "./MakeWizard";
import { BLOCK_SPECS } from "@/lib/generators";
import { PropertiesPanel } from "./PropertiesPanel";
import { Button } from "@/components/ui/button";

function BlockProperties({ id, kind }: { id: string; kind: string }) {
  const node = useFreeStore((s) => s.nodes.find((n) => n.id === id));
  const update = useFreeStore((s) => s.update);
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
      <ArrangeRow />
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
  const allFree = useFreeStore((s) => s.nodes);
  const selectedNodes = useMemo(() => allFree.filter((n) => n.selected), [allFree]);
  const selectedEdge = useFreeStore((s) => s.edges.find((e) => e.selected));
  const one = selectedNodes.length === 1 ? selectedNodes[0] : undefined;

  // Selecting something on the canvas brings its properties forward.
  const selectionKey = selectedNodes.map((n) => n.id).join(",") + "|" + (selectedEdge?.id ?? "");
  useEffect(() => {
    if (selectionKey !== "|") setTab("props");
  }, [selectionKey]);

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

  let props;
  if (selectedNodes.length > 1) props = <MultiProperties count={selectedNodes.length} />;
  else if (one?.type && BLOCK_SPECS[one.type]) props = <BlockProperties id={one.id} kind={one.type} />;
  else if (one) props = <FreeProperties id={one.id} />;
  else if (selectedEdge) props = <EdgeProperties id={selectedEdge.id} />;
  else props = <PropertiesPanel />;

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
      ) : props}
    </div>
  );
}
