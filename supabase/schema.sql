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


-- Sharing: invite people by email as viewers or editors. Re-run safe.
create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  email text not null,
  role text not null check (role in ('viewer', 'editor')),
  primary key (board_id, email)
);
alter table public.board_members enable row level security;

-- security definer helpers avoid the boards <-> board_members policy recursion
create or replace function public.is_board_owner(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.boards where id = bid and user_id = auth.uid())
$$;

create or replace function public.board_role(bid uuid) returns text
language sql security definer stable set search_path = public as $$
  select role from public.board_members
  where board_id = bid and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

drop policy if exists "owner manages members" on public.board_members;
create policy "owner manages members" on public.board_members for all
  using (public.is_board_owner(board_id)) with check (public.is_board_owner(board_id));

drop policy if exists "member sees own invite" on public.board_members;
create policy "member sees own invite" on public.board_members for select
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "members read boards" on public.boards;
create policy "members read boards" on public.boards for select
  using (public.board_role(id) is not null);

-- ponytail: editors can update every column, including is_public. Add a trigger if that matters.
drop policy if exists "editors update boards" on public.boards;
create policy "editors update boards" on public.boards for update
  using (public.board_role(id) = 'editor') with check (public.board_role(id) = 'editor');
