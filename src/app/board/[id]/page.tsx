"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { loadBoard, saveBoard } from "@/lib/cloud";
import { useDiagramStore } from "@/store/diagram-store";

const Editor = dynamic(() => import("@/components/canvas/Editor"), { ssr: false });

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const setDiagram = useDiagramStore((s) => s.setDiagram);
  const diagram = useDiagramStore((s) => s.diagram);
  const loaded = useRef<unknown>(null);

  useEffect(() => {
    if (!id || !user) return;
    loadBoard(id).then((b) => {
      if (!b) return setStatus("error");
      setDiagram(b.content);
      loaded.current = useDiagramStore.getState().diagram;
      setStatus("found");
    });
  }, [id, user, setDiagram]);

  // Debounced autosave; skips the diagram we just loaded.
  useEffect(() => {
    if (status !== "found" || diagram === loaded.current) return;
    setSave("saving");
    const t = setTimeout(async () => setSave((await saveBoard(id, diagram)) ? "saved" : "error"), 1000);
    return () => clearTimeout(t);
  }, [diagram, status, id]);

  if (status === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#71717a]">Board not found.</p>
        <Link href="/dashboard" className="text-sm text-[#3b82f6] hover:underline">Back to dashboard</Link>
      </div>
    );
  }
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center text-sm text-[#71717a]">Loading board...</div>;
  }

  return (
    <>
      <Editor backHref="/dashboard" />
      <span className="pointer-events-none fixed bottom-4 left-4 z-10 rounded-md border border-[#e4e4e7] bg-white px-2.5 py-1 text-xs text-[#71717a]">
        {save === "saving" ? "Saving..." : save === "error" ? "Couldn't save" : "Saved"}
      </span>
    </>
  );
}
