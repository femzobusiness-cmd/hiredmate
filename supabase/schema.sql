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
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  sound_effects_enabled boolean default false,
  rank_title text default 'Student Nurse',
  rank_level integer default 1,
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_practice_date date,
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

alter table public.practice_sessions
  add column if not exists hospital_id text;

create table if not exists public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete cascade not null,
  question text not null,
  answer text,
  score numeric,
  feedback text,
  skill_key text,
  created_at timestamptz default now()
);

alter table public.session_answers
  add column if not exists skill_key text;

create table if not exists public.skill_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_key text not null,
  xp integer default 0,
  level integer default 1,
  sessions_count integer default 0,
  avg_score numeric default 0,
  last_practiced timestamptz,
  created_at timestamptz default now(),
  unique (user_id, skill_key)
);

alter table public.user_profiles
  add column if not exists first_name text,
  add column if not exists specialty text,
  add column if not exists experience_level text,
  add column if not exists hospital_name text,
  add column if not exists job_title text,
  add column if not exists interview_timeline text,
  add column if not exists interview_date date,
  add column if not exists biggest_fears text[] default '{}',
  add column if not exists resume_url text,
  add column if not exists resume_text text,
  add column if not exists plan text default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists sound_effects_enabled boolean default false,
  add column if not exists rank_title text default 'Student Nurse',
  add column if not exists rank_level integer default 1,
  add column if not exists total_xp integer default 0,
  add column if not exists current_streak integer default 0,
  add column if not exists longest_streak integer default 0,
  add column if not exists last_practice_date date,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists updated_at timestamptz default now();

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_key text not null,
  earned_at timestamptz default now(),
  unique (user_id, achievement_key)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_user_id_key'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_user_id_key unique (user_id);
  end if;
end $$;

-- Storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

alter table public.user_profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.session_answers enable row level security;
alter table public.achievements enable row level security;
alter table public.skill_progress enable row level security;

create policy "Users can manage own skill progress"
  on public.skill_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

create policy "Users can view own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own resume"
  on storage.objects for select
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

-- Quest system (Phase 4)
create table if not exists public.quests (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  title text not null,
  description text not null,
  quest_type text not null,
  frequency text not null,
  xp_reward integer not null,
  icon text not null,
  requirement_type text not null,
  requirement_value integer not null,
  specialty_filter text,
  created_at timestamptz default now()
);

create table if not exists public.user_quest_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  quest_key text references public.quests(key) on delete cascade not null,
  progress integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  period_start date not null,
  xp_claimed boolean default false,
  created_at timestamptz default now(),
  unique (user_id, quest_key, period_start)
);

alter table public.user_quest_progress enable row level security;

create policy "Users manage own quests"
  on public.user_quest_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.quests enable row level security;

drop policy if exists "Authenticated users can read quests" on public.quests;
drop policy if exists "Anyone can read quests" on public.quests;

create policy "Anyone can read quests"
  on public.quests for select
  to authenticated
  using (true);

grant select on public.quests to authenticated;
grant select, insert, update on public.user_quest_progress to authenticated;

insert into public.quests (
  key, title, description, quest_type,
  frequency, xp_reward, icon,
  requirement_type, requirement_value
) values
(
  'daily_practice_3',
  'Daily Warmup',
  'Complete 3 practice questions today',
  'daily', 'daily', 30, '🔥',
  'questions_answered', 3
),
(
  'daily_score_80',
  'Sharp Mind',
  'Score 80% or higher on any session',
  'daily', 'daily', 25, '🎯',
  'score_above', 80
),
(
  'daily_streak',
  'Stay Consistent',
  'Practice for 10 minutes today',
  'daily', 'daily', 20, '⏱️',
  'practice_minutes', 10
),
(
  'daily_clinical_blank',
  'Fill in the Gaps',
  'Complete a Clinical Blanks session',
  'daily', 'daily', 35, '📝',
  'clinical_blanks_session', 1
),
(
  'daily_perfect',
  'Perfectionist',
  'Get a perfect score on any question',
  'daily', 'daily', 50, '⭐',
  'perfect_score', 1
),
(
  'weekly_sessions_10',
  'Dedicated Nurse',
  'Complete 10 practice sessions this week',
  'weekly', 'weekly', 150, '💪',
  'sessions_completed', 10
),
(
  'weekly_beat_score',
  'Level Up',
  'Beat your previous best score',
  'weekly', 'weekly', 100, '📈',
  'beat_best_score', 1
),
(
  'weekly_all_modes',
  'All Rounder',
  'Practice in all 3 modes this week',
  'weekly', 'weekly', 120, '🌟',
  'all_modes_used', 3
),
(
  'weekly_skill_focus',
  'Skill Builder',
  'Earn 100 XP in any single skill',
  'weekly', 'weekly', 200, '🌱',
  'skill_xp_earned', 100
),
(
  'weekly_streak_7',
  'Iron Nurse',
  'Maintain a 7-day practice streak',
  'weekly', 'weekly', 300, '🏆',
  'streak_days', 7
)
on conflict (key) do nothing;

-- Mock interviews (Phase 9)
create table if not exists public.mock_interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  personality_mode text not null,
  specialty text,
  hospital_id text,
  conversation jsonb default '[]',
  debrief jsonb,
  overall_score integer,
  duration_seconds integer,
  created_at timestamptz default now()
);

alter table public.mock_interviews enable row level security;

create policy "Users can manage own mock interviews"
  on public.mock_interviews for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Voice practice sessions (Phase 10)
create table if not exists public.voice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  transcript text,
  duration_seconds integer,
  word_count integer,
  words_per_minute integer,
  filler_word_count integer,
  filler_words_found jsonb,
  overall_score integer,
  pace_rating text,
  analysis jsonb,
  created_at timestamptz default now()
);

alter table public.voice_sessions enable row level security;

create policy "Users can manage own voice sessions"
  on public.voice_sessions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Community / social (Phase 11)
alter table public.practice_sessions
  add column if not exists xp_earned integer default 0;

create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, receiver_id)
);

alter table public.friendships enable row level security;

create policy "Users can manage own friendships"
  on public.friendships for all
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = receiver_id)
  with check (auth.uid() = requester_id or auth.uid() = receiver_id);

create table if not exists public.shared_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_type text not null,
  achievement_data jsonb,
  created_at timestamptz default now()
);

alter table public.shared_achievements enable row level security;

create policy "Users can manage own shares"
  on public.shared_achievements for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users can view profiles for community"
  on public.user_profiles for select
  to authenticated
  using (true);

-- Battle Mode (Phase 12)
create table if not exists public.battle_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer default 0,
  questions_answered integer default 0,
  correct_answers integer default 0,
  speed_bonuses integer default 0,
  xp_earned integer default 0,
  max_streak integer default 0,
  difficulty_reached integer default 1,
  created_at timestamptz default now()
);

alter table public.battle_sessions enable row level security;

create policy "Users can manage own battle sessions"
  on public.battle_sessions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.battle_leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  weekly_score integer default 0,
  all_time_best integer default 0,
  battles_played integer default 0,
  week_start date,
  updated_at timestamptz default now()
);

alter table public.battle_leaderboard enable row level security;

create policy "Users can manage own battle scores"
  on public.battle_leaderboard for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- AI Resume Builder (Phase 13)
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'My Nursing Resume',
  specialty text,
  target_role text,
  resume_data jsonb,
  generated_content jsonb,
  version integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resumes enable row level security;

create policy "Users can manage own resumes"
  on public.resumes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
