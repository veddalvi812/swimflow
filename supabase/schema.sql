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


-- Account: lets a signed-in user delete their own account (and, through cascades, their boards).
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid()
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;


-- Board previews shown on the dashboard.
alter table public.boards add column if not exists thumbnail text;


-- Comments on a board, optionally pinned to one object (node_id).
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  node_id text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author text not null default '',
  body text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_board_id_idx on public.comments(board_id);
alter table public.comments enable row level security;

-- If you can see the board (yours, public, or shared with you), you can read its comments.
drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments for select
  using (exists (select 1 from public.boards b where b.id = board_id));

drop policy if exists "add comments" on public.comments;
create policy "add comments" on public.comments for insert
  with check (auth.uid() = user_id and exists (select 1 from public.boards b where b.id = board_id));

drop policy if exists "resolve or delete comments" on public.comments;
create policy "resolve or delete comments" on public.comments for update
  using (auth.uid() = user_id or public.is_board_owner(board_id));

drop policy if exists "remove comments" on public.comments;
create policy "remove comments" on public.comments for delete
  using (auth.uid() = user_id or public.is_board_owner(board_id));
