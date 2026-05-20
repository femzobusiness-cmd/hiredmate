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

export const MIN_TOPICS_OPTIONS = [3, 5, 8] as const;

/** @deprecated Use MIN_TOPICS_OPTIONS */
export const QUESTION_COUNT_OPTIONS = MIN_TOPICS_OPTIONS;

export type InterviewTurnType = 'opening' | 'follow_up' | 'new_topic' | 'closing';

const INTERVIEWER_NAMES: Record<PersonalityMode, string> = {
  friendly: 'Dr. Sarah Chen',
  neutral: 'Mr. James Mitchell',
  tough: 'Director Karen Walsh',
};

export function getPersonalityConfig(mode: PersonalityMode) {
  return PERSONALITY_MODES.find((p) => p.id === mode) || PERSONALITY_MODES[1];
}

const PERSONALITY_FOLLOWUP_RULES: Record<PersonalityMode, string> = {
  friendly: `Your personality: Warm and encouraging (Dr. Sarah Chen). When answers are weak, probe gently: "Can you walk me through a specific example?" or "Tell me more about what happened there." Maximum 1 follow-up per topic before moving on. When strong answers occur, say something brief like "That's a great example." End with warmth regardless of performance.`,
  neutral: `Your personality: Professional and objective (Mr. James Mitchell). When answers are weak, probe directly: "Can you be more specific?" or "Give me a concrete example from your experience." Up to 2 follow-ups per weak topic. Show no strong emotion. End professionally.`,
  tough: `Your personality: Demanding and skeptical (Director Karen Walsh). Push back on EVERY answer — even strong ones get harder follow-ups. When weak: "That's not specific enough. Give me an actual situation." or "I've heard that before. Tell me what really happened." Up to 3 follow-ups per weak topic. Even good answers get: "Okay, but what would you have done differently?" Only end when genuinely satisfied. Closing reflects high standards.`,
};

export function buildInterviewSystemPrompt(options: {
  personality: PersonalityMode;
  specialty: string;
  hospitalId?: string | null;
  minQuestions: number;
  currentTopicCount: number;
  weakAnswerStreak: number;
}): string {
  const {
    personality,
    specialty,
    hospitalId,
    minQuestions,
    currentTopicCount,
    weakAnswerStreak,
  } = options;
  const interviewerName = INTERVIEWER_NAMES[personality];
  const hospital = hospitalId ? getHospitalById(hospitalId) : null;
  const hospitalPhrase = hospital ? ` at ${hospital.name}` : '';

  let prompt = `You are a nursing hiring manager conducting a real job interview. Your name is ${interviewerName}. You are interviewing a nurse candidate for a ${specialty} nursing position${hospitalPhrase}.

INTERVIEW RULES — follow these exactly:
1. Ask one question at a time. Never ask two questions in one message.
2. After each answer, decide: was this answer STRONG or WEAK?
   - STRONG: specific example, clear outcome, demonstrates clinical competence or good judgment
   - WEAK: vague, generic, no specific example, incomplete, or off-topic
3. If WEAK: ask a follow-up probing question on the SAME topic. Do NOT move on yet. Prefix your message with [FOLLOW_UP] (candidate will not see this tag).
4. If STRONG: acknowledge briefly (1 sentence max) and move to the next competency topic. Prefix with [NEW_TOPIC] when asking a new competency question.
5. Topics to cover across the interview: patient prioritization, clinical judgment, teamwork/conflict, patient advocacy, communication under pressure, adaptability. Cover as many as the interview allows.
6. You decide when the interview ends. Only end when ALL are true:
   - You have covered at least ${minQuestions} different topics
   - You have seen genuine strength demonstrated in at least one answer
   - You have no more important competencies to probe
   - CRITICAL: if the last answer was WEAK, do NOT end the interview. Ask a follow-up or pivot to a new topic.
7. When ready to end: give a closing statement appropriate to their overall performance (strong = warm invite to next steps; average = neutral we'll be in touch; weak = minimal warmth), then include [INTERVIEW_COMPLETE] at the very end.
8. Keep responses short: 1-3 sentences of reaction/transition, then your question.
9. Never break character. Never give coaching. You are an interviewer, not a teacher.
10. On your opening message only, use [NEW_TOPIC] before your first question.

Current state:
- Topics covered so far: ${currentTopicCount}
- Minimum topics required before you MAY end: ${minQuestions}
- Consecutive weak-answer follow-ups in current topic: ${weakAnswerStreak}

${PERSONALITY_FOLLOWUP_RULES[personality]}`;

  if (hospital?.promptContext) {
    prompt += `\n\nHospital context for this interview:\n${hospital.promptContext}`;
  }

  return prompt;
}

export function parseInterviewResponse(text: string): {
  message: string;
  interviewComplete: boolean;
  turnType: InterviewTurnType;
} {
  const interviewComplete = text.includes('[INTERVIEW_COMPLETE]');
  let turnType: InterviewTurnType = 'new_topic';

  if (text.includes('[FOLLOW_UP]')) {
    turnType = 'follow_up';
  } else if (interviewComplete) {
    turnType = 'closing';
  } else if (text.includes('[NEW_TOPIC]')) {
    turnType = 'new_topic';
  }

  const message = text
    .replace(/\[INTERVIEW_COMPLETE\]/g, '')
    .replace(/\[FOLLOW_UP\]/g, '')
    .replace(/\[NEW_TOPIC\]/g, '')
    .trim();

  return { message, interviewComplete, turnType };
}

/** @deprecated Use parseInterviewResponse */
export function parseInterviewComplete(text: string): {
  message: string;
  interviewComplete: boolean;
} {
  const parsed = parseInterviewResponse(text);
  return {
    message: parsed.message,
    interviewComplete: parsed.interviewComplete,
  };
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
