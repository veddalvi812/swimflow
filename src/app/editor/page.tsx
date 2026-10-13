"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore } from "@/store/free-store";
import { BLANK_DIAGRAM } from "@/lib/constants";

const Editor = dynamic(() => import("@/components/canvas/Editor"), {
  ssr: false,
});

export default function EditorPage() {
  // Guests start from a blank board, same as a new saved board. Nothing is stored for them.
  useEffect(() => {
    useDiagramStore.getState().setDiagram(BLANK_DIAGRAM);
    useFreeStore.getState().load();
  }, []);
  return <Editor />;
}
