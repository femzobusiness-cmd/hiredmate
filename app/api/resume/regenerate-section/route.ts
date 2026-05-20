import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
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

    const { resumeId, section } = await request.json();

    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const formData = resume.resume_data as ResumeFormData;
    const current = resume.generated_content as GeneratedResumeContent;

    const prompt = `Regenerate only the "${section}" section of this nursing resume. Candidate data: ${JSON.stringify(formData)}. Current resume: ${JSON.stringify(current)}. Return ONLY valid JSON with the updated fields for that section only.`;

    const response = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    const patch = JSON.parse(stripJson(text)) as Partial<GeneratedResumeContent>;
    const generated = { ...current, ...patch };

    await supabase
      .from('resumes')
      .update({
        generated_content: generated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId);

    return NextResponse.json({ generated });
  } catch (error) {
    console.error('Regenerate section error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate section' },
      { status: 500 }
    );
  }
}
