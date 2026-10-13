"use client";

import { useState } from "react";
import { ClipboardCopy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiagramStore } from "@/store/diagram-store";
import type { SwimlaneDiagram } from "@/types/diagram";

const PROMPT_TEMPLATE = `You are a swimlane diagram generator. Given a process description, output ONLY valid JSON matching this schema. No markdown, no explanation.

Schema:
{
  "title": "string",
  "orientation": "horizontal",
  "lanes": [{ "id": "string", "label": "string", "color": "string (hex)" }],
  "nodes": [{ "id": "string", "type": "start|end|process|decision|subprocess", "label": "string", "lane": "string (lane id)" }],
  "edges": [{ "id": "string", "from": "string (node id)", "to": "string (node id)", "label": "string (optional)", "type": "default|conditional" }]
}

Rules:
- Every diagram must have exactly one "start" node and at least one "end" node
- Decision nodes must have at least 2 outgoing edges with labels (e.g. "Yes"/"No")
- Every node's "lane" must reference a valid lane id
- Edge "from"/"to" must reference valid node ids
- Use lowercase-kebab-case for all ids
- Assign distinct hex colors to lanes from: #3b82f6, #22c55e, #f59e0b, #ef4444, #a855f7, #06b6d4, #f97316, #64748b

Process to diagram:
`;

const box =
  "w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-sm outline-none focus:border-[var(--border-focus)]";

// Step 1: describe a process and copy the prompt to any AI. Step 2: paste its JSON back.
export function PromptPanel() {
  const [description, setDescription] = useState("");
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const setDiagram = useDiagramStore((s) => s.setDiagram);

  const copy = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE + description);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const build = () => {
    try {
      const raw = paste.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const parsed = JSON.parse(raw) as SwimlaneDiagram;
      if (!parsed.lanes || !parsed.nodes || !parsed.edges) throw new Error("Needs lanes, nodes and edges");
      setDiagram(parsed);
      setPaste("");
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div
      className="pointer-events-auto flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-md"
      style={{ maxHeight: "calc(100vh - 170px)" }}
    >
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Sparkles className="size-4 text-[var(--primary)]" /> AI swimlane
      </h3>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">1. Describe your process</p>
        <textarea
          placeholder="e.g. Employee onboarding from HR review to IT setup to orientation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={box}
        />
        <Button size="sm" variant="secondary" onClick={copy} disabled={!description.trim()} className="gap-1.5">
          <ClipboardCopy className="size-3.5" /> {copied ? "Copied" : "Copy prompt"}
        </Button>
        <p className="text-xs text-[var(--muted-foreground)]">Paste it into ChatGPT, Claude, Gemini, or any AI.</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">2. Paste the JSON it returns</p>
        <textarea
          placeholder="Paste JSON here"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={5}
          className={`${box} font-mono text-[11px]`}
        />
        {err && <p className="text-xs text-[var(--error)]">{err}</p>}
        <Button size="sm" onClick={build} disabled={!paste.trim()}>Build diagram</Button>
        <p className="text-xs text-[var(--muted-foreground)]">This replaces the swimlane diagram. Other objects on the canvas stay.</p>
      </div>
    </div>
  );
}
