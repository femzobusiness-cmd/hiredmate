import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

type FriendProfile = {
  userId: string;
  name: string;
  specialty: string | null;
  rankTitle: string;
  totalXp: number;
  currentStreak: number;
};

async function loadProfiles(
  supabase: ReturnType<typeof createSupabaseRouteClient>,
  userIds: string[]
): Promise<Map<string, FriendProfile>> {
  if (!userIds.length) return new Map();

  const { data } = await supabase
    .from('user_profiles')
    .select('user_id, first_name, specialty, rank_title, total_xp, current_streak')
    .in('user_id', userIds);

  const map = new Map<string, FriendProfile>();
  for (const row of data || []) {
    map.set(row.user_id, {
      userId: row.user_id,
      name: row.first_name?.trim() || 'Nurse',
      specialty: row.specialty,
      rankTitle: row.rank_title || 'Student Nurse',
      totalXp: row.total_xp || 0,
      currentStreak: row.current_streak || 0,
    });
  }
  return map;
}

export async function GET() {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from('friendships')
      .select('id, requester_id, receiver_id, status, created_at')
      .or(
        `requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const accepted = (rows || []).filter((r) => r.status === 'accepted');
    const incoming = (rows || []).filter(
      (r) => r.status === 'pending' && r.receiver_id === session.user.id
    );

    const friendIds = accepted.map((r) =>
      r.requester_id === session.user.id ? r.receiver_id : r.requester_id
    );
    const incomingIds = incoming.map((r) => r.requester_id);
    const profileMap = await loadProfiles(
      supabase,
      [...friendIds, ...incomingIds]
    );

    return NextResponse.json({
      friends: accepted
        .map((r) => {
          const friendId =
            r.requester_id === session.user.id ? r.receiver_id : r.requester_id;
          const profile = profileMap.get(friendId);
          if (!profile) return null;
          return { friendshipId: r.id, ...profile };
        })
        .filter(Boolean),
      incoming: incoming
        .map((r) => {
          const profile = profileMap.get(r.requester_id);
          if (!profile) return null;
          return { friendshipId: r.id, ...profile };
        })
        .filter(Boolean),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const action = body.action as string;

    if (action === 'send') {
      const receiverId = body.receiverId as string;
      if (!receiverId || receiverId === session.user.id) {
        return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
      }

      const { error } = await supabase.from('friendships').insert({
        requester_id: session.user.id,
        receiver_id: receiverId,
        status: 'pending',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true, status: 'pending' });
    }

    if (action === 'accept' || action === 'decline') {
      const friendshipId = body.friendshipId as string;
      const status = action === 'accept' ? 'accepted' : 'declined';

      const { error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId)
        .eq('receiver_id', session.user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true, status });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
