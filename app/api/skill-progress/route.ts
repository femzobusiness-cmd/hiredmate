import { updateSkillProgress } from '@/lib/skill-progress';
import { getSkillByKey } from '@/lib/skills';
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

    const { skillKey, score, sessionId, question, answer } = await request.json();

    if (!skillKey || score == null) {
      return NextResponse.json(
        { error: 'skillKey and score are required' },
        { status: 400 }
      );
    }

    if (!getSkillByKey(skillKey)) {
      return NextResponse.json({ error: 'Invalid skill key' }, { status: 400 });
    }

    if (sessionId && question) {
      await supabase.from('session_answers').insert({
        session_id: sessionId,
        question,
        answer: answer || null,
        score: Math.round(score),
        skill_key: skillKey,
      });
    }

    const skillLevelUp = await updateSkillProgress(
      supabase,
      session.user.id,
      skillKey,
      score
    );

    return NextResponse.json({ skillLevelUp });
  } catch (error) {
    console.error('Skill progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to update skill progress' },
      { status: 500 }
    );
  }
}
