import {
  fetchQuestsWithProgress,
  getIncompleteQuestCount,
  trackQuestEvents,
} from '@/lib/quest-tracking';
import type { QuestEvent } from '@/lib/quests';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quests = await fetchQuestsWithProgress(supabase, user.id);
    const incompleteCount = await getIncompleteQuestCount(supabase, user.id);

    return NextResponse.json({ ...quests, incompleteCount });
  } catch (error) {
    console.error('Quests GET error:', error);
    return NextResponse.json({ error: 'Failed to load quests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = (await request.json()) as QuestEvent;
    const { completedQuests } = await trackQuestEvents(supabase, user.id, event);

    const incompleteCount = await getIncompleteQuestCount(supabase, user.id);

    return NextResponse.json({ completedQuests, incompleteCount });
  } catch (error) {
    console.error('Quests POST error:', error);
    return NextResponse.json({ error: 'Failed to update quests' }, { status: 500 });
  }
}
