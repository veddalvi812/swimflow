"use client";

import { Circle, Columns3, Diamond, Frame, Milestone, MousePointer2, Square, StickyNote, Table, Type, type LucideIcon } from "lucide-react";
import { useFreeStore, type Tool } from "@/store/free-store";

const TOOLS: { tool: Tool | null; label: string; icon: LucideIcon }[] = [
  { tool: null, label: "Select (Esc)", icon: MousePointer2 },
  { tool: "sticky", label: "Sticky note", icon: StickyNote },
  { tool: "text", label: "Text", icon: Type },
  { tool: "rect", label: "Rectangle", icon: Square },
  { tool: "ellipse", label: "Ellipse", icon: Circle },
  { tool: "diamond", label: "Diamond", icon: Diamond },
  { tool: "frame", label: "Frame", icon: Frame },
  { tool: "kanban", label: "Kanban board", icon: Columns3 },
  { tool: "timeline", label: "Timeline", icon: Milestone },
  { tool: "table", label: "Table", icon: Table },
];

export function ToolRail() {
  const active = useFreeStore((s) => s.tool);
  const setTool = useFreeStore((s) => s.setTool);

  return (
    <div className="pointer-events-auto flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 shadow-md">
      {TOOLS.map(({ tool, label, icon: Icon }) => (
        <button
          key={label}
          title={label}
          aria-label={label}
          onClick={() => setTool(tool)}
          className={`flex size-9 items-center justify-center rounded-md transition-colors ${
            active === tool
              ? "bg-[#3b82f6]/10 text-[#2563eb]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          }`}
        >
          <Icon className="size-[18px]" />
        </button>
      ))}
    </div>
  );
}
