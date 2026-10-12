import { supabase } from "./supabase";
import type { SwimlaneDiagram } from "@/types/diagram";

export interface SavedDiagram {
  id: string;
  title: string;
  diagram: SwimlaneDiagram;
  updated_at: string;
  is_public: boolean;
}

export async function saveDiagram(
  diagram: SwimlaneDiagram,
  existingId?: string
): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (existingId) {
    const { error } = await supabase
      .from("diagrams")
      .update({ title: diagram.title, diagram, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .eq("user_id", user.id);
    return error ? null : existingId;
  }

  const { data, error } = await supabase
    .from("diagrams")
    .insert({ user_id: user.id, title: diagram.title, diagram })
    .select("id")
    .single();
  return error ? null : data.id;
}

export async function loadDiagrams(): Promise<SavedDiagram[]> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("diagrams")
    .select("id, title, diagram, updated_at, is_public")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  return (data as SavedDiagram[]) ?? [];
}

export async function loadDiagram(id: string): Promise<SavedDiagram | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from("diagrams")
    .select("id, title, diagram, updated_at, is_public")
    .eq("id", id)
    .single();
  return data as SavedDiagram | null;
}

export async function deleteDiagram(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("diagrams").delete().eq("id", id);
  return !error;
}

export async function togglePublic(id: string, isPublic: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("diagrams")
    .update({ is_public: isPublic })
    .eq("id", id);
  return !error;
}
