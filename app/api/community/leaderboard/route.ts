import {
  buildLeaderboard,
  getMondayUtc,
  sessionXp,
} from '@/lib/community';
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
    const period = searchParams.get('period') === 'week' ? 'week' : 'alltime';

    const admin = createSupabaseAdminClient();

    const { data: profiles, error: profileError } = await admin
      .from('user_profiles')
      .select(
        'user_id, first_name, specialty, rank_title, rank_level, total_xp, current_streak'
      )
      .order('total_xp', { ascending: false })
      .limit(200);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const weeklyXpByUser = new Map<string, number>();
    const monday = getMondayUtc();

    const { data: weekSessions } = await admin
      .from('practice_sessions')
      .select('user_id, score, xp_earned, created_at')
      .gte('created_at', monday);

    for (const row of weekSessions || []) {
      const xp =
        row.xp_earned && row.xp_earned > 0
          ? row.xp_earned
          : sessionXp(row.score);
      weeklyXpByUser.set(
        row.user_id,
        (weeklyXpByUser.get(row.user_id) || 0) + xp
      );
    }

    const result = buildLeaderboard(
      profiles || [],
      weeklyXpByUser,
      period,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
