"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { displayName } from "@/hooks/use-auth";
import { getRole, loadBoard, saveBoard, saveThumbnail, type Role } from "@/lib/cloud";
import { joinBoard } from "@/lib/realtime";
import { ShareDialog } from "@/components/canvas/ShareDialog";
import { PresenceAvatars } from "@/components/canvas/Cursors";
import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore, snapshotOf } from "@/store/free-store";
import { refreshComments, setBoardCtx } from "@/store/board-ctx";

const Editor = dynamic(() => import("@/components/canvas/Editor"), { ssr: false });

const currentKey = () => {
  const f = useFreeStore.getState();
  return JSON.stringify({ ...useDiagramStore.getState().diagram, free: snapshotOf(f.nodes, f.edges) });
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const userId = user?.id;
  const name = displayName(user) || "Someone";

  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const [role, setRole] = useState<Role>("viewer");
  const [isPublic, setIsPublic] = useState(false);

  const diagram = useDiagramStore((s) => s.diagram);
  const freeNodes = useFreeStore((s) => s.nodes);
  const freeEdges = useFreeStore((s) => s.edges);

  const lastKey = useRef(""); // what the server has
  const pending = useRef(false); // local edits not saved yet
  const live = useRef<ReturnType<typeof joinBoard> | null>(null);
  const makeThumb = useRef<(() => Promise<string | null>) | null>(null);
  const thumbTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onThumbnail = useCallback((make: () => Promise<string | null>) => {
    makeThumb.current = make;
  }, []);

  // Open the board.
  useEffect(() => {
    if (!id || !userId) return;
    loadBoard(id).then(async (b) => {
      if (!b) return setStatus("error");
      setRole(await getRole(b));
      setIsPublic(b.is_public);
      const { free, ...d } = b.content;
      useDiagramStore.getState().setDiagram(d);
      useFreeStore.getState().load(free);
      lastKey.current = currentKey();
      setStatus("found");
    });
    return () => useFreeStore.getState().load();
  }, [id, userId]);

  // Live: see who's here, and pick up other people's saves.
  useEffect(() => {
    if (status !== "found") return;
    let timer: ReturnType<typeof setTimeout>;
    const pull = async () => {
      if (pending.current) return; // our own unsaved edits win; they'll be saved next
      const b = await loadBoard(id);
      if (!b || pending.current) return;
      const { free, ...d } = b.content;
      useDiagramStore.getState().applyRemote(d);
      useFreeStore.getState().load(free);
      lastKey.current = currentKey();
    };
    const session = joinBoard(id, { name }, () => {
      clearTimeout(timer);
      timer = setTimeout(pull, 300);
    });
    live.current = session;
    setBoardCtx(id);
    refreshComments();
    const poll = setInterval(refreshComments, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      session.leave();
      live.current = null;
      setBoardCtx(null);
    };
  }, [status, id, name]);

  // Debounced autosave; the key comparison skips selection-only changes and the state we just loaded.
  useEffect(() => {
    if (status !== "found" || role === "viewer") return;
    const content = { ...diagram, free: snapshotOf(freeNodes, freeEdges) };
    const key = JSON.stringify(content);
    if (key === lastKey.current) {
      pending.current = false;
      return;
    }
    pending.current = true;
    setSave("saving");
    const t = setTimeout(async () => {
      const ok = await saveBoard(id, content);
      if (ok) {
        lastKey.current = key;
        pending.current = false;
        live.current?.announce();
        // Refresh the dashboard preview once editing settles.
        clearTimeout(thumbTimer.current);
        thumbTimer.current = setTimeout(async () => {
          const img = await makeThumb.current?.().catch(() => null);
          if (img) saveThumbnail(id, img);
        }, 4000);
      }
      setSave(ok ? "saved" : "error");
    }, 1000);
    return () => clearTimeout(t);
  }, [diagram, freeNodes, freeEdges, status, id, role]);

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
      <Editor
        backHref="/dashboard"
        readOnly={role === "viewer"}
        onThumbnail={onThumbnail}
        shareSlot={
          <>
            <PresenceAvatars />
            {role === "owner" && <ShareDialog boardId={id} isPublic={isPublic} />}
          </>
        }
      />
      {role !== "viewer" && (
        <span className="pointer-events-none fixed bottom-4 left-4 z-10 rounded-md border border-[#e4e4e7] bg-white px-2.5 py-1 text-xs text-[#71717a]">
          {save === "saving" ? "Saving..." : save === "error" ? "Couldn't save" : "Saved"}
        </span>
      )}
    </>
  );
}
