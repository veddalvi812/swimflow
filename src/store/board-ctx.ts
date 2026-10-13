"use client";

import { create } from "zustand";
import { listComments, type Comment } from "@/lib/cloud";

// The saved board that's open, so panels and objects can show its comments. Null for guests and read-only links.
interface BoardCtx {
  boardId: string | null;
  comments: Comment[];
}

export const useBoardCtx = create<BoardCtx>(() => ({ boardId: null, comments: [] }));

export const setBoardCtx = (boardId: string | null) => useBoardCtx.setState({ boardId, comments: [] });

export async function refreshComments() {
  const id = useBoardCtx.getState().boardId;
  if (!id) return;
  const comments = await listComments(id);
  if (useBoardCtx.getState().boardId === id) useBoardCtx.setState({ comments });
}
