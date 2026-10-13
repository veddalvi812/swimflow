"use client";

import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ArrowLeft, Columns3, Milestone, Rows3, Table, Workflow, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GENERATORS, type Generator, type GeneratorId } from "@/lib/generators";
import type { Orientation } from "@/types/diagram";

const ICONS: Record<GeneratorId, LucideIcon> = {
  swimlane: Rows3,
  flowchart: Workflow,
  kanban: Columns3,
  timeline: Milestone,
  table: Table,
};

const box =
  "w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm outline-none focus:border-[var(--border-focus)]";

// Asks what you're making, then walks through: describe it, copy the prompt to any AI, paste the answer back.
export function MakeWizard({ compact = false, onDone, onBlank }: { compact?: boolean; onDone?: () => void; onBlank?: () => void }) {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [gen, setGen] = useState<Generator | null>(null);
  const [step, setStep] = useState<"describe" | "paste">("describe");
  const [description, setDescription] = useState("");
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [err, setErr] = useState("");

  const center = () => screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const finish = () => {
    setGen(null);
    setStep("describe");
    setDescription("");
    setPaste("");
    setErr("");
    onDone?.();
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 150);
  };
  const back = () => {
    setErr("");
    if (step === "paste") setStep("describe");
    else setGen(null);
  };

  const copy = async () => {
    if (!gen) return;
    // Clipboard can be blocked; the step still moves on and the user can use "Copy the prompt again".
    await navigator.clipboard.writeText(gen.prompt(description, orientation)).catch(() => {});
    setCopied(true);
    setStep("paste");
  };

  const build = () => {
    if (!gen) return;
    try {
      gen.build(paste, center());
      finish();
    } catch {
      setErr("That doesn't look like what I asked for. Copy the AI's whole answer, from the first { to the last }, and try again.");
    }
  };

  const title = !gen ? "What are we making today?" : step === "describe" ? `Tell me about your ${gen.noun}` : "Now paste what the AI gave you";
  const sub = !gen
    ? "Pick a starting point. You can mix everything on one board later."
    : step === "describe"
      ? "A sentence or two is plenty. Any AI can take it from there."
      : copied
        ? "Prompt copied. Paste it into ChatGPT, Claude, or Gemini, then bring the answer back here."
        : "Paste the answer from your AI below.";

  return (
    <div className="flex flex-col gap-4">
      <div>
        {gen && (
          <button onClick={back} className="mb-2 flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="size-3.5" /> Back
          </button>
        )}
        <h2 className={`${compact ? "text-base" : "text-xl"} font-medium tracking-tight text-[var(--foreground)]`}>{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{sub}</p>
      </div>

      {!gen && (
        <>
          <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
            {GENERATORS.map((g) => {
              const Icon = ICONS[g.id];
              return (
                <button
                  key={g.id}
                  onClick={() => setGen(g)}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-left transition-colors hover:border-[var(--border-focus)] hover:bg-[var(--surface)]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--muted-foreground)]">
                    <Icon className="size-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[var(--foreground)]">{g.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{g.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {onBlank && (
            <button onClick={onBlank} className="self-start text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Rather draw it yourself? Start with a blank canvas
            </button>
          )}
        </>
      )}

      {gen && step === "describe" && (
        <>
          <textarea
            autoFocus
            placeholder={gen.placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={compact ? 4 : 3}
            className={box}
          />
          {gen.id === "swimlane" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--muted-foreground)]">Lanes run</span>
              <div className="flex gap-1 rounded-md bg-[var(--surface)] p-0.5">
                {(["horizontal", "vertical"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      orientation === o ? "bg-[var(--surface-raised)] shadow-sm" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {o === "horizontal" ? "Left to right" : "Top to bottom"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={copy} disabled={!description.trim()}>Copy prompt for my AI</Button>
            <Button
              variant="ghost"
              onClick={() => {
                gen.starter(center(), orientation);
                finish();
              }}
            >
              Use a ready-made starter
            </Button>
          </div>
        </>
      )}

      {gen && step === "paste" && (
        <>
          <textarea
            autoFocus
            placeholder="Paste the AI's answer here"
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setErr("");
            }}
            rows={compact ? 6 : 5}
            className={`${box} font-mono text-[12px]`}
          />
          {err && <p className="text-sm text-[var(--error)]">{err}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={build} disabled={!paste.trim()}>Build my {gen.label.toLowerCase()}</Button>
            <Button variant="ghost" onClick={copy}>Copy the prompt again</Button>
          </div>
        </>
      )}
    </div>
  );
}
