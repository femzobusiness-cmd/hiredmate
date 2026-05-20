import Anthropic from '@anthropic-ai/sdk';
import { isPaidFeatureGatingEnabled } from '@/lib/access';
import { inferSkillKey, getSkillByKey, SKILL_KEYS } from '@/lib/skills';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-haiku-4-5-20251001';

type GeneratedQuestions = {
  clinical_scenarios: {
    question: string;
    tips?: string;
    skill_key?: string;
  }[];
  behavioral_questions?: unknown[];
  salary_scripts?: unknown[];
  clinical_blanks: {
    type: 'clinical_blank';
    sentence: string;
    explanation: string;
    skill_key?: string;
    blanks: Record<
      string,
      {
        correct: string;
        options: string[];
      }
    >;
  }[];
  multiple_choice: {
    question: string;
    type: 'multiple_choice';
    skill_key?: string;
    options: Record<'A' | 'B' | 'C' | 'D', string>;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }[];
};

const FALLBACK_CLINICAL_SCENARIOS: GeneratedQuestions['clinical_scenarios'] = [
  {
    question:
      'Tell me about a time you had to prioritize care for multiple patients.',
    tips: 'Use a clear prioritization framework and explain your clinical reasoning.',
  },
  {
    question:
      'How would you respond if a patient suddenly showed signs of deterioration?',
    tips: 'Mention assessment, escalation, communication, and documentation.',
  },
  {
    question:
      'Describe how you would handle a medication order that seems unsafe.',
    tips: 'Emphasize patient safety, verification, chain of command, and documentation.',
  },
  {
    question:
      'Tell me about a time you communicated with a difficult patient or family member.',
    tips: 'Use empathy, boundaries, de-escalation, and patient-centered communication.',
  },
  {
    question:
      'How do you stay organized during a busy shift with competing priorities?',
    tips: 'Discuss acuity, delegation, reassessment, and communication with the care team.',
  },
];

const FALLBACK_MULTIPLE_CHOICE: GeneratedQuestions['multiple_choice'] = [
  {
    question:
      'Your patient has new onset A-fib with RVR at 140 and BP 88/52. What is your priority intervention?',
    type: 'multiple_choice',
    options: {
      A: 'Administer IV metoprolol immediately as ordered',
      B: 'Call the physician using SBAR and prepare for synchronized cardioversion',
      C: 'Increase IV fluid rate and reassess in 15 minutes',
      D: 'Reposition patient and obtain 12-lead ECG only',
    },
    correct_answer: 'B',
    explanation:
      'The patient is unstable with hypotension. Priority is urgent escalation and preparation for synchronized cardioversion.',
  },
  {
    question:
      'A post-op patient becomes short of breath with SpO2 86%. What should you do first?',
    type: 'multiple_choice',
    options: {
      A: 'Apply oxygen and assess airway, breathing, and circulation',
      B: 'Wait five minutes and recheck the pulse oximeter',
      C: 'Give pain medication',
      D: 'Call dietary for a tray hold',
    },
    correct_answer: 'A',
    explanation:
      'Immediate assessment and oxygen support address the most urgent airway and breathing concern.',
  },
  {
    question:
      'A diabetic patient is diaphoretic, confused, and has a blood glucose of 48 mg/dL. What is the priority action?',
    type: 'multiple_choice',
    options: {
      A: 'Administer a rapid-acting carbohydrate per protocol',
      B: 'Hold all medications until rounds',
      C: 'Encourage ambulation',
      D: 'Document and reassess in one hour',
    },
    correct_answer: 'A',
    explanation:
      'Symptomatic hypoglycemia requires immediate treatment with rapid glucose replacement according to protocol.',
  },
  {
    question:
      'A patient receiving blood develops chills, fever, and back pain. What should the nurse do first?',
    type: 'multiple_choice',
    options: {
      A: 'Slow the transfusion and monitor closely',
      B: 'Stop the transfusion and maintain IV access with normal saline',
      C: 'Give acetaminophen and continue the transfusion',
      D: 'Wait for the provider to arrive before acting',
    },
    correct_answer: 'B',
    explanation:
      'Signs of a transfusion reaction require stopping the transfusion immediately while maintaining IV access with normal saline.',
  },
  {
    question:
      'A patient reports chest pain rated 8/10 with diaphoresis. What is the priority nursing action?',
    type: 'multiple_choice',
    options: {
      A: 'Obtain vital signs, apply oxygen if indicated, and activate chest pain protocol',
      B: 'Tell the patient to rest and reassess at the next hourly round',
      C: 'Offer a snack and water',
      D: 'Ambulate the patient to reduce anxiety',
    },
    correct_answer: 'A',
    explanation:
      'Chest pain with diaphoresis can indicate acute coronary syndrome and requires immediate assessment and protocol-based escalation.',
  },
];

