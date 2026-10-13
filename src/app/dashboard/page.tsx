"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Folder, Home, Link2, Users, LogOut, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  createBoard, createProject, deleteBoard, deleteProject, listBoards, listProjects, listShared, updateBoard,
  type BoardMeta, type Project,
} from "@/lib/cloud";
import { SAMPLE_DIAGRAM, BLANK_DIAGRAM } from "@/lib/constants";
import type { SwimlaneDiagram } from "@/types/diagram";

type View = "home" | "starred" | "shared" | string; // string = project id


export default function DashboardPage() {
  const { user, loading, signOut } = useRequireAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [shared, setShared] = useState<BoardMeta[]>([]);
  const [view, setView] = useState<View>("home");
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    let ps = await listProjects();
    if (ps.length === 0) {
      const p = await createProject("My project");
      ps = p ? [p] : [];
    }
    setProjects(ps);
    setBoards(await listBoards());
    setShared(await listShared());
    setReady(true);
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (loading || !user || !ready) {
    return <div className="flex h-screen items-center justify-center text-sm text-[#71717a]">Loading...</div>;
  }

  const projectId = projects.some((p) => p.id === view) ? view : projects[0]?.id;
  const shown = view === "shared" ? shared : boards.filter((b) => view === "home" || (view === "starred" ? b.starred : b.project_id === view));
  const title = view === "shared" ? "Shared with me" : view === "home" ? "All boards" : view === "starred" ? "Starred" : projects.find((p) => p.id === view)?.name;

  const newBoard = async (content: SwimlaneDiagram) => {
    if (!projectId) return;
    const id = await createBoard(projectId, content);
    if (id) router.push(`/board/${id}`);
  };
  const addProject = async () => {
    const name = window.prompt("Project name");
    if (!name?.trim()) return;
    const p = await createProject(name.trim());
    if (p) { await refresh(); setView(p.id); }
  };
  const removeProject = async (p: Project) => {
    if (!window.confirm(`Delete "${p.name}" and all its boards?`)) return;
    await deleteProject(p.id);
    setView("home");
    refresh();
  };
  const patch = async (id: string, p: Parameters<typeof updateBoard>[1]) => {
    await updateBoard(id, p);
    setBoards(await listBoards());
  };
  const share = async (b: BoardMeta) => {
    if (!b.is_public) await patch(b.id, { is_public: true });
    await navigator.clipboard.writeText(`${window.location.origin}/view/${b.id}`);
    window.alert("Public link copied");
  };
  const remove = async (b: BoardMeta) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    await deleteBoard(b.id);
    setBoards(await listBoards());
  };

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
      active ? "bg-[#e4e4e7] font-medium" : "text-[#52525b] hover:bg-[#f4f4f5]"
    }`;

  return (
    <div className="flex h-screen bg-white text-[#1a1a1a]">
      <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-[#e4e4e7] bg-[#fafafa] p-3">
        <Link href="/" className="px-3 py-2 text-[15px] font-medium">SwimFlow</Link>
        <button onClick={() => setView("home")} className={navBtn(view === "home")}><Home className="size-4" /> Home</button>
        <button onClick={() => setView("starred")} className={navBtn(view === "starred")}><Star className="size-4" /> Starred</button>
        <button onClick={() => setView("shared")} className={navBtn(view === "shared")}><Users className="size-4" /> Shared with me</button>

        <div className="mt-4 flex items-center justify-between px-3 text-xs font-medium text-[#71717a]">
          Projects
          <button onClick={addProject} aria-label="New project" className="hover:text-[#1a1a1a]"><Plus className="size-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projects.map((p) => (
            <div key={p.id} className="group relative">
              <button onClick={() => setView(p.id)} className={navBtn(view === p.id)}>
                <Folder className="size-4" /> <span className="truncate">{p.name}</span>
              </button>
              {projects.length > 1 && (
                <button
                  onClick={() => removeProject(p)}
                  aria-label={`Delete ${p.name}`}
                  className="absolute right-2 top-2.5 hidden text-[#a1a1aa] hover:text-[#dc2626] group-hover:block"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-[#e4e4e7] px-3 pt-3 text-xs text-[#71717a]">
          <span className="flex-1 truncate">{user.email}</span>
          <button onClick={signOut} aria-label="Sign out" className="hover:text-[#1a1a1a]"><LogOut className="size-4" /></button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => newBoard(SAMPLE_DIAGRAM)} className="text-sm text-[#71717a] hover:text-[#1a1a1a]">Start from sample</button>
            <button
              onClick={() => newBoard(BLANK_DIAGRAM)}
              className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Plus className="size-4" /> New board
            </button>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4d4d8] py-20 text-center">
            <p className="font-medium">{view === "shared" ? "Nothing shared with you yet" : "Start your first board"}</p>
            <p className="mt-1 text-sm text-[#71717a]">
              {view === "shared" ? "Boards other people invite you to will show up here." : "Create a blank board or start from a sample process."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {shown.map((b) => (
              <div key={b.id} className="group overflow-hidden rounded-xl border border-[#e4e4e7] bg-white transition-colors hover:border-[#d4d4d8]">
                <Link href={`/board/${b.id}`} className="block">
                  <div className="flex h-32 flex-col justify-center gap-1.5 bg-[#f4f4f5] px-6">
                    <div className="h-4 rounded bg-[#3b82f6]/20" />
                    <div className="h-4 rounded bg-[#22c55e]/20" />
                    <div className="h-4 rounded bg-[#f59e0b]/20" />
                  </div>
                  <div className="px-4 pt-3">
                    <p className="truncate text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-[#a1a1aa]">Edited {new Date(b.updated_at).toLocaleDateString()}</p>
                  </div>
                </Link>
                <div className={`flex items-center gap-3 px-4 pb-3 pt-2 text-[#a1a1aa] ${view === "shared" ? "hidden" : ""}`}>
                  <button onClick={() => patch(b.id, { starred: !b.starred })} aria-label="Star" className="hover:text-[#f59e0b]">
                    <Star className={`size-4 ${b.starred ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`} />
                  </button>
                  <button
                    onClick={() => { const t = window.prompt("Rename board", b.title); if (t?.trim()) patch(b.id, { title: t.trim() }); }}
                    aria-label="Rename" className="hover:text-[#1a1a1a]"
                  ><Pencil className="size-4" /></button>
                  <button onClick={() => share(b)} aria-label="Copy public link" className={b.is_public ? "text-[#3b82f6]" : "hover:text-[#1a1a1a]"}>
                    <Link2 className="size-4" />
                  </button>
                  <button onClick={() => remove(b)} aria-label="Delete" className="ml-auto hover:text-[#dc2626]"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
