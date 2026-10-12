"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { saveDiagram, loadDiagrams, deleteDiagram, type SavedDiagram } from "@/lib/cloud";
import { useDiagramStore } from "@/store/diagram-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Cloud, LogOut, Trash2, X } from "lucide-react";

export function CloudPanel({ onClose }: { onClose: () => void }) {
  const { user, loading, signInWithGithub, signInWithGoogle, signOut, enabled } = useAuth();
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [saving, setSaving] = useState(false);
  const [cloudDiagramId, setCloudDiagramId] = useState<string | null>(null);
  const diagram = useDiagramStore((s) => s.diagram);
  const setDiagram = useDiagramStore((s) => s.setDiagram);

  const refresh = useCallback(async () => {
    const list = await loadDiagrams();
    setDiagrams(list);
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (!enabled) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-md" style={{ width: 300 }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="size-4" /> Cloud Save
          </h3>
          <Button variant="ghost" size="icon-xs" onClick={onClose}><X className="size-3.5" /></Button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Cloud save is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-md" style={{ width: 300 }}>
        <p className="text-xs text-[var(--muted-foreground)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-md" style={{ width: 300 }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="size-4" /> Sign In
          </h3>
          <Button variant="ghost" size="icon-xs" onClick={onClose}><X className="size-3.5" /></Button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Sign in to save diagrams to the cloud.
        </p>
        <Button size="sm" onClick={signInWithGithub} className="gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          Continue with GitHub
        </Button>
        <Button size="sm" variant="secondary" onClick={signInWithGoogle} className="gap-2">
          Continue with Google
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const id = await saveDiagram(diagram, cloudDiagramId ?? undefined);
    if (id) setCloudDiagramId(id);
    await refresh();
    setSaving(false);
  };

  const handleLoad = (d: SavedDiagram) => {
    setDiagram(d.diagram);
    setCloudDiagramId(d.id);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteDiagram(id);
    if (cloudDiagramId === id) setCloudDiagramId(null);
    await refresh();
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-md" style={{ width: 300, maxHeight: "calc(100vh - 120px)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Cloud className="size-4" /> Cloud
        </h3>
        <Button variant="ghost" size="icon-xs" onClick={onClose}><X className="size-3.5" /></Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <span className="truncate flex-1">{user.email}</span>
        <button onClick={signOut} className="shrink-0 hover:text-[var(--foreground)] transition-colors">
          <LogOut className="size-3.5" />
        </button>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : cloudDiagramId ? "Update in Cloud" : "Save to Cloud"}
      </Button>

      <Separator />

      <h4 className="text-xs font-medium text-[var(--muted-foreground)]">Your Diagrams</h4>

      {diagrams.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">No saved diagrams yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {diagrams.map((d) => (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors ${
                d.id === cloudDiagramId
                  ? "border-[#3b82f6]/40 bg-[#3b82f6]/5"
                  : "border-[var(--border)] hover:bg-[var(--surface)]"
              }`}
            >
              <button onClick={() => handleLoad(d)} className="flex-1 text-left truncate hover:text-[var(--foreground)] transition-colors">
                {d.title}
              </button>
              <span className="shrink-0 text-[10px] text-[var(--muted-foreground)]">
                {new Date(d.updated_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(d.id)}
                className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--error)] transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
