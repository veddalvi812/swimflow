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
  Plus,
  Save,
  Upload,
  Undo2,
  Redo2,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
  LANE_HEADER_WIDTH,
  NODE_WIDTH,
  NODE_HEIGHT,
  DECISION_SIZE,
} from "@/lib/constants";

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

function nodeSize(type: string): { w: number; h: number } {
  if (type === "decision") return { w: DECISION_SIZE, h: DECISION_SIZE };
  if (type === "start" || type === "end") return { w: 100, h: 40 };
  return { w: NODE_WIDTH, h: NODE_HEIGHT };
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  nodeType: string,
) {
  ctx.save();

  if (nodeType === "decision") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(x + w, cy);
    ctx.lineTo(cx, y + h);
    ctx.lineTo(x, cy);
    ctx.closePath();
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (nodeType === "start" || nodeType === "end") {
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = nodeType === "start" ? "#166534" : "#991b1b";
    ctx.fill();
    ctx.strokeStyle = nodeType === "start" ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (nodeType === "subprocess") {
    const r = 8;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 2;
    ctx.stroke();
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, r - 2);
    ctx.stroke();
  } else {
    const r = 8;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.fillStyle = "#f2efe9";
  ctx.font = "bold 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxTextW = w - 12;
  const lines = wrapText(ctx, label, maxTextW);
  const lineH = 16;
  const startY = y + h / 2 - ((lines.length - 1) * lineH) / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + w / 2, startY + i * lineH, maxTextW);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  dashed: boolean,
  label?: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  if (dashed) ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();

  if (label) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tw = ctx.measureText(label).width + 8;
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(midX - tw / 2, midY - 10, tw, 20);
    ctx.fillStyle = "#f2efe9";
    ctx.fillText(label, midX, midY);
  }

  ctx.restore();
}

export function Toolbar() {
  const relayout = useDiagramStore((s) => s.relayout);
  const diagram = useDiagramStore((s) => s.diagram);
  const nodes = useDiagramStore((s) => s.nodes);
  const lanes = useDiagramStore((s) => s.lanes);
  const addNode = useDiagramStore((s) => s.addNode);
  const exportJSON = useDiagramStore((s) => s.exportJSON);
  const importJSON = useDiagramStore((s) => s.importJSON);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const canUndo = useDiagramStore((s) => s._past.length > 0);
  const canRedo = useDiagramStore((s) => s._future.length > 0);
  const rf = useReactFlow();

  const exportPng = () => {
    const pad = 40;
    const totalW = Math.max(...lanes.map((l) => l.width), 800);
    const totalH = lanes.reduce((sum, l) => sum + l.height, 0);
    const scale = 2;
    const cw = (totalW + pad * 2) * scale;
    const ch = (totalH + pad * 2) * scale;

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = "#f2efe9";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(diagram.title, pad, pad - 10);

    const offsetX = pad;
    const offsetY = pad;

    for (const lane of lanes) {
      const lx = lane.x + offsetX;
      const ly = lane.y + offsetY;
      ctx.fillStyle = lane.color;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(lx, ly, lane.width, lane.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = lane.color;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(lx, ly, LANE_HEADER_WIDTH, lane.height);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx + LANE_HEADER_WIDTH, ly);
      ctx.lineTo(lx + LANE_HEADER_WIDTH, ly + lane.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx, ly + lane.height);
      ctx.lineTo(lx + lane.width, ly + lane.height);
      ctx.stroke();
      ctx.fillStyle = "#f2efe9";
      ctx.font = "bold 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lane.label, lx + LANE_HEADER_WIDTH / 2, ly + lane.height / 2);
    }

    // Build node position map for edges
    const nodeMap = new Map<string, { cx: number; cy: number; x: number; y: number; w: number; h: number; type: string }>();
    const contentNodes = nodes.filter((n) => !n.id.startsWith("lane-"));

    for (const n of contentNodes) {
      const dNode = diagram.nodes.find((dn) => dn.id === n.id);
      if (!dNode) continue;
      const { w, h } = nodeSize(dNode.type);
      const nx = n.position.x + offsetX;
      const ny = n.position.y + offsetY;
      nodeMap.set(n.id, { cx: nx + w / 2, cy: ny + h / 2, x: nx, y: ny, w, h, type: dNode.type });
    }

    // Draw edges
    for (const edge of diagram.edges) {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) continue;

      // Connect from right side of source to left side of target
      let fx = from.cx + from.w / 2;
      let fy = from.cy;
      let tx = to.cx - to.w / 2;
      let ty = to.cy;

      // For decision nodes, adjust connection points
      if (from.type === "decision") {
        if (Math.abs(to.cy - from.cy) > from.h / 2) {
          fx = from.cx;
          fy = to.cy > from.cy ? from.cy + from.h / 2 : from.cy - from.h / 2;
        }
      }

      const color = edge.type === "exception" ? "#ef4444" : "#71717a";
      const dashed = edge.type === "conditional";
      drawArrow(ctx, fx, fy, tx, ty, color, dashed, edge.label);
    }

    // Draw nodes on top
    for (const [id, pos] of nodeMap) {
      const dNode = diagram.nodes.find((dn) => dn.id === id);
      if (!dNode) continue;
      drawNode(ctx, pos.x, pos.y, pos.w, pos.h, dNode.label, dNode.type);
    }

    // Download
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${diagram.title || "swimlane"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleAddNode = () => {
    const firstLane = diagram.lanes[0];
    if (firstLane) addNode(firstLane.id);
  };

  const handleSaveJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${diagram.title || "swimlane"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const handleLoadJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        if (!importJSON(text)) {
          alert("Invalid diagram JSON file.");
        }
      });
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

      <ToolbarBtn icon={Save} label="Save JSON" onClick={handleSaveJSON} />
      <ToolbarBtn icon={Upload} label="Load JSON" onClick={handleLoadJSON} />
      <ToolbarBtn icon={Download} label="Export PNG" onClick={exportPng} />
    </div>
  );
}
