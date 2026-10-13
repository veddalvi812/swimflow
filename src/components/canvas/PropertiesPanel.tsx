"use client";

import { useDiagramStore } from "@/store/diagram-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Trash2, Plus, GripVertical } from "lucide-react";
import type { EdgeType, NodeType } from "@/types/diagram";
import { EDGE_KINDS } from "@/lib/look";

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
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
        <p className="text-xs text-[var(--muted-foreground)]">Double-click the step, or press Enter, to edit its text.</p>

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
  const setEdgeVia = useDiagramStore((s) => s.setEdgeVia);
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
              updateEdge(edge.id, { type: e.target.value as EdgeType })
            }
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--border-focus)]"
          >
            <option value="default">Default</option>
            {Object.entries(EDGE_KINDS).filter(([k]) => k !== "default").map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Separator />

      <p className="text-xs text-[var(--muted-foreground)]">
        Connectors steer around steps on their own. Drag the dot on a selected line to route it through a point of your choice.
      </p>
      {edge.via && (
        <Button variant="secondary" size="sm" className="w-full" onClick={() => setEdgeVia(edge.id, undefined)}>
          Reset to automatic route
        </Button>
      )}

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

function LaneProperties() {
  const diagram = useDiagramStore((s) => s.diagram);
  const selectedLaneId = useDiagramStore((s) => s.selectedLaneId);
  const updateLane = useDiagramStore((s) => s.updateLane);
  const deleteLane = useDiagramStore((s) => s.deleteLane);
  const moveLane = useDiagramStore((s) => s.moveLane);
  const selectLane = useDiagramStore((s) => s.selectLane);
  const insertLane = useDiagramStore((s) => s.insertLane);

  const index = diagram.lanes.findIndex((l) => l.id === selectedLaneId);
  const lane = diagram.lanes[index];
  if (!lane) return null;
  const steps = diagram.nodes.filter((n) => n.lane === lane.id).length;
  const vertical = diagram.orientation === "vertical";

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Swimlane</h3>
        <Button variant="ghost" size="icon-xs" aria-label="Close" onClick={() => selectLane(null)}>
          <X className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Field label="Name">
          <TextInput value={lane.label} onChange={(label) => updateLane(lane.id, { label })} />
        </Field>
        <Field label="Color">
          <input
            type="color"
            value={lane.color}
            onChange={(e) => updateLane(lane.id, { color: e.target.value })}
            className="h-8 w-full cursor-pointer rounded border border-[var(--border)] p-0"
          />
        </Field>
        <Field label={vertical ? "Width (px)" : "Height (px)"}>
          <div className="flex gap-2">
            <input
              type="number"
              min={80}
              value={lane.size ?? ""}
              placeholder="Fit to steps"
              onChange={(e) => updateLane(lane.id, { size: e.target.value ? Math.max(80, Number(e.target.value)) : undefined })}
              className="h-8 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 text-sm outline-none focus:border-[var(--border-focus)]"
            />
            <Button variant="secondary" size="sm" disabled={lane.size === undefined} onClick={() => updateLane(lane.id, { size: undefined })}>
              Auto
            </Button>
          </div>
        </Field>
        <Field label="Add a lane">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => insertLane(index)}>
              {vertical ? "Before (left)" : "Before (above)"}
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => insertLane(index + 1)}>
              {vertical ? "After (right)" : "After (below)"}
            </Button>
          </div>
        </Field>
        <Field label="Position">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" disabled={index === 0} onClick={() => moveLane(lane.id, index - 1)}>
              {vertical ? "Move left" : "Move up"}
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" disabled={index === diagram.lanes.length - 1} onClick={() => moveLane(lane.id, index + 1)}>
              {vertical ? "Move right" : "Move down"}
            </Button>
          </div>
        </Field>
      </div>

      <Separator />

      <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => deleteLane(lane.id)}>
        <Trash2 className="size-3.5" />
        {steps > 0 ? `Delete lane and ${steps} step${steps === 1 ? "" : "s"}` : "Delete lane"}
      </Button>
    </>
  );
}

function DiagramProperties() {
  const diagram = useDiagramStore((s) => s.diagram);
  const updateTitle = useDiagramStore((s) => s.updateTitle);
  const setOrientation = useDiagramStore((s) => s.setOrientation);
  const setSpacing = useDiagramStore((s) => s.setSpacing);
  const updateLane = useDiagramStore((s) => s.updateLane);
  const addLane = useDiagramStore((s) => s.addLane);
  const deleteLane = useDiagramStore((s) => s.deleteLane);
  const moveLane = useDiagramStore((s) => s.moveLane);
  const selectLane = useDiagramStore((s) => s.selectLane);

  return (
    <>
      <h3 className="text-sm font-semibold">Board</h3>

      <Separator />

      <div className="flex flex-col gap-3">
        <Field label="Name">
          <TextInput
            value={diagram.title}
            onChange={updateTitle}
          />
        </Field>

        <Field label="Swimlane direction">
          <div className="flex gap-1 rounded-md bg-[var(--surface)] p-0.5">
            {(["horizontal", "vertical"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOrientation(o)}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  (diagram.orientation ?? "horizontal") === o
                    ? "bg-[var(--surface-raised)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {o === "horizontal" ? "Horizontal lanes" : "Vertical lanes"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Spacing between steps">
          <div className="flex gap-1 rounded-md bg-[var(--surface)] p-0.5">
            {([["compact", "Compact"], ["normal", "Normal"], ["roomy", "Spacious"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSpacing(id)}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  (diagram.spacing ?? "normal") === id
                    ? "bg-[var(--surface-raised)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Swimlanes</h3>
        <Button variant="ghost" size="icon-xs" onClick={addLane}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      {diagram.lanes.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Swimlanes show who does what. Add one to start a process diagram, or use Make with AI.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {diagram.lanes.map((lane, i) => (
          <div
            key={lane.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = e.dataTransfer.getData("application/x-lane");
              if (from) moveLane(from, i);
            }}
            className="flex items-center gap-1.5"
          >
            <span
              draggable
              title="Drag to reorder"
              onDragStart={(e) => e.dataTransfer.setData("application/x-lane", lane.id)}
              className="cursor-grab text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <GripVertical className="size-4" />
            </span>
            <input
              type="color"
              value={lane.color}
              onChange={(e) => updateLane(lane.id, { color: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border border-[var(--border)] p-0"
            />
            <input
              type="text"
              value={lane.label}
              onFocus={() => selectLane(lane.id)}
              onChange={(e) => updateLane(lane.id, { label: e.target.value })}
              className="h-7 min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 text-xs outline-none focus:border-[var(--border-focus)]"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Delete ${lane.label}`}
              onClick={() => deleteLane(lane.id)}
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

  const selectedLaneId = useDiagramStore((s) => s.selectedLaneId);
  const laneExists = useDiagramStore((s) => s.diagram.lanes.some((l) => l.id === s.selectedLaneId));
  const showLane = !!selectedLaneId && laneExists;
  const hasSelection = selectedNodeId || selectedEdgeId || showLane;

  return (
    <div
      className="pointer-events-auto flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-md transition-all"
      style={{ maxHeight: "calc(100vh - 170px)" }}
    >
      {selectedNodeId && <NodeProperties />}
      {selectedEdgeId && <EdgeProperties />}
      {showLane && !selectedNodeId && !selectedEdgeId && <LaneProperties />}
      {!hasSelection && <DiagramProperties />}
    </div>
  );
}
