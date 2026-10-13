"use client";

import { useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Circle, Columns3, Diamond, Frame, HelpCircle, Image as ImageIcon, Link as LinkIcon, Milestone, MousePointer2,
  MoveUpRight, Pencil, Shapes, Smile, Square, StickyNote, Table, Type, Workflow, type LucideIcon,
} from "lucide-react";
import { useFreeStore, type Tool } from "@/store/free-store";
import { useUi, promptDialog, toast } from "@/store/ui";
import { addImageFile } from "@/lib/images";
import { safeUrl, SHAPES, STAMPS } from "@/lib/style";

type Item = { tool: Tool | null; label: string; icon: LucideIcon };

const GROUPS: Item[][] = [
  [
    { tool: null, label: "Select (V)", icon: MousePointer2 },
    { tool: "sticky", label: "Sticky note (S)", icon: StickyNote },
    { tool: "text", label: "Text (T)", icon: Type },
    { tool: "rect", label: "Rectangle (R)", icon: Square },
    { tool: "ellipse", label: "Ellipse (O)", icon: Circle },
    { tool: "diamond", label: "Diamond (D)", icon: Diamond },
  ],
  [
    { tool: "frame", label: "Frame (F)", icon: Frame },
    { tool: "pen", label: "Pen (P)", icon: Pencil },
    { tool: "arrow", label: "Arrow (A)", icon: MoveUpRight },
  ],
];

const BLOCKS: Item[] = [
  { tool: "kanban", label: "Kanban board (K)", icon: Columns3 },
  { tool: "timeline", label: "Timeline", icon: Milestone },
  { tool: "table", label: "Table", icon: Table },
  { tool: "flowchart", label: "Flowchart (starter)", icon: Workflow },
];

const btn = (on: boolean) =>
  `flex size-9 items-center justify-center rounded-md transition-colors ${
    on ? "bg-[#3b82f6]/10 text-[#2563eb]" : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
  }`;

export function ToolRail() {
  const active = useFreeStore((s) => s.tool);
  const setTool = useFreeStore((s) => s.setTool);
  const { screenToFlowPosition } = useReactFlow();
  const [flyout, setFlyout] = useState<"shapes" | "stamps" | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const center = () => screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const tool = ({ tool: t, label, icon: Icon }: Item) => (
    <button
      key={label}
      title={label}
      aria-label={label}
      draggable={t !== null}
      onDragStart={(e) => t && e.dataTransfer.setData("application/x-swimflow-tool", t)}
      onClick={() => {
        setFlyout(null);
        setTool(t);
      }}
      className={btn(active === t)}
    >
      <Icon className="size-[18px]" />
    </button>
  );

  const addLink = async () => {
    const raw = await promptDialog({ title: "Add a link", placeholder: "https://example.com", confirmLabel: "Add link" });
    if (!raw?.trim()) return;
    const url = safeUrl(raw);
    if (!url) return toast("That doesn't look like a web link.", "error");
    useFreeStore.getState().addBlock("link", { url, title: new URL(url).hostname.replace(/^www\./, "") }, center(), { w: 256, h: 56 });
  };

  const divider = <span className="my-0.5 h-px bg-[var(--border)]" />;

  return (
    <div className="pointer-events-auto relative">
      <div className="flex max-h-[calc(100vh-150px)] flex-col gap-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 shadow-md">
        {GROUPS[0].map(tool)}
        <button
          title="More shapes"
          aria-label="More shapes"
          onClick={() => setFlyout(flyout === "shapes" ? null : "shapes")}
          className={btn(flyout === "shapes" || SHAPES.some((s) => s.id === active))}
        >
          <Shapes className="size-[18px]" />
        </button>
        {divider}
        {GROUPS[1].map(tool)}
        <button title="Image" aria-label="Add an image" onClick={() => file.current?.click()} className={btn(false)}>
          <ImageIcon className="size-[18px]" />
        </button>
        <button
          title="Stamps and emoji"
          aria-label="Stamps and emoji"
          onClick={() => setFlyout(flyout === "stamps" ? null : "stamps")}
          className={btn(flyout === "stamps")}
        >
          <Smile className="size-[18px]" />
        </button>
        <button title="Link" aria-label="Add a link" onClick={addLink} className={btn(false)}>
          <LinkIcon className="size-[18px]" />
        </button>
        {divider}
        {BLOCKS.map(tool)}
        {divider}
        <button
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          onClick={() => useUi.setState({ shortcuts: true })}
          className={btn(false)}
        >
          <HelpCircle className="size-[18px]" />
        </button>
      </div>

      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          for (const f of Array.from(e.target.files ?? [])) await addImageFile(f, center());
          e.target.value = "";
        }}
      />

      {flyout === "shapes" && (
        <div className="absolute left-full top-0 ml-2 grid w-44 grid-cols-2 gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 shadow-md">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setTool(s.id as Tool);
                setFlyout(null);
              }}
              className="rounded-md px-2 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {flyout === "stamps" && (
        <div className="absolute left-full top-0 ml-2 grid w-48 grid-cols-6 gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 shadow-md">
          {STAMPS.map((emoji) => (
            <button
              key={emoji}
              aria-label={`Add ${emoji}`}
              onClick={() => {
                useFreeStore.getState().addBlock("stamp", { emoji }, center(), { w: 56, h: 56 });
                setFlyout(null);
              }}
              className="flex size-7 items-center justify-center rounded text-lg hover:bg-[var(--surface)]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
