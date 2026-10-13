"use client";

import { useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Check, Trash2, X } from "lucide-react";
import { useBoardCtx, refreshComments } from "@/store/board-ctx";
import { useFreeStore } from "@/store/free-store";
import { addComment, deleteComment, setCommentResolved } from "@/lib/cloud";
import { useAuth, displayName } from "@/hooks/use-auth";
import { toast } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { card, maxH } from "./ObjectProperties";

function labelOf(type: string | undefined, data: Record<string, unknown>) {
  const raw = [data.text, data.title, data.emoji].find((v) => typeof v === "string" && v.trim()) as string | undefined;
  return raw ? `${type ?? "object"}: “${raw.slice(0, 24)}”` : (type ?? "object");
}

export function CommentsPanel() {
  const boardId = useBoardCtx((s) => s.boardId);
  const comments = useBoardCtx((s) => s.comments);
  const nodes = useFreeStore((s) => s.nodes);
  const { user } = useAuth();
  const { fitView } = useReactFlow();
  const [text, setText] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [detached, setDetached] = useState(false);

  const selected = useMemo(() => {
    const sel = nodes.filter((n) => n.selected);
    return sel.length === 1 ? sel[0] : undefined;
  }, [nodes]);
  const attachTo = detached ? undefined : selected;

  if (!boardId) return null;
  const visible = comments.filter((c) => showResolved || !c.resolved);

  const post = async () => {
    if (!user) return toast("Log in to comment", "error");
    const ok = await addComment(boardId, attachTo?.id ?? null, displayName(user) || "Someone", text.trim());
    if (!ok) return toast("Couldn't post that comment", "error");
    setText("");
    refreshComments();
  };

  const jump = (nodeId: string | null) => {
    const node = nodeId ? nodes.find((n) => n.id === nodeId) : undefined;
    if (!node) return;
    useFreeStore.setState((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: n.id === nodeId })) }));
    fitView({ nodes: [{ id: node.id }], padding: 0.8, maxZoom: 1.2, duration: 300 });
  };

  return (
    <div className={card} style={maxH}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Comments</h3>
        <label className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} /> Show resolved
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="text-xs text-[var(--muted-foreground)]">No comments yet. Select an object to comment on it, or leave a note for the whole board.</p>
        )}
        {visible.map((c) => {
          const node = c.node_id ? nodes.find((n) => n.id === c.node_id) : undefined;
          const mine = user?.id === c.user_id;
          return (
            <div key={c.id} className={`rounded-md border border-[var(--border)] p-2 text-sm ${c.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{c.author || "Someone"}</span>
                <span className="shrink-0 text-[10px] text-[var(--muted-foreground)]">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              {c.node_id && (
                <button onClick={() => jump(c.node_id)} className="mt-0.5 text-xs text-[#3b82f6] hover:underline">
                  {node ? labelOf(node.type, node.data) : "An object that was removed"}
                </button>
              )}
              <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <button
                  onClick={async () => {
                    await setCommentResolved(c.id, !c.resolved);
                    refreshComments();
                  }}
                  className="flex items-center gap-1 hover:text-[var(--foreground)]"
                >
                  <Check className="size-3.5" /> {c.resolved ? "Reopen" : "Resolve"}
                </button>
                {mine && (
                  <button
                    onClick={async () => {
                      await deleteComment(c.id);
                      refreshComments();
                    }}
                    className="flex items-center gap-1 hover:text-[#dc2626]"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
        {attachTo && (
          <div className="flex items-center justify-between rounded-md bg-[var(--surface)] px-2 py-1 text-xs">
            <span className="truncate">On {labelOf(attachTo.type, attachTo.data)}</span>
            <button aria-label="Comment on the whole board instead" onClick={() => setDetached(true)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (detached && selected) setDetached(false);
          }}
          rows={3}
          placeholder={user ? "Write a comment" : "Log in to comment"}
          className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-sm outline-none focus:border-[var(--border-focus)]"
        />
        <Button size="sm" onClick={post} disabled={!text.trim() || !user}>Comment</Button>
      </div>
    </div>
  );
}
