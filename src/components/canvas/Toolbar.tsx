"use client";

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
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" onClick={onClick}>
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

export function Toolbar() {
  const relayout = useDiagramStore((s) => s.relayout);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-1 py-0.5 shadow-sm">
      <ToolbarBtn icon={LayoutDashboard} label="Auto Layout" onClick={relayout} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn icon={ZoomIn} label="Zoom In" onClick={() => zoomIn()} />
      <ToolbarBtn icon={ZoomOut} label="Zoom Out" onClick={() => zoomOut()} />
      <ToolbarBtn icon={Maximize} label="Fit View" onClick={() => fitView({ padding: 0.1 })} />

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <ToolbarBtn
        icon={Download}
        label="Export PNG"
        onClick={() => {
          // TODO: export via html-to-image
        }}
      />
    </div>
  );
}
