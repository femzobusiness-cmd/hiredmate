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
    const query = (searchParams.get('q') || '').trim();

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, specialty, rank_title, total_xp')
      .ilike('first_name', `%${query}%`)
      .neq('user_id', session.user.id)
      .limit(12);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, receiver_id, status')
      .or(
        `requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`
      );

    const relationMap = new Map<string, string>();
    for (const f of friendships || []) {
      const otherId =
        f.requester_id === session.user.id ? f.receiver_id : f.requester_id;
      relationMap.set(otherId, f.status);
    }

    return NextResponse.json({
      users: (users || []).map((user) => ({
        userId: user.user_id,
        name: user.first_name?.trim() || 'Nurse',
        specialty: user.specialty,
        rankTitle: user.rank_title,
        totalXp: user.total_xp,
        friendshipStatus: relationMap.get(user.user_id) || null,
      })),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
