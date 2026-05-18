-- Run this in your Supabase SQL editor

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  first_name text,
  specialty text,
  experience_level text,
  hospital_name text,
  job_title text,
  interview_timeline text,
  interview_date date,
  biggest_fears text[] default '{}',
  resume_url text,
  resume_text text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  score numeric,
  questions_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete cascade not null,
  question text not null,
  answer text,
  score numeric,
  feedback text,
  created_at timestamptz default now()
);

-- Storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

alter table public.user_profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.session_answers enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can view own sessions"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can view own answers"
  on public.session_answers for select
  using (
    exists (
      select 1 from public.practice_sessions ps
      where ps.id = session_id and ps.user_id = auth.uid()
    )
  );

create policy "Users can insert own answers"
  on public.session_answers for insert
  with check (
    exists (
      select 1 from public.practice_sessions ps
      where ps.id = session_id and ps.user_id = auth.uid()
    )
  );

create policy "Users can upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own resume"
  on storage.objects for select
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
