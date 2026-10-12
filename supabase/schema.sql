-- Run this in your Supabase SQL editor to set up the diagrams table

create table if not exists public.diagrams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  diagram jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagrams_user_id_idx on public.diagrams(user_id);

alter table public.diagrams enable row level security;

create policy "Users can read own diagrams"
  on public.diagrams for select
  using (auth.uid() = user_id);

create policy "Users can insert own diagrams"
  on public.diagrams for insert
  with check (auth.uid() = user_id);

create policy "Users can update own diagrams"
  on public.diagrams for update
  using (auth.uid() = user_id);

create policy "Users can delete own diagrams"
  on public.diagrams for delete
  using (auth.uid() = user_id);

create policy "Anyone can read public diagrams"
  on public.diagrams for select
  using (is_public = true);
