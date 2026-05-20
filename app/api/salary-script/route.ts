import { getAnthropic } from '@/lib/anthropic';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-haiku-4-5-20251001';

type SalaryScript = {
  opening_statement: string;
  counter_offer: string;
  handling_pushback: string;
  walk_away_number: string;
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

    const {
      jobTitle,
      hospital,
      location,
      experienceLevel,
      currentSalary,
      targetSalary,
      specialty,
    } = await request.json();

    if (!jobTitle || !location || !experienceLevel || !targetSalary || !specialty) {
      return NextResponse.json(
        {
          error:
            'Job title, location, experience level, target salary, and specialty are required.',
        },
        { status: 400 }
      );
    }

    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert salary negotiation coach for nurses and healthcare professionals.

Create a specific, realistic salary negotiation script using this profile:

Job title: ${jobTitle}
Hospital / employer: ${hospital || 'Not specified'}
Location: ${location}
Experience level: ${experienceLevel}
Specialty: ${specialty}
Current salary or offer: ${currentSalary || 'Not specified'}
Target salary: ${targetSalary}

Return ONLY valid JSON with this exact shape:
{
  "opening_statement": "...",
  "counter_offer": "...",
  "handling_pushback": "...",
  "walk_away_number": "..."
}

Each section should be 3-5 sentences of specific, realistic dialogue the nurse can say word for word. Make it human, confident, calm, and professional. Do not sound robotic or generic.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected Anthropic response format');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Anthropic response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as SalaryScript;

    await supabase.from('achievements').insert({
      user_id: session.user.id,
      achievement_key: 'salary_prep',
    });

    return NextResponse.json({
      opening_statement: parsed.opening_statement,
      counter_offer: parsed.counter_offer,
      handling_pushback: parsed.handling_pushback,
      walk_away_number: parsed.walk_away_number,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Salary script error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
