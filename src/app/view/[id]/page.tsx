"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { loadDiagram, type SavedDiagram } from "@/lib/cloud";
import { useDiagramStore } from "@/store/diagram-store";

const Editor = dynamic(() => import("@/components/canvas/Editor"), { ssr: false });

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");
  const setDiagram = useDiagramStore((s) => s.setDiagram);

  useEffect(() => {
    if (!id) return;
    loadDiagram(id).then((d) => {
      if (d) {
        setDiagram(d.diagram);
        setStatus("found");
      } else {
        setStatus("error");
      }
    });
  }, [id, setDiagram]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted-foreground)]">Loading diagram...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <p className="text-sm text-[var(--muted-foreground)]">Diagram not found or not public.</p>
        <Link href="/" className="text-sm text-[#3b82f6] hover:underline">Go home</Link>
      </div>
    );
  }

  return <Editor />;
}
