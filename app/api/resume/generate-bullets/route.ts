import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
    const { jobTitle, employer, specialty, unit } = body;

    if (!jobTitle || !employer) {
      return NextResponse.json(
        { error: 'jobTitle and employer required' },
        { status: 400 }
      );
    }

    const prompt = `Generate 5 strong ATS-optimized resume bullet points for a ${specialty || 'General'} nurse who worked as ${jobTitle} at ${employer} on the ${unit || 'clinical'} unit. Each bullet must start with a strong action verb and be specific to ${specialty || 'General'} nursing. Return ONLY a JSON array of 5 strings.`;

    let bullets: string[] = [
      `Assessed and monitored patients on the ${unit || 'assigned'} unit to identify changes in condition and escalate care promptly.`,
      `Collaborated with physicians, respiratory therapy, and ancillary staff to deliver safe, evidence-based interventions.`,
      `Documented assessments, care plans, and patient education in the EMR per facility standards.`,
      `Prioritized competing patient needs during high-acuity shifts while maintaining infection prevention practices.`,
      `Educated patients and families on discharge instructions, medications, and follow-up care.`,
    ];

    try {
      const response = await getAnthropic().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const text =
        response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(stripJson(text));
      if (Array.isArray(parsed)) bullets = parsed.slice(0, 5);
    } catch (e) {
      console.error('Generate bullets AI error:', e);
    }

    return NextResponse.json({ bullets });
  } catch (error) {
    console.error('Generate bullets error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bullets' },
      { status: 500 }
    );
  }
}
