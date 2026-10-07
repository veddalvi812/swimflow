"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDiagramStore } from "@/store/diagram-store";
import type { SwimlaneDiagram } from "@/types/diagram";
import { ClipboardCopy, Sparkles, ClipboardPaste } from "lucide-react";

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
- Assign distinct hex colors to lanes from: #dbeafe, #dcfce7, #fef3c7, #ffe4e6, #f3e8ff, #cffafe, #ffedd5, #f1f5f9

Process to diagram:
`;

export function PromptBar() {
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"describe" | "paste">("describe");
  const setDiagram = useDiagramStore((s) => s.setDiagram);

  const copyPrompt = useCallback(() => {
    const fullPrompt = PROMPT_TEMPLATE + description;
    navigator.clipboard.writeText(fullPrompt);
  }, [description]);

  const handlePasteJSON = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      try {
        const trimmed = text.trim();
        // Strip markdown code fences if present
        const jsonStr = trimmed.startsWith("```")
          ? trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
          : trimmed;
        const parsed = JSON.parse(jsonStr) as SwimlaneDiagram;
        if (parsed.lanes && parsed.nodes && parsed.edges) {
          setDiagram(parsed);
          setDescription("");
          setMode("describe");
        }
      } catch {
        alert("Could not parse JSON from clipboard. Make sure you copied the LLM's JSON output.");
      }
    });
  }, [setDiagram]);

  return (
    <div className="pointer-events-auto flex w-full max-w-[640px] flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-3 shadow-lg">
      {mode === "describe" ? (
        <>
          <Textarea
            placeholder="Describe your process... e.g. 'Employee onboarding from HR review to IT setup to orientation'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none border-none bg-transparent text-sm focus-visible:ring-0"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMode("paste")}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ClipboardPaste className="size-3.5" />
              Paste JSON instead
            </button>
            <Button
              size="sm"
              onClick={copyPrompt}
              disabled={!description.trim()}
              className="gap-1.5"
            >
              <ClipboardCopy className="size-3.5" />
              Copy Prompt
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-[var(--primary)]" />
            <span className="font-medium">Paste the JSON output from your LLM</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("describe")}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Back
            </button>
            <Button size="sm" onClick={handlePasteJSON} className="gap-1.5 ml-auto">
              <ClipboardPaste className="size-3.5" />
              Paste from Clipboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
