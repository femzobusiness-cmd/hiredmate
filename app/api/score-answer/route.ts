import { getAnthropic } from '@/lib/anthropic';
import { trackQuestEvents } from '@/lib/quest-tracking';
import { updateSkillProgress } from '@/lib/skill-progress';
import { inferSkillKey } from '@/lib/skills';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

const MODEL = 'claude-haiku-4-5-20251001';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      question,
      answer,
      sessionId,
      specialty,
      skillKey,
      mode,
      hospital_name,
      hospital_context,
    } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const hospitalPrefix =
      mode === 'hospital' && hospital_context
        ? `You are evaluating a nurse's interview answer for a position at ${hospital_name || 'this hospital'}. ${hospital_context}. Score on: alignment with hospital values, STAR structure, specificity, and clinical competence.\n\n`
        : '';

    const message = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `${hospitalPrefix}You are an expert nurse interview coach evaluating a ${specialty || 'nursing'} interview answer.

Question: ${question}
Candidate's Answer: ${answer}

Provide feedback in JSON format:
{
  "score": <number 0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
  "feedback": "2-3 sentence overall summary",
  "sample_answer": "A stronger version of their answer in 2-3 sentences"
}

Be encouraging but honest. Score based on clinical accuracy, STAR method usage for behavioral questions, and professionalism.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const feedback = JSON.parse(jsonMatch[0]);

      const resolvedSkillKey =
        skillKey || inferSkillKey(`${question} ${answer || ''}`);

      if (sessionId && feedback) {
        await supabase.from('session_answers').insert({
          session_id: sessionId,
          question,
          answer,
          score: feedback.score,
          feedback: JSON.stringify(feedback),
          skill_key: resolvedSkillKey,
        });
      }

      const skillLevelUp = await updateSkillProgress(
        supabase,
        session.user.id,
        resolvedSkillKey,
        feedback.score
      );

      const { completedQuests } = await trackQuestEvents(supabase, session.user.id, {
        questionsAnswered: 1,
        score: feedback.score,
        perfectScore: feedback.score === 100,
        mode: 'written',
        skillXpEarned: skillLevelUp?.xpEarned || 0,
      });

      return NextResponse.json({ ...feedback, skillLevelUp, completedQuests });
    } catch (e) {
      console.error('Failed to parse score response:', e);
      return NextResponse.json({
        score: 75,
        feedback: 'Good answer. Keep practicing.',
        strengths: ['Structured response'],
        improvements: ['Add more clinical detail'],
        sample_answer: '',
        model_answer: '',
      });
    }
  } catch (error) {
    console.error('Score answer error:', error);
    return NextResponse.json(
      { error: 'Failed to score answer' },
      { status: 500 }
    );
  }
}
