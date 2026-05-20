import { getInitials, getWeekStartDate } from '@/lib/battle';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') === 'alltime' ? 'alltime' : 'week';
    const weekStart = getWeekStartDate();

    const admin = createSupabaseAdminClient();

    let query = admin
      .from('battle_leaderboard')
      .select('user_id, weekly_score, all_time_best, battles_played')
      .order(
        period === 'week' ? 'weekly_score' : 'all_time_best',
        { ascending: false }
      )
      .limit(50);

    if (period === 'week') {
      query = query.eq('week_start', weekStart);
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = (rows || []).map((r) => r.user_id);
    const { data: profiles } = userIds.length
      ? await admin
          .from('user_profiles')
          .select('user_id, first_name, specialty')
          .in('user_id', userIds)
      : { data: [] };

    const profileMap = new Map(
      (profiles || []).map((p) => [
        p.user_id,
        {
          name: p.first_name?.trim() || 'Nurse',
          specialty: p.specialty,
        },
      ])
    );

    const { data: streakRows } = userIds.length
      ? await admin
          .from('battle_sessions')
          .select('user_id, max_streak')
          .in('user_id', userIds)
          .order('max_streak', { ascending: false })
      : { data: [] };

    const bestStreakByUser = new Map<string, number>();
    for (const row of streakRows || []) {
      const current = bestStreakByUser.get(row.user_id) || 0;
      bestStreakByUser.set(
        row.user_id,
        Math.max(current, row.max_streak || 0)
      );
    }

    const entries = (rows || []).map((row, index) => {
      const profile = profileMap.get(row.user_id);
      const score =
        period === 'week' ? row.weekly_score || 0 : row.all_time_best || 0;
      return {
        rank: index + 1,
        userId: row.user_id,
        name: profile?.name || 'Nurse',
        specialty: profile?.specialty,
        score,
        battlesPlayed: row.battles_played || 0,
        bestStreak: bestStreakByUser.get(row.user_id) || 0,
        initials: getInitials(profile?.name || 'Nurse'),
        isCurrentUser: row.user_id === session.user.id,
      };
    });

    return NextResponse.json({ period, entries });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
