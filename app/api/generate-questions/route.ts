import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-haiku-4-5-20251001';

type GeneratedQuestions = {
  clinical_scenarios: { question: string; tips?: string }[];
  behavioral_questions?: unknown[];
  salary_scripts?: unknown[];
  multiple_choice: {
    question: string;
    type: 'multiple_choice';
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

function normalizeQuestions(input: Partial<GeneratedQuestions> | null): GeneratedQuestions {
  const clinical = [...(input?.clinical_scenarios || [])];
  const multipleChoice = [...(input?.multiple_choice || [])];

  return {
    clinical_scenarios: [
      ...clinical,
      ...FALLBACK_CLINICAL_SCENARIOS.slice(clinical.length),
    ].slice(0, 5),
    behavioral_questions: input?.behavioral_questions || [],
    salary_scripts: input?.salary_scripts || [],
    multiple_choice: [
      ...multipleChoice,
      ...FALLBACK_MULTIPLE_CHOICE.slice(multipleChoice.length),
    ].slice(0, 5),
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

  let requestBody: unknown = {};
  try {
    requestBody = await request.json();
  } catch {
    requestBody = {};
  }
  console.log('Request body received:', JSON.stringify(requestBody, null, 2));

  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const promptContent = `You are an expert nurse interview coach. Generate personalized interview prep content for a healthcare professional with this profile:

Specialty: ${profile.specialty}
Experience: ${profile.experience_level}
Job Title: ${profile.job_title}
Hospital: ${profile.hospital_name || 'Not specified'}
Timeline: ${profile.interview_timeline}
Concerns: ${(profile.biggest_fears || []).join(', ')}
Resume excerpt: ${profile.resume_text?.slice(0, 2000) || 'Not provided'}

Return a JSON object with this exact structure:
{
  "clinical_scenarios": [{"question": "...", "tips": "..."}],
  "behavioral_questions": [],
  "salary_scripts": [],
  "multiple_choice": [
    {
      "question": "Your ICU patient post-cardiac surgery develops new onset A-fib with RVR at rate of 140. BP is 88/52. What is your PRIORITY intervention?",
      "type": "multiple_choice",
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

Generate exactly 10 questions total: 5 written clinical_scenarios and 5 multiple_choice quick fire questions. Make them specific to their specialty and experience level. Do not include fewer than 5 in either group.`;

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
      questions = normalizeQuestions(JSON.parse(jsonMatch[0]));
    } catch (parseError) {
      console.error('Failed to parse generate questions response:', parseError);
      questions = normalizeQuestions(null);
    }

    const { data: sessionRecord, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: session.user.id,
        title: `${profile.specialty} Interview Prep`,
        questions_count:
          (questions?.clinical_scenarios?.length || 0) +
          (questions?.multiple_choice?.length || 0),
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
