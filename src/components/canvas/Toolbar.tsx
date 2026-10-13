"use client";

import { useHistory, undo, redo } from "@/store/history";
import { useDiagramStore } from "@/store/diagram-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  Save,
  Upload,
  Undo2,
  Redo2,
  Cloud,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { boardJSON, applyBoardJSON, downloadText } from "@/lib/board-json";
import { exportImage } from "@/lib/export-image";
import { toast, useUi } from "@/store/ui";
import { useView, type Background } from "@/store/view-store";
import { useState } from "react";

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" onClick={onClick} disabled={disabled}>
            <Icon className="size-4" />
          </Button>
        }
      />
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// A button that opens a small panel under the toolbar. Click outside to close.
function Menu({ icon, label, children }: { icon: React.ElementType; label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <ToolbarBtn icon={icon} label={label} onClick={() => setOpen((v) => !v)} />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 text-sm shadow-lg">
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

const menuItem = "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-[var(--surface)]";

export function Toolbar({ onCloud, extra }: { onCloud?: () => void; extra?: React.ReactNode }) {
  const relayout = useDiagramStore((s) => s.relayout);
  const diagram = useDiagramStore((s) => s.diagram);
  const addNode = useDiagramStore((s) => s.addNode);
  const canUndo = useHistory((s) => s.past.length > 0);
  const canRedo = useHistory((s) => s.future.length > 0);
  const rf = useReactFlow();

  const view = useView();

  // Export everything, or just what's selected (select a frame to export that area).
  const exportAs = (format: "png" | "pdf" | "svg", scope: "all" | "selection", transparent = false) => {
    const all = rf.getNodes();
    const nodes = scope === "selection" ? all.filter((n) => n.selected) : all;
    exportImage(nodes, format, diagram.title, { transparent }).catch((e) =>
      toast(e instanceof Error ? e.message : "Export failed", "error")
    );
  };

  const handleAddNode = () => {
    const firstLane = diagram.lanes[0];
    if (firstLane) addNode(firstLane.id);
  };

  const handleSaveJSON = () => downloadText(boardJSON(), `${diagram.title || "board"}.json`);

  const handleLoadJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        applyBoardJSON(await file.text());
      } catch {
        toast("That file isn't a valid board JSON.", "error");
      }
    };
    input.click();
  };

  return (
    <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-1 py-0.5 shadow-sm">
      <ToolbarBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
      <ToolbarBtn icon={Redo2} label="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Plus} label="Add a step to the first swimlane" onClick={handleAddNode} />
      <ToolbarBtn icon={LayoutDashboard} label="Tidy the swimlane layout" onClick={relayout} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={ZoomIn} label="Zoom In" onClick={() => rf.zoomIn()} />
      <ToolbarBtn icon={ZoomOut} label="Zoom Out" onClick={() => rf.zoomOut()} />
      <ToolbarBtn icon={Maximize} label="Fit everything (Shift 1)" onClick={() => rf.fitView({ padding: 0.1 })} />
      <Menu icon={Eye} label="View">
        {(close) => (
          <>
            <p className="px-2.5 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Background</p>
            <div className="mb-1 flex gap-1 rounded-md bg-[var(--surface)] p-0.5">
              {(["dots", "lines", "blank"] as Background[]).map((b) => (
                <button
                  key={b}
                  onClick={() => view.set({ background: b })}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium ${view.background === b ? "bg-[var(--surface-raised)] shadow-sm" : "text-[var(--muted-foreground)]"}`}
                >
                  {b === "dots" ? "Dots" : b === "lines" ? "Grid" : "None"}
                </button>
              ))}
            </div>
            <button className={menuItem} onClick={() => view.set({ snap: !view.snap })}>
              Snap to grid <span>{view.snap ? "On" : "Off"}</span>
            </button>
            <button className={menuItem} onClick={() => view.set({ minimap: !view.minimap })}>
              Minimap <span>{view.minimap ? "On" : "Off"}</span>
            </button>
            <button
              className={menuItem}
              onClick={() => {
                const sel = rf.getNodes().filter((n) => n.selected);
                if (sel.length) rf.fitView({ nodes: sel, padding: 0.3, duration: 250 });
                else toast("Select something first");
                close();
              }}
            >
              Zoom to selection <span className="text-xs text-[var(--muted-foreground)]">Shift 2</span>
            </button>
            <button className={menuItem} onClick={() => { useUi.setState({ searching: true }); close(); }}>
              Search the board <span className="text-xs text-[var(--muted-foreground)]">Ctrl F</span>
            </button>
            <button className={menuItem} onClick={() => { view.set({ present: true }); close(); }}>
              Present <span className="text-xs text-[var(--muted-foreground)]">Esc to exit</span>
            </button>
          </>
        )}
      </Menu>

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Save} label="Download board JSON" onClick={handleSaveJSON} />
      <ToolbarBtn icon={Upload} label="Open board JSON" onClick={handleLoadJSON} />
      <Menu icon={Download} label="Export">
        {(close) => {
          const hasSelection = rf.getNodes().some((n) => n.selected);
          const go = (format: "png" | "pdf" | "svg", scope: "all" | "selection", transparent = false) => () => {
            exportAs(format, scope, transparent);
            close();
          };
          return (
            <>
              <p className="px-2.5 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Whole board</p>
              <button className={menuItem} onClick={go("png", "all")}>PNG image</button>
              <button className={menuItem} onClick={go("png", "all", true)}>PNG, transparent</button>
              <button className={menuItem} onClick={go("svg", "all")}>SVG</button>
              <button className={menuItem} onClick={go("pdf", "all")}>PDF</button>
              {hasSelection && (
                <>
                  <p className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Selection only</p>
                  <button className={menuItem} onClick={go("png", "selection")}>PNG image</button>
                  <button className={menuItem} onClick={go("svg", "selection")}>SVG</button>
                  <button className={menuItem} onClick={go("pdf", "selection")}>PDF</button>
                </>
              )}
            </>
          );
        }}
      </Menu>

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Cloud} label="My boards" onClick={onCloud ?? (() => {})} />
      {extra}
    </div>
  );
}
