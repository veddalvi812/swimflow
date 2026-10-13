import { supabase } from "./supabase";
import { usePresence, type Cursor, type Peer } from "@/store/presence";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];
const colorFor = (s: string) => COLORS[[...s].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length];
const randomId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Joins a board's live channel: presence (who's here), cursors, and a "saved" ping.
// The ping carries no content. Others re-load the board, so access rules still apply and size doesn't matter.
// ponytail: last save wins. Two people editing at the very same moment can overwrite each other.
export function joinBoard(boardId: string, me: { name: string }, onSaved: () => void) {
  const client = supabase;
  if (!client) return { announce() {}, leave() {} };

  const id = randomId();
  const color = colorFor(id);
  const channel = client.channel(`board:${boardId}`, { config: { presence: { key: id }, broadcast: { self: false } } });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, { name?: string; color?: string }[]>;
      const peers: Peer[] = Object.entries(state)
        .filter(([key]) => key !== id)
        .map(([key, metas]) => ({ id: key, name: metas[0]?.name ?? "Someone", color: metas[0]?.color ?? "#71717a" }));
      usePresence.setState((s) => ({
        peers,
        cursors: Object.fromEntries(Object.entries(s.cursors).filter(([key]) => peers.some((p) => p.id === key))),
      }));
    })
    .on("broadcast", { event: "saved" }, () => onSaved())
    .on("broadcast", { event: "cursor" }, ({ payload }) => {
      const c = payload as Omit<Cursor, "at">;
      usePresence.setState((s) => ({ cursors: { ...s.cursors, [c.id]: { ...c, at: Date.now() } } }));
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") channel.track({ name: me.name, color });
    });

  let last = 0;
  usePresence.setState({
    sendCursor: (x, y) => {
      const now = Date.now();
      if (now - last < 50) return;
      last = now;
      channel.send({ type: "broadcast", event: "cursor", payload: { id, name: me.name, color, x, y } });
    },
  });

  return {
    announce: () => {
      channel.send({ type: "broadcast", event: "saved", payload: {} });
    },
    leave: () => {
      usePresence.setState({ peers: [], cursors: {}, sendCursor: null });
      client.removeChannel(channel);
    },
  };
}