const FALLBACK_CLINICAL_BLANKS: GeneratedQuestions['clinical_blanks'] = [
  {
    type: 'clinical_blank',
    sentence:
      'A post-op patient develops a BP of {blank1} with {blank2} and cool clammy skin. Your priority intervention is to {blank3}.',
    explanation:
      'Hypotension with tachycardia and poor perfusion requires rapid assessment, oxygen support, and escalation.',
    blanks: {
      blank1: {
        correct: '82/48',
        options: ['82/48', '128/78', '150/90', '110/70'],
      },
      blank2: {
        correct: 'tachycardia',
        options: ['tachycardia', 'bradycardia', 'normal sinus rhythm', 'hypertension'],
      },
      blank3: {
        correct: 'assess ABCs and notify the provider',
        options: [
          'assess ABCs and notify the provider',
          'document and reassess in one hour',
          'offer oral fluids only',
          'ambulate the patient',
        ],
      },
    },
  },
  {
    type: 'clinical_blank',
    sentence:
      "A patient's SpO2 drops to {blank1} despite {blank2}. You should immediately {blank3}.",
    explanation:
      'A low oxygen saturation despite low-flow oxygen requires escalating oxygen support and notifying the provider.',
    blanks: {
      blank1: {
        correct: '88%',
        options: ['88%', '95%', '100%', '72%'],
      },
      blank2: {
        correct: '2L nasal cannula',
        options: ['2L nasal cannula', 'room air', '10L non-rebreather', 'BiPAP'],
      },
      blank3: {
        correct: 'increase O2 and notify physician',
        options: [
          'increase O2 and notify physician',
          'call a code immediately',
          'reposition the patient only',
          'document and continue monitoring',
        ],
      },
    },
  },
  {
    type: 'clinical_blank',
    sentence:
      'Before giving digoxin, the nurse should check the {blank1} and hold the medication if the pulse is {blank2}.',
    explanation:
      'Digoxin can worsen bradycardia, so apical pulse assessment and provider notification are important.',
    blanks: {
      blank1: {
        correct: 'apical pulse',
        options: ['apical pulse', 'temperature', 'respiratory rate', 'pain score'],
      },
      blank2: {
        correct: 'below 60',
        options: ['below 60', 'above 100', 'exactly 80', 'above 90'],
      },
    },
  },
];

function withSkillKey<T extends { question?: string; sentence?: string; skill_key?: string }>(
  item: T,
  fallback: string
): T & { skill_key: string } {
  const text = item.question || item.sentence || '';
  const skill_key =
    item.skill_key && SKILL_KEYS.includes(item.skill_key)
      ? item.skill_key
      : inferSkillKey(text, fallback);
  return { ...item, skill_key };
}

