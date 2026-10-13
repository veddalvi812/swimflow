import { supabase } from "./supabase";
import type { SwimlaneDiagram, BoardContent } from "@/types/diagram";

export interface Project {
  id: string;
  name: string;
}

export interface BoardMeta {
  id: string;
  project_id: string;
  title: string;
  starred: boolean;
  is_public: boolean;
  updated_at: string;
  thumbnail?: string | null;
}

export interface Board extends BoardMeta {
  user_id: string;
  content: BoardContent;
}

export type Role = "owner" | "editor" | "viewer";

export interface Member {
  email: string;
  role: "viewer" | "editor";
}

const META = "id, project_id, title, starred, is_public, updated_at";

export async function listProjects(): Promise<Project[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("projects").select("id, name").order("created_at");
  return data ?? [];
}

export async function createProject(name: string): Promise<Project | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("projects").insert({ name }).select("id, name").single();
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return !error;
}

async function me() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

// Own boards only: RLS also lets us read public and shared boards, which must not show up here.
export async function listBoards(): Promise<BoardMeta[]> {
  const user = await me();
  if (!supabase || !user) return [];
  const query = (cols: string) =>
    supabase!.from("boards").select(cols).eq("user_id", user.id).order("updated_at", { ascending: false });
  // Boards made before the thumbnail column existed still list fine.
  const withThumb = await query(`${META}, thumbnail`);
  if (!withThumb.error) return (withThumb.data as unknown as BoardMeta[]) ?? [];
  const plain = await query(META);
  return (plain.data as unknown as BoardMeta[]) ?? [];
}

export async function listShared(): Promise<BoardMeta[]> {
  const user = await me();
  if (!supabase || !user?.email) return [];
  const { data: rows } = await supabase.from("board_members").select("board_id").ilike("email", user.email);
  const ids = (rows ?? []).map((r) => r.board_id);
  if (!ids.length) return [];
  const { data } = await supabase.from("boards").select(META).in("id", ids).order("updated_at", { ascending: false });
  return data ?? [];
}

// The caller's role on a board: owner, an invited role, or viewer (public link).
export async function getRole(board: Pick<Board, "id" | "user_id">): Promise<Role> {
  const user = await me();
  if (!supabase || !user) return "viewer";
  if (user.id === board.user_id) return "owner";
  const { data } = await supabase
    .from("board_members")
    .select("role")
    .eq("board_id", board.id)
    .ilike("email", user.email ?? "")
    .maybeSingle();
  return data?.role ?? "viewer";
}

export async function listMembers(boardId: string): Promise<Member[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("board_members").select("email, role").eq("board_id", boardId).order("email");
  return (data as Member[]) ?? [];
}

export async function addMember(boardId: string, email: string, role: Member["role"]): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("board_members")
    .upsert({ board_id: boardId, email: email.trim().toLowerCase(), role });
  return !error;
}

export async function removeMember(boardId: string, email: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("board_members").delete().eq("board_id", boardId).eq("email", email);
  return !error;
}

export async function createBoard(projectId: string, content: SwimlaneDiagram): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("boards")
    .insert({ project_id: projectId, title: content.title, content })
    .select("id")
    .single();
  return data?.id ?? null;
}

export async function loadBoard(id: string): Promise<Board | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("boards").select(`${META}, user_id, content`).eq("id", id).single();
  return data as Board | null;
}

export async function saveBoard(id: string, content: BoardContent): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("boards")
    .update({ title: content.title, content, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function updateBoard(
  id: string,
  patch: Partial<Pick<BoardMeta, "title" | "starred" | "is_public" | "project_id">>
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("boards").update(patch).eq("id", id);
  return !error;
}

export async function deleteBoard(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("boards").delete().eq("id", id);
  return !error;
}

export async function exportAllBoards() {
  const user = await me();
  if (!supabase || !user) return [];
  const { data } = await supabase.from("boards").select("id, title, content, updated_at").eq("user_id", user.id);
  return data ?? [];
}

export async function deleteMyAccount(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc("delete_my_account");
  return !error;
}

export async function updateProject(id: string, name: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("projects").update({ name }).eq("id", id);
  return !error;
}

// Renaming has to change the title inside the board too, or the next autosave would put the old one back.
export async function renameBoard(id: string, title: string): Promise<boolean> {
  const board = await loadBoard(id);
  if (!board || !supabase) return false;
  const { error } = await supabase.from("boards").update({ title, content: { ...board.content, title } }).eq("id", id);
  return !error;
}

export async function duplicateBoard(id: string): Promise<string | null> {
  const board = await loadBoard(id);
  if (!board || !supabase) return null;
  const title = `${board.title} (copy)`;
  const { data } = await supabase
    .from("boards")
    .insert({ project_id: board.project_id, title, content: { ...board.content, title } })
    .select("id")
    .single();
  return data?.id ?? null;
}

// Best effort: the dashboard works without previews, so a missing column or a failed write is fine.
export async function saveThumbnail(id: string, thumbnail: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("boards").update({ thumbnail }).eq("id", id);
}

export interface Comment {
  id: string;
  board_id: string;
  node_id: string | null;
  user_id: string;
  author: string;
  body: string;
  resolved: boolean;
  created_at: string;
}

// Comments are optional: if the table isn't there yet these just come back empty or false.
export async function listComments(boardId: string): Promise<Comment[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("comments").select("*").eq("board_id", boardId).order("created_at");
  return (data as Comment[]) ?? [];
}

export async function addComment(boardId: string, nodeId: string | null, author: string, body: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("comments").insert({ board_id: boardId, node_id: nodeId, author, body });
  return !error;
}

export async function setCommentResolved(id: string, resolved: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("comments").update({ resolved }).eq("id", id);
  return !error;
}

export async function deleteComment(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("comments").delete().eq("id", id);
  return !error;
}
