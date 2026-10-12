-- Run in the Supabase SQL editor. Safe to re-run.
-- Replaces the earlier `diagrams` table (drop it if you created it).
-- drop table if exists public.diagrams;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default 'Untitled project',
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'Untitled board',
  content jsonb not null,
  starred boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boards_user_id_idx on public.boards(user_id);
create index if not exists boards_project_id_idx on public.boards(project_id);

alter table public.projects enable row level security;
alter table public.boards enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own boards" on public.boards;
create policy "own boards" on public.boards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public boards readable" on public.boards;
create policy "public boards readable" on public.boards for select
  using (is_public = true);