function normalizeQuestions(
  input: Partial<GeneratedQuestions> | null,
  skillFocus?: string | null,
  stageLimits?: {
    stageType: string;
    questionsCount: number;
  }
): GeneratedQuestions {
  const clinical = [...(input?.clinical_scenarios || [])];
  const multipleChoice = [...(input?.multiple_choice || [])];
  const fallbackKey =
    skillFocus && getSkillByKey(skillFocus) ? skillFocus : 'clinical_judgment';

  let writtenCount = 5;
  let mcCount = 5;
  let blankCount = 3;

  if (stageLimits) {
    const total = stageLimits.questionsCount;
    switch (stageLimits.stageType) {
      case 'written':
        writtenCount = total;
        mcCount = 0;
        blankCount = 0;
        break;
      case 'multiple_choice':
        writtenCount = 0;
        mcCount = total;
        blankCount = 0;
        break;
      case 'clinical_blank':
        writtenCount = 0;
        mcCount = 0;
        blankCount = total;
        break;
      case 'mixed':
      default:
        writtenCount = Math.ceil(total * 0.4);
        mcCount = Math.ceil(total * 0.35);
        blankCount = Math.max(1, total - writtenCount - mcCount);
        break;
    }
  }

  return {
    clinical_scenarios:
      writtenCount > 0
        ? [
            ...clinical,
            ...FALLBACK_CLINICAL_SCENARIOS.slice(clinical.length),
          ]
            .slice(0, writtenCount)
            .map((item) => withSkillKey(item, fallbackKey))
        : [],
    behavioral_questions: input?.behavioral_questions || [],
    salary_scripts: input?.salary_scripts || [],
    clinical_blanks:
      blankCount > 0
        ? [
            ...(input?.clinical_blanks || []),
            ...FALLBACK_CLINICAL_BLANKS.slice(input?.clinical_blanks?.length || 0),
          ]
            .slice(0, blankCount)
            .map((item) => withSkillKey(item, fallbackKey))
        : [],
    multiple_choice:
      mcCount > 0
        ? [
            ...multipleChoice,
            ...FALLBACK_MULTIPLE_CHOICE.slice(multipleChoice.length),
          ]
            .slice(0, mcCount)
            .map((item) => withSkillKey(item, fallbackKey))
        : [],
  };
}

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({ apiKey });
}

