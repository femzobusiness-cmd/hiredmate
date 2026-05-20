import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import {
  FALLBACK_BATTLE_QUESTIONS,
  type BattleMode,
  type BattleQuestion,
} from '@/lib/battle';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function stripJson(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
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
    const mode = (body.mode || 'rapid-response') as BattleMode;
    const specialty = body.specialty || 'General';
    const difficulty = Number(body.difficulty) || 1;
    const count = Math.min(Number(body.count) || 20, 25);

    const modeLabel =
      mode === 'clinical-blitz'
        ? 'Clinical Blitz'
        : mode === 'prioritization-gauntlet'
          ? 'Prioritization Gauntlet'
          : 'Rapid Response';

    const prompt = `Generate ${count} rapid-fire nursing battle questions. Mode: ${modeLabel}. Specialty: ${specialty}. Difficulty: ${difficulty}/5.

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "id": "q1",
      "scenario": "Brief urgent clinical setup 1-2 sentences",
      "question": "Specific question",
      "options": ["A: option", "B: option", "C: option", "D: option"],
      "correctAnswer": "A",
      "explanation": "One sentence why correct",
      "category": "Prioritization",
      "difficulty": 1,
      "hasInterruption": false,
      "interruption": null
    }
  ]
}

Rules:
- Scenarios must be urgent and vivid — real nurse situations
- Wrong options must be plausible, not obviously wrong
- Difficulty 1-2: straightforward decisions
- Difficulty 3: competing needs prioritization
- Difficulty 4-5: complex multi-patient, ethical, rare-but-critical
- 30% of questions: hasInterruption true with realistic interruption string
- Rapid Response mode: deteriorating patient recognition and immediate actions
- Clinical Blitz: medications, labs, disease processes
- Prioritization Gauntlet: every question involves choosing between patients or tasks`;

    let questions: BattleQuestion[] = [];

    try {
      const response = await getAnthropic().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const block = response.content[0];
      if (block.type === 'text') {
        const parsed = JSON.parse(stripJson(block.text)) as {
          questions?: BattleQuestion[];
        };
        if (parsed.questions?.length) {
          questions = parsed.questions.map((q, i) => ({
            ...q,
            id: q.id || `q${i + 1}`,
            correctAnswer: String(q.correctAnswer).charAt(0).toUpperCase(),
          }));
        }
      }
    } catch (aiError) {
      console.error('Battle questions AI error:', aiError);
    }

    if (questions.length < 5) {
      questions = [
        ...FALLBACK_BATTLE_QUESTIONS,
        ...FALLBACK_BATTLE_QUESTIONS.map((q, i) => ({
          ...q,
          id: `fb-dup-${i}`,
        })),
      ].slice(0, count);
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
