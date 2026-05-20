-- Phase 11: Community / Social — run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE TABLE IF NOT EXISTS shared_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shared_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shares" ON shared_achievements FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;

DROP POLICY IF EXISTS "Authenticated users can view profiles for community" ON user_profiles;
CREATE POLICY "Authenticated users can view profiles for community"
  ON user_profiles FOR SELECT TO authenticated USING (true);
