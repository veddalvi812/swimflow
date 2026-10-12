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
  FileText,
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

export function Toolbar({ onCloud }: { onCloud?: () => void }) {
  const relayout = useDiagramStore((s) => s.relayout);
  const diagram = useDiagramStore((s) => s.diagram);
  const addNode = useDiagramStore((s) => s.addNode);
  const canUndo = useHistory((s) => s.past.length > 0);
  const canRedo = useHistory((s) => s.future.length > 0);
  const rf = useReactFlow();

  const exportAs = (format: "png" | "pdf") =>
    exportImage(rf.getNodes(), format, diagram.title).catch((e) => alert(e instanceof Error ? e.message : "Export failed"));

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
        alert("That file isn't a valid board JSON.");
      }
    };
    input.click();
  };

  return (
    <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-1 py-0.5 shadow-sm">
      <ToolbarBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
      <ToolbarBtn icon={Redo2} label="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Plus} label="Add Node" onClick={handleAddNode} />
      <ToolbarBtn icon={LayoutDashboard} label="Auto Layout" onClick={relayout} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={ZoomIn} label="Zoom In" onClick={() => rf.zoomIn()} />
      <ToolbarBtn icon={ZoomOut} label="Zoom Out" onClick={() => rf.zoomOut()} />
      <ToolbarBtn icon={Maximize} label="Fit View" onClick={() => rf.fitView({ padding: 0.1 })} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Save} label="Download board JSON" onClick={handleSaveJSON} />
      <ToolbarBtn icon={Upload} label="Open board JSON" onClick={handleLoadJSON} />
      <ToolbarBtn icon={Download} label="Export PNG" onClick={() => exportAs("png")} />
      <ToolbarBtn icon={FileText} label="Export PDF" onClick={() => exportAs("pdf")} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={Cloud} label="My boards" onClick={onCloud ?? (() => {})} />
    </div>
  );
}
