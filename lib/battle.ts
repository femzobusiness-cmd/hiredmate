export type BattleMode =
  | 'rapid-response'
  | 'clinical-blitz'
  | 'prioritization-gauntlet';

export type BattleQuestion = {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: number;
  hasInterruption: boolean;
  interruption?: string | null;
};

export const BATTLE_MODES: {
  id: BattleMode;
  emoji: string;
  name: string;
  description: string;
  borderColor: string;
}[] = [
  {
    id: 'rapid-response',
    emoji: '🚨',
    name: 'Rapid Response',
    description:
      '30 seconds per question. Escalating patient crisis scenarios.',
    borderColor: '#EF4444',
  },
  {
    id: 'clinical-blitz',
    emoji: '🧠',
    name: 'Clinical Blitz',
    description: 'Pure clinical knowledge. Fast answers. No time for guessing.',
    borderColor: '#00C6B2',
  },
  {
    id: 'prioritization-gauntlet',
    emoji: '📋',
    name: 'Prioritization Gauntlet',
    description: 'Multiple patients, competing needs. Who do you see first?',
    borderColor: '#F59E0B',
  },
];

export const BATTLE_SPECIALTIES = [
  'General',
  'ICU',
  'ED',
  'Med-Surg',
  'L&D',
] as const;

export const BATTLE_TIMER_SECONDS = 30;

export function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)
  );
  return monday.toISOString().slice(0, 10);
}

export function parseCorrectLetter(option: string): string {
  const match = option.match(/^([A-D])/i);
  return match ? match[1].toUpperCase() : option.charAt(0).toUpperCase();
}

export function calculateBattlePoints(
  correct: boolean,
  answerTimeSeconds: number,
  streak: number,
  difficulty: number
): { points: number; speedBonus: boolean; streakBonus: number } {
  if (!correct) {
    return { points: 0, speedBonus: false, streakBonus: 0 };
  }
  const multiplier = 1 + (difficulty - 1) * 0.25;
  const speedBonus = answerTimeSeconds < 10;
  const streakBonus = streak >= 3 ? 25 * streak : 0;
  let points = 100;
  if (speedBonus) points += 50;
  points += streakBonus;
  return {
    points: Math.round(points * multiplier),
    speedBonus,
    streakBonus,
  };
}

export function calculateBattleXp(
  score: number,
  speedBonuses: number,
  maxStreak: number
): number {
  return Math.round(score / 10) + speedBonuses * 5 + maxStreak * 3;
}

export function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'RN'
  );
}

export const FALLBACK_BATTLE_QUESTIONS: BattleQuestion[] = [
  {
    id: 'fb1',
    scenario:
      'Your med-surg unit is short-staffed. A post-op patient calls out in pain while another has SpO2 88% on room air.',
    question: 'What is your first action?',
    options: [
      'A: Give pain medication to the post-op patient first',
      'B: Apply oxygen and assess the patient with low SpO2',
      'C: Ask the CNA to check both patients',
      'D: Document and continue current medication pass',
    ],
    correctAnswer: 'B',
    explanation: 'Airway and oxygenation take priority over comfort measures.',
    category: 'Prioritization',
    difficulty: 1,
    hasInterruption: false,
    interruption: null,
  },
  {
    id: 'fb2',
    scenario:
      'ICU patient on heparin drip develops sudden hypotension and tachycardia.',
    question: 'Which finding do you investigate first?',
    options: [
      'A: Recent lab potassium level',
      'B: Signs of internal or external bleeding',
      'C: Family visitation schedule',
      'D: Diet order compliance',
    ],
    correctAnswer: 'B',
    explanation: 'Heparin increases bleeding risk; hemodynamic changes may indicate hemorrhage.',
    category: 'Clinical Judgment',
    difficulty: 2,
    hasInterruption: true,
    interruption: 'Charge nurse: Bed 4 call light is flashing — patient requesting water.',
  },
  {
    id: 'fb3',
    scenario: 'ED triage: chest pain, ankle sprain, and fever in pediatric patient arrive simultaneously.',
    question: 'Who do you assess first?',
    options: [
      'A: Ankle sprain — arrived first',
      'B: Pediatric fever — appears stable',
      'C: Chest pain — highest acuity until ruled out',
      'D: Whoever has the shortest wait time',
    ],
    correctAnswer: 'C',
    explanation: 'Chest pain requires immediate evaluation for cardiac etiology.',
    category: 'Prioritization',
    difficulty: 2,
    hasInterruption: false,
    interruption: null,
  },
];
