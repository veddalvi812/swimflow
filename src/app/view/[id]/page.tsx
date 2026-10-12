"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { loadBoard } from "@/lib/cloud";
import { useDiagramStore } from "@/store/diagram-store";

const Editor = dynamic(() => import("@/components/canvas/Editor"), { ssr: false });

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");
  const setDiagram = useDiagramStore((s) => s.setDiagram);

  useEffect(() => {
    if (!id) return;
    loadBoard(id).then((b) => {
      if (b) {
        setDiagram(b.content);
        setStatus("found");
      } else {
        setStatus("error");
      }
    });
  }, [id, setDiagram]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted-foreground)]">Loading board...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <p className="text-sm text-[var(--muted-foreground)]">Board not found or not public.</p>
        <Link href="/" className="text-sm text-[#3b82f6] hover:underline">Go home</Link>
      </div>
    );
  }

  return <Editor />;
}
