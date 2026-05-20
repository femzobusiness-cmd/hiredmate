import type { Database } from '@/lib/database.types';
import {
  getSkillByKey,
  getSkillLevel,
  getSkillXpForScore,
  SKILLS,
} from '@/lib/skills';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SkillProgressRow =
  Database['public']['Tables']['skill_progress']['Row'];

export type SkillLevelUpResult = {
  leveledUp: boolean;
  skillKey: string;
  skillName: string;
  skillIcon: string;
  skillColor: string;
  previousLevel: number;
  newLevel: number;
  xpEarned: number;
};

export async function updateSkillProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
  skillKey: string,
  score: number
): Promise<SkillLevelUpResult | null> {
  const skill = getSkillByKey(skillKey);
  if (!skill) return null;

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const xpEarned = getSkillXpForScore(normalizedScore);

  const { data: existingRow } = await supabase
    .from('skill_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('skill_key', skillKey)
    .maybeSingle();

  const existing = existingRow as SkillProgressRow | null;
  const previousXp = existing?.xp || 0;
  const previousLevel = getSkillLevel(previousXp);
  const sessionsCount = (existing?.sessions_count || 0) + 1;
  const previousAvg = Number(existing?.avg_score || 0);
  const nextAvg = existing
    ? Math.round(
        (previousAvg * (sessionsCount - 1) + normalizedScore) / sessionsCount
      )
    : normalizedScore;
  const nextXp = previousXp + xpEarned;
  const newLevel = getSkillLevel(nextXp);

  const payload = {
    user_id: userId,
    skill_key: skillKey,
    xp: nextXp,
    level: newLevel,
    sessions_count: sessionsCount,
    avg_score: nextAvg,
    last_practiced: new Date().toISOString(),
  };

  const { error } = await (supabase as unknown as SupabaseClient)
    .from('skill_progress')
    .upsert(payload, { onConflict: 'user_id,skill_key' });

  if (error) {
    console.error('Skill progress update error:', error.message);
    return null;
  }

  return {
    leveledUp: newLevel > previousLevel,
    skillKey,
    skillName: skill.name,
    skillIcon: skill.icon,
    skillColor: skill.color,
    previousLevel,
    newLevel,
    xpEarned,
  };
}

export function mergeSkillProgress(
  rows: SkillProgressRow[] | null | undefined
) {
  const byKey = new Map((rows || []).map((row) => [row.skill_key, row]));

  return SKILLS.map((skill) => {
    const row = byKey.get(skill.key);
    const xp = row?.xp || 0;
    const level = getSkillLevel(xp);

    return {
      ...skill,
      xp,
      level,
      sessionsCount: row?.sessions_count || 0,
      avgScore: row?.avg_score != null ? Number(row.avg_score) : null,
      lastPracticed: row?.last_practiced || null,
    };
  });
}

export function daysSince(date: string | null) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
