import { completeStage } from '@/lib/stage-progress';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { stageKey, worldKey, score, weakestQuestion } = body;

    if (!stageKey || !worldKey || score == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await completeStage(
      supabase,
      user.id,
      stageKey,
      worldKey,
      Math.round(Number(score)),
      weakestQuestion
    );

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Stage complete error:', error);
    return NextResponse.json({ error: 'Failed to complete stage' }, { status: 500 });
  }
}
