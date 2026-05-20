import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import type { MockInterviewDebrief } from '@/lib/mock-interview';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
    const { conversation, personality, specialty, hospital_id, interviewId } = body;

    if (!conversation || !interviewId) {
      return NextResponse.json(
        { error: 'conversation and interviewId are required' },
        { status: 400 }
      );
    }

    const conversationText = (conversation as { role: string; content: string }[])
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const prompt = `You are an expert nursing interview coach. Analyze this complete mock interview conversation and provide a detailed debrief.

Personality mode: ${personality || 'neutral'}
Specialty: ${specialty || 'General Nursing'}
${hospital_id ? `Hospital context id: ${hospital_id}` : ''}

Conversation:
${conversationText}

Return ONLY valid JSON (no markdown):
{
  "overallScore": 0-100,
  "overallGrade": "A | B | C | D",
  "summary": "2-3 sentence overall assessment",
  "strengths": [
    { "title": "Strength title", "description": "Specific explanation with reference to what they said" }
  ],
  "improvements": [
    { "title": "Area to improve", "description": "Specific actionable feedback" }
  ],
  "questionBreakdown": [
    {
      "question": "The question that was asked",
      "answerSummary": "Brief summary of their answer",
      "score": 0-100,
      "feedback": "Specific feedback on this answer"
    }
  ],
  "bestAnswer": { "question": "...", "why": "Why this was their strongest answer" },
  "weakestAnswer": { "question": "...", "why": "Why this was their weakest answer" },
  "topRecommendations": ["Specific actionable recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Be honest and specific. Reference actual things they said. Scores should reflect real performance — don't inflate.`;

    const response = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response format' },
        { status: 500 }
      );
    }

    const cleaned = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse debrief' },
        { status: 500 }
      );
    }

    const debrief = JSON.parse(jsonMatch[0]) as MockInterviewDebrief;

    const { error: updateError } = await supabase
      .from('mock_interviews')
      .update({
        debrief,
        overall_score: debrief.overallScore,
      })
      .eq('id', interviewId)
      .eq('user_id', session.user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(debrief);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Mock interview debrief error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
