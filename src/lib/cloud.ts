import { supabase } from "./supabase";
import type { SwimlaneDiagram } from "@/types/diagram";

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
}

export interface Board extends BoardMeta {
  content: SwimlaneDiagram;
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

export async function listBoards(): Promise<BoardMeta[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("boards").select(META).order("updated_at", { ascending: false });
  return data ?? [];
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
  const { data } = await supabase.from("boards").select(`${META}, content`).eq("id", id).single();
  return data as Board | null;
}

export async function saveBoard(id: string, content: SwimlaneDiagram): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("boards")
    .update({ title: content.title, content, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function updateBoard(
  id: string,
  patch: Partial<Pick<BoardMeta, "title" | "starred" | "is_public">>
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
