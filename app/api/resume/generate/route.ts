import { getAnthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
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

function fallbackGenerated(formData: ResumeFormData): GeneratedResumeContent {
  const { personal, workExperience, education, certifications, clinicalSkills } =
    formData;

  return {
    professionalSummary:
      personal.summaryPreference === 'own' && personal.ownSummary
        ? personal.ownSummary
        : `${personal.yearsExperience} ${personal.specialty} nurse seeking ${personal.targetRole || 'clinical'} roles. Skilled in patient assessment, interdisciplinary collaboration, and evidence-based care. Committed to safe, compassionate nursing practice.`,
    workExperience: workExperience.map((w) => ({
      jobTitle: w.jobTitle,
      employer: w.employer,
      location: w.location,
      startDate: w.startDate,
      endDate: w.isPresent ? 'Present' : w.endDate,
      unit: w.unit,
      bullets: w.bullets.filter(Boolean).length
        ? w.bullets.filter(Boolean)
        : [
            `Provided safe, patient-centered care on the ${w.unit || personal.specialty} unit.`,
          ],
    })),
    education: education
      .filter((e) => e.schoolName)
      .map((e) => ({
        degree: e.degree,
        schoolName: e.schoolName,
        graduationYear: e.graduationYear,
        gpa: e.gpa || undefined,
        honors: e.honors || undefined,
      })),
    certifications,
    clinicalSkills,
    softSkills: formData.softSkills,
    atsKeywords: [
      personal.specialty,
      'patient care',
      'clinical documentation',
      'interdisciplinary collaboration',
    ],
    atsScore: 72,
    atsTips: [
      'Add unit-specific metrics where possible (patient ratios, throughput).',
      'Include EMR systems you have used in your skills section.',
    ],
  };
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
    const formData = body.formData as ResumeFormData;
    const resumeId = body.resumeId as string | undefined;

    if (!formData?.personal?.fullName) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const prompt = `You are an expert nursing resume writer who specializes in ATS-optimized resumes. Generate a complete, professional nursing resume based on the following information.

Candidate data: ${JSON.stringify(formData)}

Return ONLY valid JSON (no markdown):
{
  "professionalSummary": "3-4 sentence ATS-optimized professional summary",
  "workExperience": [
    {
      "jobTitle": "...",
      "employer": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "unit": "...",
      "bullets": [
        "Strong action verb + specific clinical task + measurable outcome or context",
        "..."
      ]
    }
  ],
  "education": [
    {
      "degree": "...",
      "schoolName": "...",
      "graduationYear": "...",
      "gpa": "...",
      "honors": "..."
    }
  ],
  "certifications": ["..."],
  "clinicalSkills": ["..."],
  "softSkills": ["..."],
  "atsKeywords": ["keyword1", "keyword2"],
  "atsScore": 85,
  "atsTips": ["Add X to improve ATS score", "Consider adding Y"]
}

Rules:
- Every bullet must start with a strong clinical action verb (Administered, Monitored, Collaborated, Implemented, Assessed, Coordinated, Educated, Managed, Documented, Prioritized)
- Bullets must be specific to the candidate's specialty and unit
- Professional summary must include: years of experience, specialty, 2-3 key competencies, and type of position sought
- Inject ATS keywords naturally throughout: specialty-specific terms, certifications mentioned, EMR systems, common job posting terms for their specialty
- For travel nursing target: include 'adaptable', 'rapid onboarding', 'multi-facility experience'
- For leadership target: include 'charge nurse', 'mentorship', 'quality improvement', 'shared governance'
- ATS score should reflect how well the resume matches common job postings for their specialty (80+ = well optimized)`;

    let generated: GeneratedResumeContent = fallbackGenerated(formData);

    try {
      const response = await getAnthropic().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const text =
        response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(stripJson(text)) as GeneratedResumeContent;
      generated = { ...generated, ...parsed };
    } catch (e) {
      console.error('Resume generate AI error:', e);
    }

    if (
      formData.personal.summaryPreference === 'own' &&
      formData.personal.ownSummary.trim()
    ) {
      generated.professionalSummary = formData.personal.ownSummary.trim();
    }

    generated.education =
      generated.education ||
      formData.education
        .filter((e) => e.schoolName)
        .map((e) => ({
          degree: e.degree,
          schoolName: e.schoolName,
          graduationYear: e.graduationYear,
          gpa: e.gpa || undefined,
          honors: e.honors || undefined,
        }));

    generated.certifications =
      generated.certifications || [
        ...formData.certifications,
        ...(formData.otherCertifications
          ? formData.otherCertifications.split(',').map((s) => s.trim())
          : []),
      ].filter(Boolean);

    generated.clinicalSkills =
      generated.clinicalSkills || formData.clinicalSkills;
    generated.softSkills = generated.softSkills || formData.softSkills;

    const title =
      formData.personal.targetRole ||
      `${formData.personal.specialty} Nursing Resume`;

    const row = {
      title,
      specialty: formData.personal.specialty,
      target_role: formData.personal.targetRole,
      resume_data: formData,
      generated_content: generated,
      updated_at: new Date().toISOString(),
    };

    if (resumeId) {
      const { data, error } = await supabase
        .from('resumes')
        .update(row)
        .eq('id', resumeId)
        .eq('user_id', session.user.id)
        .select('id')
        .single();

      if (error) throw error;
      return NextResponse.json({
        resumeId: data.id,
        generated,
      });
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({ ...row, user_id: session.user.id })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({
      resumeId: data.id,
      generated,
    });
  } catch (error) {
    console.error('Resume generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