export async function GET() {
  return NextResponse.json({
    status: 'route_ok',
    model: MODEL,
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
}

export async function POST(request: Request) {
  console.log('API route hit: POST /api/generate-questions');
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);

  let requestBody: {
    skillFocus?: string;
    stage_key?: string;
    world_key?: string;
    stage_title?: string;
    stage_topic?: string;
    stage_type?: string;
    world_title?: string;
    questions_count?: number;
    mode?: string;
    hospital_id?: string;
    hospital_name?: string;
    hospital_context?: string;
    specialty?: string;
  } = {};
  try {
    requestBody = await request.json();
  } catch {
    requestBody = {};
  }
  const skillFocus = requestBody.skillFocus || null;
  const stageKey = requestBody.stage_key || null;
  const hospitalMode =
    requestBody.mode === 'hospital' && !!requestBody.hospital_context;
  const voiceMode = requestBody.mode === 'voice';
  console.log('Request body received:', JSON.stringify(requestBody, null, 2));

  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (voiceMode) {
      const specialty = requestBody.specialty || 'General Nursing';
      const voicePrompt = `You are an expert nurse interview coach. Generate exactly 1 nursing interview question optimized for spoken voice practice (clear, answerable in 60-90 seconds aloud).

Specialty: ${specialty}

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "id": "vq1",
      "question": "Question text",
      "category": "Behavioral | Clinical | Situational | Values-Based",
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}

Make it realistic, specialty-specific, and suitable for practicing out loud.`;

      let voiceQuestions: {
        id: string;
        question: string;
        category: string;
        tips?: string[];
      }[] = [];

      try {
        const anthropic = getAnthropicClient();
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 2000,
          messages: [{ role: 'user', content: voicePrompt }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const cleaned = content.text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as {
              questions?: typeof voiceQuestions;
            };
            voiceQuestions = (parsed.questions || []).map((q, i) => ({
              id: q.id || `vq${i + 1}`,
              question: q.question,
              category: q.category || 'Behavioral',
              tips: q.tips,
            }));
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Voice generate error:', err.message);
      }

      if (voiceQuestions.length === 0) {
        voiceQuestions = [
          {
            id: 'vq-fallback',
            question: `Tell me about a time you demonstrated strong clinical judgment in a ${specialty} setting.`,
            category: 'Behavioral',
            tips: ['Use STAR format', 'Include a measurable outcome'],
          },
        ];
      }

      return NextResponse.json({ questions: voiceQuestions });
    }

    if (hospitalMode) {
      const hospitalName = requestBody.hospital_name || 'Hospital';
      const hospitalId = requestBody.hospital_id || null;
      const questionsCount = requestBody.questions_count || 5;
      const hospitalContext = requestBody.hospital_context!;

      const hospitalPrompt = `${hospitalContext}

Generate exactly ${questionsCount} nursing interview questions tailored to ${hospitalName}.
Return ONLY valid JSON, no markdown:
{
"questions": [
{
"id": "q1",
"question": "Question text",
"category": "Behavioral | Clinical | Situational | Values-Based",
"tips": ["Tip 1", "Tip 2", "Tip 3"]
}
]
}
Requirements: reflect hospital's specific culture and values, mix of behavioral/situational/values-based, at least one question about known specialties or culture, realistic difficulty, distinct questions covering different competencies.`;

      let hospitalQuestions: {
        id: string;
        question: string;
        category: string;
        tips: string[];
      }[] = [];

      try {
        const anthropic = getAnthropicClient();
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 2000,
          messages: [{ role: 'user', content: hospitalPrompt }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const cleaned = content.text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as {
              questions?: typeof hospitalQuestions;
            };
            hospitalQuestions = (parsed.questions || []).map((q, i) => ({
              id: q.id || `q${i + 1}`,
              question: q.question,
              category: q.category || 'Behavioral',
              tips: Array.isArray(q.tips) ? q.tips : [],
            }));
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Hospital generate error:', err.message);
      }

      if (hospitalQuestions.length === 0) {
        return NextResponse.json(
          { error: 'Failed to generate hospital questions' },
          { status: 500 }
        );
      }

      const sessionInsert: {
        user_id: string;
        title: string;
        questions_count: number;
        hospital_id?: string;
      } = {
        user_id: session.user.id,
        title: `${hospitalName} Hospital Prep`,
        questions_count: hospitalQuestions.length,
      };
      if (hospitalId) {
        sessionInsert.hospital_id = hospitalId;
      }

      const { data: sessionRecord } = await supabase
        .from('practice_sessions')
        .insert(sessionInsert)
        .select()
        .single();

      return NextResponse.json({
        sessionId: sessionRecord?.id,
        questions: hospitalQuestions,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            'Please complete your profile setup in Settings before starting a practice session',
        },
        { status: 404 }
      );
    }

    const plan = profile.plan || 'free';
    if (
      isPaidFeatureGatingEnabled() &&
      plan === 'free' &&
      !stageKey &&
      !hospitalMode &&
      !voiceMode
    ) {
      const { count, error: countError } = await supabase
        .from('practice_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if ((count || 0) >= 3) {
        return NextResponse.json(
          { error: 'upgrade_required' },
          { status: 403 }
        );
      }
    }

    const focusSkill = skillFocus ? getSkillByKey(skillFocus) : null;
    const skillFocusLine = focusSkill
      ? `Focus heavily on the "${focusSkill.name}" skill (${focusSkill.key}). At least 80% of questions should test this competency.`
      : '';

    const stageCount = requestBody.questions_count || 5;
    const stageType = requestBody.stage_type || 'mixed';
    const stageContextBlock = stageKey
      ? `
STAGE CONTEXT (critical — follow exactly):
This content is for the "${requestBody.stage_title || 'Interview Stage'}" stage in the "${requestBody.world_title || 'Learning World'}" world.
Focus specifically on: ${requestBody.stage_topic || requestBody.stage_title || 'nursing interview skills'}
Question type for this stage: ${stageType}
Generate exactly ${stageCount} total questions appropriate for this stage type.
${stageType === 'written' ? 'Use ONLY clinical_scenarios (written answers).' : ''}
${stageType === 'multiple_choice' ? 'Use ONLY multiple_choice questions.' : ''}
${stageType === 'clinical_blank' ? 'Use ONLY clinical_blanks questions.' : ''}
${stageType === 'mixed' ? 'Mix written clinical_scenarios, multiple_choice, and clinical_blanks.' : ''}
`
      : '';

    const defaultCounts =
      stageKey
        ? ''
        : `Generate exactly 13 questions total: 5 written clinical_scenarios, 5 multiple_choice quick fire questions, and 3 clinical_blanks. Make them specific to their specialty and experience level. Do not include fewer than 5 in clinical_scenarios or multiple_choice, and do not include fewer than 3 clinical_blanks.`;

    const promptContent = `You are an expert nurse interview coach. Generate personalized interview prep content for a healthcare professional with this profile:

Specialty: ${profile.specialty}
Experience: ${profile.experience_level}
Job Title: ${profile.job_title}
Hospital: ${profile.hospital_name || 'Not specified'}
Timeline: ${profile.interview_timeline}
Concerns: ${(profile.biggest_fears || []).join(', ')}
Resume excerpt: ${profile.resume_text?.slice(0, 2000) || 'Not provided'}
${skillFocusLine}
${stageContextBlock}

Return a JSON object with this exact structure:
{
  "clinical_scenarios": [{"question": "...", "tips": "...", "skill_key": "clinical_judgment"}],
  "behavioral_questions": [],
  "salary_scripts": [],
  "clinical_blanks": [
    {
      "type": "clinical_blank",
      "sentence": "A patient's SpO2 drops to {blank1} despite {blank2}. You should immediately {blank3}.",
      "explanation": "Explain why the correct choices are clinically appropriate.",
      "skill_key": "emergency_response",
      "blanks": {
        "blank1": { "correct": "88%", "options": ["88%", "95%", "100%", "72%"] },
        "blank2": { "correct": "2L nasal cannula", "options": ["2L nasal cannula", "room air", "10L non-rebreather", "BiPAP"] },
        "blank3": { "correct": "increase O2 and notify physician", "options": ["increase O2 and notify physician", "call a code immediately", "reposition the patient only", "document and continue monitoring"] }
      }
    }
  ],
  "multiple_choice": [
    {
      "question": "Your ICU patient post-cardiac surgery develops new onset A-fib with RVR at rate of 140. BP is 88/52. What is your PRIORITY intervention?",
      "type": "multiple_choice",
      "skill_key": "patient_prioritization",
      "options": {
        "A": "Administer IV metoprolol immediately as ordered",
        "B": "Call the physician using SBAR and prepare for synchronized cardioversion",
        "C": "Increase IV fluid rate and reassess in 15 minutes",
        "D": "Reposition patient and obtain 12-lead ECG only"
      },
      "correct_answer": "B",
      "explanation": "This patient is hemodynamically unstable with A-fib and hypotension. Rate control with metoprolol is contraindicated in unstable patients. Priority is physician notification and preparation for synchronized cardioversion per ACLS protocol."
    }
  ]
}

For each question also include a skill_key field indicating which clinical skill this question tests.
Choose from: clinical_judgment, patient_prioritization, medication_safety, emergency_response, communication, documentation, team_collaboration, patient_education, critical_thinking, icu_confidence.

${defaultCounts}`;

    let response;
    try {
      const anthropic = getAnthropicClient();
      console.log('Calling Anthropic API, model:', MODEL);

      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: promptContent,
          },
        ],
      });

      console.log('Anthropic API succeeded');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Anthropic error:', err.message);
      console.error('Error type:', err.constructor?.name);
      try {
        console.error('Full error:', JSON.stringify(error, null, 2));
      } catch {
        console.error('Full error (non-serializable):', error);
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response format from Anthropic' },
        { status: 500 }
      );
    }

    let questions: GeneratedQuestions | null = null;

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      questions = normalizeQuestions(
        JSON.parse(jsonMatch[0]),
        skillFocus,
        stageKey
          ? { stageType, questionsCount: stageCount }
          : undefined
      );
    } catch (parseError) {
      console.error('Failed to parse generate questions response:', parseError);
      questions = normalizeQuestions(
        null,
        skillFocus,
        stageKey ? { stageType, questionsCount: stageCount } : undefined
      );
    }

    const sessionTitle = stageKey
      ? `${requestBody.world_title || 'Learn'} · ${requestBody.stage_title || 'Stage'}`
      : focusSkill
        ? `${profile.specialty} · ${focusSkill.name} Focus`
        : `${profile.specialty} Interview Prep`;

    const { data: sessionRecord, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: session.user.id,
        title: sessionTitle,
        questions_count:
          (questions?.clinical_scenarios?.length || 0) +
          (questions?.multiple_choice?.length || 0) +
          (questions?.clinical_blanks?.length || 0),
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: sessionRecord?.id,
      questions,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Generate questions error:', err.message);
    console.error('Stack:', err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
