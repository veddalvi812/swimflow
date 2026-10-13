"use client";

import { create } from "zustand";

// How the canvas looks and behaves for you. Remembered in this browser; presentation mode is never remembered.

export type Background = "dots" | "lines" | "blank";

interface View {
  background: Background;
  snap: boolean;
  minimap: boolean;
  present: boolean;
  set: (patch: Partial<Omit<View, "set">>) => void;
}

const KEY = "swimflow-view";

export const useView = create<View>((set) => ({
  background: "dots",
  snap: false,
  minimap: true,
  present: false,
  set: (patch) =>
    set((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify({ background: next.background, snap: next.snap, minimap: next.minimap }));
      } catch {
        // private mode or blocked storage: the setting just won't stick
      }
      return next;
    }),
}));

// Call once on the client after mount (localStorage doesn't exist while rendering on the server).
export function restoreView() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    useView.setState({
      ...(["dots", "lines", "blank"].includes(saved.background) ? { background: saved.background } : {}),
      ...(typeof saved.snap === "boolean" ? { snap: saved.snap } : {}),
      ...(typeof saved.minimap === "boolean" ? { minimap: saved.minimap } : {}),
    });
  } catch {
    // nothing saved, or unreadable: keep the defaults
  }
}
