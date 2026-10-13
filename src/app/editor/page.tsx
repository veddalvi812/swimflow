"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore } from "@/store/free-store";
import { BLANK_DIAGRAM } from "@/lib/constants";
import { restoreGuest, startGuestAutosave } from "@/lib/guest-storage";
import { useAuth } from "@/hooks/use-auth";

const Editor = dynamic(() => import("@/components/canvas/Editor"), {
  ssr: false,
});

export default function EditorPage() {
  const { user, enabled } = useAuth();

  // Guests pick up where they left off on this device; a first visit starts from a blank board.
  useEffect(() => {
    if (!restoreGuest()) {
      useDiagramStore.getState().setDiagram(BLANK_DIAGRAM);
      useFreeStore.getState().load();
    }
    return startGuestAutosave();
  }, []);

  return (
    <>
      <Editor />
      {!user && (
        <p className="pointer-events-auto fixed bottom-4 left-4 z-10 rounded-md border border-[#e4e4e7] bg-white px-2.5 py-1 text-xs text-[#71717a]">
          Saved on this device.{" "}
          {enabled && (
            <Link href="/login" className="text-[#3b82f6] hover:underline">
              Log in
            </Link>
          )}
          {enabled && " to keep boards in the cloud."}
        </p>
      )}
    </>
  );
}
