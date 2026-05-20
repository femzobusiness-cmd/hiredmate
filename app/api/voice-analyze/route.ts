import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import {
  calculateSpeechMetrics,
  detectFillerWords,
} from '@/lib/voice-analysis';
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

    const { transcript, question, durationSeconds, specialty } =
      await request.json();

    if (!transcript || !question) {
      return NextResponse.json(
        { error: 'transcript and question are required' },
        { status: 400 }
      );
    }

    const duration = Math.max(Number(durationSeconds) || 1, 1);
    const { fillerWordCount, fillerWordsFound } = detectFillerWords(transcript);
    const { wordCount, wordsPerMinute, paceRating } = calculateSpeechMetrics(
      transcript,
      duration
    );

    const prompt = `You are an expert nursing interview coach analyzing a spoken interview answer.

The nurse was asked: ${question}
Their transcribed answer: ${transcript}
Duration: ${duration} seconds | Word count: ${wordCount} | WPM: ${wordsPerMinute}
Filler words found: ${JSON.stringify(fillerWordsFound)}
Specialty: ${specialty || 'General Nursing'}

Analyze this answer and return ONLY valid JSON (no markdown):
{
  "overallScore": 0-100,
  "confidenceScore": 0-100,
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "clinicalAccuracyNote": "One sentence about clinical accuracy of their content",
  "paceFeedback": "One sentence coaching tip about their speaking pace",
  "fillerFeedback": "One sentence about filler word usage — skip if count is 0-1"
}

Scoring guide:
- 90-100: Excellent STAR structure, specific examples, confident delivery, clinically accurate
- 75-89: Good answer with minor gaps
- 60-74: Acceptable but vague or missing key elements
- Below 60: Significant issues with structure, specificity, or clinical content

Be honest. Reference specific things from their transcript.`;

    let aiResult = {
      overallScore: 70,
      confidenceScore: 70,
      strengths: ['Clear effort to answer the question'],
      improvements: ['Add more specific clinical examples'],
      clinicalAccuracyNote: 'Review key clinical details for your specialty.',
      paceFeedback: 'Practice pacing your delivery for clarity.',
      fillerFeedback:
        fillerWordCount > 1
          ? 'Reduce filler words to sound more confident.'
          : undefined,
    };

    try {
      const response = await getAnthropic().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const cleaned = content.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = { ...aiResult, ...JSON.parse(jsonMatch[0]) };
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Voice analyze AI error:', err.message);
    }

    if (fillerWordCount <= 1) {
      delete aiResult.fillerFeedback;
    }

    return NextResponse.json({
      ...aiResult,
      fillerWordCount,
      fillerWordsFound,
      wordCount,
      wordsPerMinute,
      paceRating,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Voice analyze error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
