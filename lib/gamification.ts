export type Rank = {
  level: number;
  emoji: string;
  title: string;
  xp: number;
};

export const RANKS: Rank[] = [
  { level: 1, emoji: '🩺', title: 'Student Nurse', xp: 0 },
  { level: 2, emoji: '📚', title: 'Nursing Student', xp: 100 },
  { level: 3, emoji: '🏥', title: 'Nursing Intern', xp: 250 },
  { level: 4, emoji: '⭐', title: 'Junior RN', xp: 500 },
  { level: 5, emoji: '💉', title: 'Staff Nurse', xp: 1000 },
  { level: 6, emoji: '🔥', title: 'Senior RN', xp: 2000 },
  { level: 7, emoji: '🧠', title: 'Charge Nurse', xp: 3500 },
  { level: 8, emoji: '💪', title: 'Clinical Expert', xp: 5000 },
  { level: 9, emoji: '🎯', title: 'Nurse Specialist', xp: 7500 },
  { level: 10, emoji: '🌟', title: 'Clinical Leader', xp: 10000 },
  { level: 11, emoji: '🏆', title: 'Senior Specialist', xp: 15000 },
  { level: 12, emoji: '👨‍⚕️', title: 'Nurse Educator', xp: 20000 },
  { level: 13, emoji: '🔬', title: 'Clinical Scientist', xp: 30000 },
  { level: 14, emoji: '💫', title: 'Chief Nurse', xp: 50000 },
  { level: 15, emoji: '👑', title: 'ICU Elite', xp: 100000 },
];

export const ACHIEVEMENTS = [
  {
    key: 'first_session',
    title: 'First Session',
    emoji: '🏁',
    description: 'Complete your first practice session.',
  },
  {
    key: 'perfect_score',
    title: 'Perfect Score',
    emoji: '💯',
    description: 'Score 100% on any answer.',
  },
  {
    key: 'five_streak',
    title: 'Five Streak',
    emoji: '🔥',
    description: 'Reach a 5-day practice streak.',
  },
  {
    key: 'ten_sessions',
    title: 'Ten Sessions',
    emoji: '📈',
    description: 'Complete 10 practice sessions.',
  },
  {
    key: 'salary_prep',
    title: 'Salary Prep',
    emoji: '💵',
    description: 'Generate your first salary script.',
  },
  {
    key: 'speed_demon',
    title: 'Speed Demon',
    emoji: '⚡',
    description: 'Answer in under 30 seconds.',
  },
  {
    key: 'comeback_kid',
    title: 'Comeback Kid',
    emoji: '🛟',
    description: 'Score 90%+ after a 50% score.',
  },
  {
    key: 'night_owl',
    title: 'Night Owl',
    emoji: '🦉',
    description: 'Practice after 10pm.',
  },
  {
    key: 'early_bird',
    title: 'Early Bird',
    emoji: '🌅',
    description: 'Practice before 7am.',
  },
  {
    key: 'specialty_master',
    title: 'Specialty Master',
    emoji: '🎓',
    description: 'Complete 20 sessions in the same specialty.',
  },
];

export function getRankForXp(totalXp: number) {
  return [...RANKS].reverse().find((rank) => totalXp >= rank.xp) || RANKS[0];
}

export function getNextRank(level: number) {
  return RANKS.find((rank) => rank.level === level + 1) || null;
}

export function getRankProgress(totalXp: number) {
  const current = getRankForXp(totalXp);
  const next = getNextRank(current.level);

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      xpToNext: 0,
    };
  }

  const levelRange = next.xp - current.xp;
  const earnedInLevel = totalXp - current.xp;

  return {
    current,
    next,
    progress: Math.min(100, Math.round((earnedInLevel / levelRange) * 100)),
    xpToNext: Math.max(0, next.xp - totalXp),
  };
}

export function getXpForScore(score: number, mode: 'written' | 'multiple_choice' | 'clinical_blanks') {
  let xp = mode === 'clinical_blanks' ? 15 : 10;
  if (score === 100) xp += 30;
  else if (score >= 90) xp += 20;
  else if (score >= 80) xp += 10;
  else if (score >= 70) xp += 5;
  return xp;
}

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getUpdatedStreak(
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: string | null
) {
  const today = getTodayDateKey();
  if (lastPracticeDate === today) {
    return { currentStreak, longestStreak, lastPracticeDate: today, streakBonus: 0 };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = lastPracticeDate === getTodayDateKey(yesterday);
  const nextCurrent = continued ? currentStreak + 1 : 1;

  return {
    currentStreak: nextCurrent,
    longestStreak: Math.max(longestStreak, nextCurrent),
    lastPracticeDate: today,
    streakBonus: nextCurrent === 7 ? 50 : 0,
  };
}
