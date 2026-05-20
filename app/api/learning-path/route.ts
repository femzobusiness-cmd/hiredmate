import { fetchLearningPath, getUserLevel } from '@/lib/stage-progress';
import { TOTAL_STAGES } from '@/lib/learning-path';
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

    const userLevel = await getUserLevel(supabase, user.id);
    const { worlds, completedCount, nextStage } = await fetchLearningPath(
      supabase,
      user.id,
      userLevel
    );

    return NextResponse.json({
      worlds,
      completedCount,
      totalStages: TOTAL_STAGES,
      nextStage,
      userLevel,
    });
  } catch (error) {
    console.error('Learning path GET error:', error);
    return NextResponse.json({ error: 'Failed to load learning path' }, { status: 500 });
  }
}
