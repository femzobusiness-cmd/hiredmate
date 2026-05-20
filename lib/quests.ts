export type QuestFrequency = 'daily' | 'weekly';

export type QuestRequirementType =
  | 'questions_answered'
  | 'score_above'
  | 'practice_minutes'
  | 'clinical_blanks_session'
  | 'perfect_score'
  | 'sessions_completed'
  | 'beat_best_score'
  | 'all_modes_used'
  | 'skill_xp_earned'
  | 'streak_days';

export type QuestRow = {
  key: string;
  title: string;
  description: string;
  quest_type: string;
  frequency: QuestFrequency;
  xp_reward: number;
  icon: string;
  requirement_type: QuestRequirementType;
  requirement_value: number;
  specialty_filter: string | null;
};

export type UserQuestProgressRow = {
  id: string;
  user_id: string;
  quest_key: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  period_start: string;
  xp_claimed: boolean;
};

export type QuestWithProgress = QuestRow & {
  progressId: string | null;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  xpClaimed: boolean;
  periodStart: string;
};

export type QuestEvent = {
  questionsAnswered?: number;
  score?: number;
  practiceMinutes?: number;
  mode?: 'written' | 'multiple_choice' | 'clinical_blanks';
  sessionCompleted?: boolean;
  perfectScore?: boolean;
  skillXpEarned?: number;
  beatBestScore?: boolean;
  clinicalBlanksSession?: boolean;
};

export type CompletedQuest = {
  questKey: string;
  title: string;
  icon: string;
  xpReward: number;
};

const MODE_FLAGS = {
  written: 1,
  multiple_choice: 2,
  clinical_blanks: 4,
} as const;

export function getDailyPeriodStart(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getWeeklyPeriodStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function getTimeUntilDailyReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  const ms = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, label: `${hours}h ${minutes}m` };
}

export function getDaysUntilWeeklyReset() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  return daysUntilMonday === 7 ? 0 : daysUntilMonday;
}

export function getPeriodStartForFrequency(frequency: QuestFrequency, date = new Date()) {
  return frequency === 'daily' ? getDailyPeriodStart(date) : getWeeklyPeriodStart(date);
}

export function countModesFromProgress(progress: number) {
  let count = 0;
  if (progress & MODE_FLAGS.written) count += 1;
  if (progress & MODE_FLAGS.multiple_choice) count += 1;
  if (progress & MODE_FLAGS.clinical_blanks) count += 1;
  return count;
}

export function applyModeToProgress(progress: number, mode?: QuestEvent['mode']) {
  if (!mode) return progress;
  const flag = MODE_FLAGS[mode];
  return progress | flag;
}

export function isQuestRequirementMet(
  quest: QuestRow,
  progress: number,
  requirementValue: number
) {
  switch (quest.requirement_type) {
    case 'questions_answered':
    case 'practice_minutes':
    case 'sessions_completed':
    case 'skill_xp_earned':
    case 'streak_days':
      return progress >= requirementValue;
    case 'score_above':
    case 'perfect_score':
    case 'clinical_blanks_session':
    case 'beat_best_score':
      return progress >= 1;
    case 'all_modes_used':
      return countModesFromProgress(progress) >= requirementValue;
    default:
      return progress >= requirementValue;
  }
}

export function getProgressLabel(quest: QuestRow, progress: number) {
  const target = quest.requirement_value;
  switch (quest.requirement_type) {
    case 'all_modes_used':
      return `${countModesFromProgress(progress)}/${target} modes`;
    case 'score_above':
    case 'perfect_score':
    case 'clinical_blanks_session':
    case 'beat_best_score':
      return progress >= 1 ? `${target}% target met` : 'Not yet';
    default:
      return `${Math.min(progress, target)}/${target} completed`;
  }
}

export function getProgressPercent(quest: QuestRow, progress: number) {
  const target = quest.requirement_value;
  if (quest.requirement_type === 'all_modes_used') {
    return Math.min(100, Math.round((countModesFromProgress(progress) / target) * 100));
  }
  if (
    ['score_above', 'perfect_score', 'clinical_blanks_session', 'beat_best_score'].includes(
      quest.requirement_type
    )
  ) {
    return progress >= 1 ? 100 : 0;
  }
  return Math.min(100, Math.round((progress / target) * 100));
}
