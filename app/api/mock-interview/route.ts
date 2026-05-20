import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import {
  buildInterviewSystemPrompt,
  parseInterviewComplete,
  type PersonalityMode,
} from '@/lib/mock-interview';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

type RequestMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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
    const messages: RequestMessage[] = body.messages || [];
    const personality = (body.personality || 'neutral') as PersonalityMode;
    const specialty = body.specialty || 'General Nursing';
    const hospitalId = body.hospital_id || body.hospitalId || null;
    const maxQuestions = Number(body.maxQuestions) || 5;
    const currentQuestionCount =
      Number(body.currentQuestionCount) ||
      messages.filter((m) => m.role === 'assistant').length + 1;

    const systemPrompt = buildInterviewSystemPrompt({
      personality,
      specialty,
      hospitalId,
      maxQuestions,
      currentQuestionCount: Math.min(currentQuestionCount, maxQuestions),
    });

    const anthropicMessages =
      messages.length === 0
        ? [
            {
              role: 'user' as const,
              content:
                'Begin the interview now. Introduce yourself briefly and ask your first question.',
            },
          ]
        : messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

    const response = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response format' },
        { status: 500 }
      );
    }

    const { message, interviewComplete } = parseInterviewComplete(content.text);

    return NextResponse.json({ message, interviewComplete });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Mock interview error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
