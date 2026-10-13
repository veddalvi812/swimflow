"use client";

import { useEffect, useState } from "react";
import { ViewportPortal } from "@xyflow/react";
import { usePresence } from "@/store/presence";

// Other people's pointers, drawn in canvas space so they stay put as you pan and zoom.
export function Cursors() {
  const cursors = usePresence((s) => s.cursors);
  const [, tick] = useState(0);

  // Hide pointers that haven't moved for a while.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  return (
    <ViewportPortal>
      {Object.values(cursors)
        .filter((c) => now - c.at < 8000)
        .map((c) => (
          <div key={c.id} className="pointer-events-none absolute left-0 top-0" style={{ transform: `translate(${c.x}px, ${c.y}px)` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill={c.color} stroke="#fff" strokeWidth="1">
              <path d="M1 1l5.5 14 2-5.5L14 7.5z" />
            </svg>
            <span className="ml-3 -mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: c.color }}>
              {c.name}
            </span>
          </div>
        ))}
    </ViewportPortal>
  );
}

export function PresenceAvatars() {
  const peers = usePresence((s) => s.peers);
  if (!peers.length) return null;
  return (
    <div className="mx-1 flex -space-x-1.5" aria-label={`${peers.length} other ${peers.length === 1 ? "person" : "people"} here`}>
      {peers.slice(0, 4).map((p) => (
        <span
          key={p.id}
          title={p.name}
          className="flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-medium uppercase text-white"
          style={{ background: p.color }}
        >
          {p.name[0]}
        </span>
      ))}
      {peers.length > 4 && (
        <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#71717a] text-[10px] text-white">+{peers.length - 4}</span>
      )}
    </div>
  );
}
