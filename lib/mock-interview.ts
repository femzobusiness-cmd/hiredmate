import { getHospitalById } from '@/lib/hospitals-data';

export type PersonalityMode = 'friendly' | 'neutral' | 'tough';

export type MockMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

export type MockInterviewDebrief = {
  overallScore: number;
  overallGrade: string;
  summary: string;
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string }[];
  questionBreakdown: {
    question: string;
    answerSummary: string;
    score: number;
    feedback: string;
  }[];
  bestAnswer: { question: string; why: string };
  weakestAnswer: { question: string; why: string };
  topRecommendations: string[];
};

export const PERSONALITY_MODES: {
  id: PersonalityMode;
  emoji: string;
  name: string;
  description: string;
  color: string;
  interviewerName: string;
  avatarEmoji: string;
}[] = [
  {
    id: 'friendly',
    emoji: '😊',
    name: 'Friendly',
    description: 'Warm and encouraging. Good for building confidence.',
    color: '#00C6B2',
    interviewerName: 'Dr. Sarah Chen',
    avatarEmoji: '😊',
  },
  {
    id: 'neutral',
    emoji: '🧑‍💼',
    name: 'Neutral',
    description: 'Professional and balanced. Closest to a real interview.',
    color: '#7C5CBF',
    interviewerName: 'Mr. James Mitchell',
    avatarEmoji: '🧑‍💼',
  },
  {
    id: 'tough',
    emoji: '😤',
    name: 'Tough',
    description: 'Challenging and skeptical. Will push back hard on weak answers.',
    color: '#EF4444',
    interviewerName: 'Director Karen Walsh',
    avatarEmoji: '😤',
  },
];

export const INTERVIEW_SPECIALTIES = [
  'General Nursing',
  'ICU / Critical Care',
  'Emergency',
  'Med-Surg',
  'Labor & Delivery',
  'Oncology',
  'Pediatrics',
  'OR / Surgical',
  'Psych / Behavioral Health',
  'Travel Nursing',
] as const;

export const INTERVIEW_HOSPITAL_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Mayo Clinic', value: 'mayo-clinic' },
  { label: 'Cleveland Clinic', value: 'cleveland-clinic' },
  { label: 'Northwestern Medicine', value: 'northwestern' },
  { label: 'HCA Healthcare', value: 'hca' },
  { label: 'Kaiser Permanente', value: 'kaiser' },
] as const;

export const QUESTION_COUNT_OPTIONS = [3, 5, 10] as const;

const PERSONALITY_PROMPTS: Record<PersonalityMode, string> = {
  friendly: `"Your personality: Warm, encouraging, and supportive. You smile often. When someone gives a weak answer, you gently probe with 'Can you tell me a bit more about that?' or 'What was the outcome of that situation?'. You occasionally compliment good answers briefly. You create a comfortable environment."`,
  neutral: `"Your personality: Professional, balanced, and objective. You show no strong emotion. You probe weak answers with 'Could you be more specific?' or 'Can you give me a concrete example?'. You don't give compliments but you're not harsh. Standard professional tone throughout."`,
  tough: `"Your personality: Challenging, skeptical, and demanding. You push back on every answer — even good ones — with harder follow-ups. Examples: 'That's fine, but what would you have done differently?' or 'I've heard that before. Give me a situation where that actually worked.' or 'That sounds textbook. Tell me what REALLY happened.' You maintain a serious, no-nonsense demeanor. You have high standards and show it."`,
};

const INTERVIEWER_NAMES: Record<PersonalityMode, string> = {
  friendly: 'Dr. Sarah Chen',
  neutral: 'Mr. James Mitchell',
  tough: 'Director Karen Walsh',
};

export function getPersonalityConfig(mode: PersonalityMode) {
  return PERSONALITY_MODES.find((p) => p.id === mode) || PERSONALITY_MODES[1];
}

export function buildInterviewSystemPrompt(options: {
  personality: PersonalityMode;
  specialty: string;
  hospitalId?: string | null;
  maxQuestions: number;
  currentQuestionCount: number;
}): string {
  const { personality, specialty, hospitalId, maxQuestions, currentQuestionCount } =
    options;
  const interviewerName = INTERVIEWER_NAMES[personality];
  const hospital = hospitalId ? getHospitalById(hospitalId) : null;
  const hospitalPhrase = hospital
    ? ` at ${hospital.name}`
    : '';

  let prompt = `You are a nursing hiring manager conducting a real job interview. Your name is ${interviewerName}. You are interviewing a nurse candidate for a ${specialty} nursing position${hospitalPhrase}.

Your job:
1. Ask one interview question at a time
2. Listen to their answer carefully
3. Either ask a relevant follow-up if the answer was weak/vague, OR acknowledge and move to the next question
4. Keep track — you need to ask exactly ${maxQuestions} main questions total
5. After the final question is answered, say a professional closing and include the exact text: [INTERVIEW_COMPLETE] at the end of your message

Current question number: ${currentQuestionCount} of ${maxQuestions}

Rules:
- Ask only ONE question at a time
- Keep your responses concise (2-4 sentences max before the question)
- Do not give coaching or hints — you are an interviewer, not a coach
- Stay in character the entire time
- If they ask to repeat a question, repeat it
- Focus on nursing-specific competencies: clinical judgment, teamwork, patient advocacy, communication, prioritization

${PERSONALITY_PROMPTS[personality]}`;

  if (hospital?.promptContext) {
    prompt += `\n\nHospital context for this interview:\n${hospital.promptContext}`;
  }

  return prompt;
}

export function parseInterviewComplete(text: string): {
  message: string;
  interviewComplete: boolean;
} {
  const interviewComplete = text.includes('[INTERVIEW_COMPLETE]');
  const message = text.replace(/\[INTERVIEW_COMPLETE\]/g, '').trim();
  return { message, interviewComplete };
}

export function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return '#00C6B2';
    case 'B':
      return '#7C5CBF';
    case 'C':
      return '#F59E0B';
    default:
      return '#EF4444';
  }
}

export function scoreBadgeColor(score: number): string {
  if (score >= 80) return '#00C6B2';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
