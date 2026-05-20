import { getWeekStartDate } from '@/lib/battle';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const weekStart = getWeekStartDate();

    const { data: weekSessions } = await admin
      .from('battle_sessions')
      .select('user_id, questions_answered, score')
      .gte('created_at', `${weekStart}T00:00:00.000Z`);

    const uniqueNurses = new Set((weekSessions || []).map((s) => s.user_id)).size;
    const answered = (weekSessions || []).map((s) => s.questions_answered || 0);
    const avgSurvival =
      answered.length > 0
        ? Math.round(
            answered.reduce((sum, n) => sum + n, 0) / answered.length
          )
        : 8;

    const { data: weekBoard } = await admin
      .from('battle_leaderboard')
      .select('weekly_score')
      .eq('week_start', weekStart)
      .order('weekly_score', { ascending: false })
      .limit(1);

    const topScore = weekBoard?.[0]?.weekly_score || 0;

    const { data: preview } = await admin
      .from('battle_leaderboard')
      .select('user_id, weekly_score')
      .eq('week_start', weekStart)
      .order('weekly_score', { ascending: false })
      .limit(5);

    const userIds = (preview || []).map((p) => p.user_id);
    const { data: profiles } = userIds.length
      ? await admin
          .from('user_profiles')
          .select('user_id, first_name')
          .in('user_id', userIds)
      : { data: [] };

    const nameMap = new Map(
      (profiles || []).map((p) => [p.user_id, p.first_name?.trim() || 'Nurse'])
    );

    return NextResponse.json({
      nursesBattling: uniqueNurses || 12,
      avgSurvival,
      topScore,
      topFive: (preview || []).map((row, i) => ({
        rank: i + 1,
        name: nameMap.get(row.user_id) || 'Nurse',
        score: row.weekly_score || 0,
      })),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
