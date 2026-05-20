import { calculateBattleXp, getWeekStartDate } from '@/lib/battle';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const score = Number(body.score) || 0;
    const questionsAnswered = Number(body.questionsAnswered) || 0;
    const correctAnswers = Number(body.correctAnswers) || 0;
    const speedBonuses = Number(body.speedBonuses) || 0;
    const maxStreak = Number(body.maxStreak) || 0;
    const difficultyReached = Number(body.difficultyReached) || 1;

    const xpEarned = calculateBattleXp(score, speedBonuses, maxStreak);
    const weekStart = getWeekStartDate();

    const { error: sessionError } = await supabase.from('battle_sessions').insert({
      user_id: session.user.id,
      score,
      questions_answered: questionsAnswered,
      correct_answers: correctAnswers,
      speed_bonuses: speedBonuses,
      xp_earned: xpEarned,
      max_streak: maxStreak,
      difficulty_reached: difficultyReached,
    });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    const { data: existing } = await supabase
      .from('battle_leaderboard')
      .select('id, weekly_score, all_time_best, battles_played')
      .eq('user_id', session.user.id)
      .eq('week_start', weekStart)
      .maybeSingle();

    const allTimeBest = Math.max(existing?.all_time_best || 0, score);
    const isPersonalBest = score > (existing?.all_time_best || 0);

    if (existing) {
      await supabase
        .from('battle_leaderboard')
        .update({
          weekly_score: Math.max(existing.weekly_score || 0, score),
          all_time_best: allTimeBest,
          battles_played: (existing.battles_played || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('battle_leaderboard').insert({
        user_id: session.user.id,
        weekly_score: score,
        all_time_best: score,
        battles_played: 1,
        week_start: weekStart,
      });
    }

    if (xpEarned > 0) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('user_id', session.user.id)
        .maybeSingle();

      await supabase
        .from('user_profiles')
        .update({
          total_xp: (profile?.total_xp || 0) + xpEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id);
    }

    return NextResponse.json({
      xpEarned,
      allTimeBest,
      isPersonalBest,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
