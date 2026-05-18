import { getAnthropic } from '@/lib/anthropic';
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

    const { question, answer, sessionId, specialty } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const message = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are an expert nurse interview coach evaluating a ${specialty || 'nursing'} interview answer.

Question: ${question}
Candidate's Answer: ${answer}

Provide feedback in JSON format:
{
  "score": <number 0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
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

      if (sessionId && feedback) {
        await supabase.from('session_answers').insert({
          session_id: sessionId,
          question,
          answer,
          score: feedback.score,
          feedback: JSON.stringify(feedback),
        });
      }

      return NextResponse.json(feedback);
    } catch (e) {
      console.error('Failed to parse score response:', e);
      return NextResponse.json({
        score: 75,
        feedback: 'Good answer. Keep practicing.',
        strengths: ['Structured response'],
        improvements: ['Add more clinical detail'],
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
