import {
  getRankForXp,
  getUpdatedStreak,
  getXpForScore,
} from '@/lib/gamification';
import { trackQuestEvents } from '@/lib/quest-tracking';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

type Body = {
  mode?: 'written' | 'multiple_choice' | 'clinical_blanks';
  score?: number;
  elapsedSeconds?: number;
  questionsAnswered?: number;
  sessionCompleted?: boolean;
  beatBestScore?: boolean;
  clinicalBlanksSession?: boolean;
};

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Body;
    const score = Math.max(0, Math.min(100, Math.round(body.score || 0)));
    const mode = body.mode || 'written';

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(
        'total_xp, rank_level, rank_title, current_streak, longest_streak, last_practice_date, specialty'
      )
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message || 'Profile not found' },
        { status: 404 }
      );
    }

    const { count: sessionCount } = await supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    const { data: previousAnswers } = await supabase
      .from('session_answers')
      .select('score')
      .order('created_at', { ascending: false })
      .limit(2);

    const streak = getUpdatedStreak(
      profile.current_streak || 0,
      profile.longest_streak || 0,
      profile.last_practice_date
    );
    const baseXp = getXpForScore(score, mode);
    const xpEarned = baseXp + streak.streakBonus;
    const oldRank = getRankForXp(profile.total_xp || 0);
    const totalXp = (profile.total_xp || 0) + xpEarned;
    const newRank = getRankForXp(totalXp);

    await supabase
      .from('user_profiles')
      .update({
        total_xp: totalXp,
        rank_level: newRank.level,
        rank_title: newRank.title,
        current_streak: streak.currentStreak,
        longest_streak: streak.longestStreak,
        last_practice_date: streak.lastPracticeDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id);

    const hour = new Date().getHours();
    const achievementKeys = new Set<string>();
    if ((sessionCount || 0) <= 1) achievementKeys.add('first_session');
    if (score === 100) achievementKeys.add('perfect_score');
    if (streak.currentStreak >= 5) achievementKeys.add('five_streak');
    if ((sessionCount || 0) >= 10) achievementKeys.add('ten_sessions');
    if ((sessionCount || 0) >= 20) achievementKeys.add('specialty_master');
    if ((body.elapsedSeconds || 999) < 30) achievementKeys.add('speed_demon');
    if (hour >= 22) achievementKeys.add('night_owl');
    if (hour < 7) achievementKeys.add('early_bird');
    if (
      score >= 90 &&
      previousAnswers?.some((answer) => (answer.score || 0) <= 50)
    ) {
      achievementKeys.add('comeback_kid');
    }

    const earnedAchievements: string[] = [];
    for (const achievementKey of Array.from(achievementKeys)) {
      const { error } = await supabase.from('achievements').insert({
        user_id: session.user.id,
        achievement_key: achievementKey,
      });
      if (!error) earnedAchievements.push(achievementKey);
    }

    const practiceMinutes = Math.max(
      0,
      Math.ceil((body.elapsedSeconds || 0) / 60)
    );

    const { completedQuests } = await trackQuestEvents(supabase, session.user.id, {
      ...(body.questionsAnswered != null
        ? { questionsAnswered: body.questionsAnswered }
        : {}),
      score,
      perfectScore: score === 100,
      practiceMinutes,
      mode,
      sessionCompleted: body.sessionCompleted,
      beatBestScore: body.beatBestScore,
      clinicalBlanksSession: body.clinicalBlanksSession,
    });

    return NextResponse.json({
      xpEarned,
      totalXp,
      oldRank,
      newRank,
      rankedUp: newRank.level > oldRank.level,
      currentStreak: streak.currentStreak,
      earnedAchievements,
      completedQuests,
    });
  } catch (error) {
    console.error('Gamification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update gamification stats' },
      { status: 500 }
    );
  }
}
