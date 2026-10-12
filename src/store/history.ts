"use client";

import { create } from "zustand";

// One undo timeline across both stores. It only remembers *which* store changed ("d" = swimlane
// diagram, "f" = free objects); each store keeps its own snapshots and registers undo/redo here.
// ponytail: stores cap their own history at 50, so past ~50 edits an undo step can be a no-op.

type Src = "d" | "f";
type Handlers = { undo: () => void; redo: () => void };

const handlers: Partial<Record<Src, Handlers>> = {};

export const useHistory = create<{ past: Src[]; future: Src[] }>(() => ({ past: [], future: [] }));

export const registerHistory = (src: Src, h: Handlers) => {
  handlers[src] = h;
};

export const record = (src: Src) => useHistory.setState((h) => ({ past: [...h.past.slice(-99), src], future: [] }));

export const clearHistory = () => useHistory.setState({ past: [], future: [] });

export function undo() {
  const { past, future } = useHistory.getState();
  const src = past[past.length - 1];
  if (!src) return;
  useHistory.setState({ past: past.slice(0, -1), future: [...future, src] });
  handlers[src]?.undo();
}

export function redo() {
  const { past, future } = useHistory.getState();
  const src = future[future.length - 1];
  if (!src) return;
  useHistory.setState({ past: [...past, src], future: future.slice(0, -1) });
  handlers[src]?.redo();
}
