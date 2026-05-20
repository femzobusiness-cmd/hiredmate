-- Phase 5: Learning Path — run in Supabase SQL Editor

create table if not exists public.worlds (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  title text not null,
  description text not null,
  icon text not null,
  color text not null,
  gradient text not null,
  order_index integer not null,
  required_level integer default 1,
  total_stages integer not null,
  created_at timestamptz default now()
);

create table if not exists public.stages (
  id uuid default gen_random_uuid() primary key,
  world_key text references public.worlds(key) on delete cascade,
  key text unique not null,
  title text not null,
  description text not null,
  stage_number integer not null,
  stage_type text not null,
  xp_reward integer not null,
  questions_count integer default 5,
  passing_score integer default 70,
  is_boss_stage boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.user_stage_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stage_key text references public.stages(key) on delete cascade not null,
  world_key text not null,
  completed boolean default false,
  best_score integer default 0,
  attempts integer default 0,
  stars integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, stage_key)
);

alter table public.user_stage_progress enable row level security;

create policy "Users manage own stages"
  on public.user_stage_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.worlds enable row level security;
alter table public.stages enable row level security;

create policy "Anyone can read worlds"
  on public.worlds for select to authenticated using (true);

create policy "Anyone can read stages"
  on public.stages for select to authenticated using (true);

grant select on public.worlds to authenticated;
grant select on public.stages to authenticated;
grant select, insert, update on public.user_stage_progress to authenticated;

-- Seed data: see full inserts in project spec or run from schema migration.
-- Worlds and stages inserts are in supabase/schema.sql (Phase 5 section) when synced.
