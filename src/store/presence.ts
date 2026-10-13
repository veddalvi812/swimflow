"use client";

import { create } from "zustand";

export interface Peer {
  id: string;
  name: string;
  color: string;
}

export interface Cursor extends Peer {
  x: number;
  y: number;
  at: number;
}

// Who else is on this board right now, and where their pointers are (in canvas coordinates).
interface PresenceStore {
  peers: Peer[];
  cursors: Record<string, Cursor>;
  sendCursor: ((x: number, y: number) => void) | null;
}

export const usePresence = create<PresenceStore>(() => ({ peers: [], cursors: {}, sendCursor: null }));
