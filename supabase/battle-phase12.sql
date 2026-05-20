-- Phase 12: Battle Mode — run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS battle_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  speed_bonuses INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  difficulty_reached INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own battle sessions" ON battle_sessions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS battle_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_score INTEGER DEFAULT 0,
  all_time_best INTEGER DEFAULT 0,
  battles_played INTEGER DEFAULT 0,
  week_start DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE battle_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own battle scores" ON battle_leaderboard FOR ALL USING (auth.uid() = user_id);
