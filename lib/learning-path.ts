export const TOTAL_STAGES = 26;

export type StageType = 'written' | 'multiple_choice' | 'clinical_blank' | 'mixed';

export type WorldRow = {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  order_index: number;
  required_level: number;
  total_stages: number;
};

export type StageRow = {
  key: string;
  world_key: string;
  title: string;
  description: string;
  stage_number: number;
  stage_type: StageType;
  xp_reward: number;
  questions_count: number;
  passing_score: number;
  is_boss_stage: boolean;
};

export type UserStageProgressRow = {
  stage_key: string;
  world_key: string;
  completed: boolean;
  best_score: number;
  attempts: number;
  stars: number;
  completed_at: string | null;
};

export type StageStatus = 'locked' | 'current' | 'completed';

export type WorldStatus = 'locked' | 'in_progress' | 'completed';

export type StageWithProgress = StageRow & {
  status: StageStatus;
  progress: UserStageProgressRow | null;
};

export type WorldWithProgress = WorldRow & {
  status: WorldStatus;
  completedStages: number;
  stages: StageWithProgress[];
};

export type NextStageInfo = {
  worldKey: string;
  worldTitle: string;
  worldIcon: string;
  stageKey: string;
  stageTitle: string;
  stageNumber: number;
  totalStagesInWorld: number;
  isBoss: boolean;
};

export function getStarsForScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 80) return 2;
  if (score >= 70) return 1;
  return 0;
}

export function formatStageType(type: StageType): string {
  switch (type) {
    case 'written':
      return 'Written';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'clinical_blank':
      return 'Clinical Blanks';
    case 'mixed':
      return 'Mixed';
    default:
      return 'Practice';
  }
}

export function getStageTypeBadgeColor(type: StageType): string {
  switch (type) {
    case 'written':
      return 'bg-purple-100 text-primary';
    case 'multiple_choice':
      return 'bg-teal-100 text-teal-800';
    case 'clinical_blank':
      return 'bg-blue-100 text-blue-800';
    case 'mixed':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
