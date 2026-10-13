import type { Tool } from "@/store/free-store";

// One-key tool shortcuts (no modifier, not while typing).
export const TOOL_KEYS: Record<string, Tool | null> = {
  v: null,
  s: "sticky",
  t: "text",
  r: "rect",
  o: "ellipse",
  d: "diamond",
  f: "frame",
  p: "pen",
  a: "arrow",
  k: "kanban",
};

export const SHORTCUTS: { group: string; items: [string, string][] }[] = [
  {
    group: "Tools",
    items: [
      ["V", "Select"],
      ["S", "Sticky note"],
      ["T", "Text"],
      ["R / O / D", "Rectangle / ellipse / diamond"],
      ["F", "Frame"],
      ["P", "Pen"],
      ["A", "Arrow"],
      ["K", "Kanban board"],
      ["Esc", "Back to select"],
    ],
  },
  {
    group: "Edit",
    items: [
      ["Ctrl Z / Ctrl Y", "Undo / redo"],
      ["Ctrl C / Ctrl V", "Copy / paste"],
      ["Ctrl D", "Duplicate"],
      ["Ctrl A", "Select all"],
      ["Delete", "Delete selection"],
      ["Arrow keys", "Nudge (Shift for 10 px)"],
      ["Ctrl F", "Search the board"],
    ],
  },
  {
    group: "View",
    items: [
      ["Scroll", "Zoom"],
      ["Drag the background", "Pan"],
      ["Shift 1", "Fit everything"],
      ["Shift 2", "Zoom to selection"],
      ["?", "Show this list"],
    ],
  },
  {
    group: "Swimlanes",
    items: [
      ["Double-click a lane", "Add a step"],
      ["Double-click a lane header", "Rename the lane"],
      ["Drag a lane header", "Reorder lanes"],
    ],
  },
];
