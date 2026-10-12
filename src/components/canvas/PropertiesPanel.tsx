"use client";

import { useDiagramStore } from "@/store/diagram-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Trash2, Plus } from "lucide-react";
import type { NodeType } from "@/types/diagram";

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  start: "Start",
  end: "End",
  process: "Process",
  decision: "Decision",
  subprocess: "Subprocess",
  delay: "Delay",
  document: "Document",
  datastore: "Data Store",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 text-sm outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
    />
  );
}

function NodeProperties() {
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const diagram = useDiagramStore((s) => s.diagram);
  const updateNode = useDiagramStore((s) => s.updateNode);
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const selectNode = useDiagramStore((s) => s.selectNode);

  const node = diagram.nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Node Properties</h3>
        <Button variant="ghost" size="icon-xs" onClick={() => selectNode(null)}>
          <X className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Field label="Label">
          <TextInput
            value={node.label}
            onChange={(label) => updateNode(node.id, { label })}
          />
        </Field>

        <Field label="Type">
          <select
            value={node.type}
            onChange={(e) =>
              updateNode(node.id, { type: e.target.value as NodeType })
            }
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--border-focus)]"
          >
            {Object.entries(NODE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Lane">
          <select
            value={node.lane}
            onChange={(e) => updateNode(node.id, { lane: e.target.value })}
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--border-focus)]"
          >
            {diagram.lanes.map((lane) => (
              <option key={lane.id} value={lane.id}>
                {lane.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            value={node.description || ""}
            onChange={(e) => updateNode(node.id, { description: e.target.value })}
            placeholder="Optional description..."
            rows={3}
            className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-sm outline-none focus:border-[var(--border-focus)]"
          />
        </Field>
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full gap-1.5"
        onClick={() => deleteNode(node.id)}
      >
        <Trash2 className="size-3.5" />
        Delete Node
      </Button>
    </>
  );
}

function EdgeProperties() {
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);
  const diagram = useDiagramStore((s) => s.diagram);
  const updateEdge = useDiagramStore((s) => s.updateEdge);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);
  const selectEdge = useDiagramStore((s) => s.selectEdge);

  const edge = diagram.edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  const fromNode = diagram.nodes.find((n) => n.id === edge.from);
  const toNode = diagram.nodes.find((n) => n.id === edge.to);

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Edge Properties</h3>
        <Button variant="ghost" size="icon-xs" onClick={() => selectEdge(null)}>
          <X className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Field label="Label">
          <TextInput
            value={edge.label || ""}
            onChange={(label) => updateEdge(edge.id, { label: label || undefined })}
          />
        </Field>

        <Field label="From">
          <div className="text-sm text-[var(--muted-foreground)]">
            {fromNode?.label || edge.from}
          </div>
        </Field>

        <Field label="To">
          <div className="text-sm text-[var(--muted-foreground)]">
            {toNode?.label || edge.to}
          </div>
        </Field>

        <Field label="Type">
          <select
            value={edge.type}
            onChange={(e) =>
              updateEdge(edge.id, { type: e.target.value as "default" | "conditional" | "exception" })
            }
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--border-focus)]"
          >
            <option value="default">Default</option>
            <option value="conditional">Conditional</option>
            <option value="exception">Exception</option>
          </select>
        </Field>
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full gap-1.5"
        onClick={() => deleteEdge(edge.id)}
      >
        <Trash2 className="size-3.5" />
        Delete Edge
      </Button>
    </>
  );
}

function DiagramProperties() {
  const diagram = useDiagramStore((s) => s.diagram);
  const updateTitle = useDiagramStore((s) => s.updateTitle);
  const updateLane = useDiagramStore((s) => s.updateLane);
  const addLane = useDiagramStore((s) => s.addLane);
  const deleteLane = useDiagramStore((s) => s.deleteLane);

  return (
    <>
      <h3 className="text-sm font-semibold">Diagram</h3>

      <Separator />

      <div className="flex flex-col gap-3">
        <Field label="Title">
          <TextInput
            value={diagram.title}
            onChange={updateTitle}
          />
        </Field>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Lanes</h3>
        <Button variant="ghost" size="icon-xs" onClick={addLane}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {diagram.lanes.map((lane) => (
          <div key={lane.id} className="flex items-center gap-2">
            <input
              type="color"
              value={lane.color}
              onChange={(e) => updateLane(lane.id, { color: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border border-[var(--border)] p-0"
            />
            <input
              type="text"
              value={lane.label}
              onChange={(e) => updateLane(lane.id, { label: e.target.value })}
              className="h-7 flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 text-xs outline-none focus:border-[var(--border-focus)]"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => deleteLane(lane.id)}
              disabled={diagram.lanes.length <= 1}
              className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--error)]"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

export function PropertiesPanel() {
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);

  const hasSelection = selectedNodeId || selectedEdgeId;

  return (
    <div
      className="pointer-events-auto flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-md transition-all"
      style={{ width: 260, maxHeight: "calc(100vh - 120px)" }}
    >
      {selectedNodeId && <NodeProperties />}
      {selectedEdgeId && <EdgeProperties />}
      {!hasSelection && <DiagramProperties />}
    </div>
  );
}
