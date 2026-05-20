import type { Database } from '@/lib/database.types';
import { getRankForXp } from '@/lib/gamification';
import {
  getStarsForScore,
  type NextStageInfo,
  type StageRow,
  type StageStatus,
  type StageWithProgress,
  TOTAL_STAGES,
  type UserStageProgressRow,
  type WorldRow,
  type WorldStatus,
  type WorldWithProgress,
} from '@/lib/learning-path';
import type { SupabaseClient } from '@supabase/supabase-js';

type ProgressRow = {
  stage_key: string;
  world_key: string;
  completed: boolean;
  best_score: number;
  attempts: number;
  stars: number;
  completed_at: string | null;
};

export async function fetchLearningPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  userLevel: number
): Promise<{
  worlds: WorldWithProgress[];
  completedCount: number;
  nextStage: NextStageInfo | null;
}> {
  const client = supabase as unknown as SupabaseClient;

  const { data: worldsData, error: worldsError } = await client
    .from('worlds')
    .select('*')
    .order('order_index', { ascending: true });

  if (worldsError) {
    console.error('Worlds fetch error:', worldsError.message);
  }

  const { data: stagesData, error: stagesError } = await client
    .from('stages')
    .select('*')
    .order('stage_number', { ascending: true });

  if (stagesError) {
    console.error('Stages fetch error:', stagesError.message);
  }

  const { data: progressData } = await client
    .from('user_stage_progress')
    .select('*')
    .eq('user_id', userId);

  const progressByStage = new Map(
    ((progressData || []) as ProgressRow[]).map((row) => [row.stage_key, row])
  );

  const worlds = (worldsData || []) as WorldRow[];
  const allStages = (stagesData || []) as StageRow[];

  const stagesByWorld = new Map<string, StageRow[]>();
  for (const stage of allStages) {
    const list = stagesByWorld.get(stage.world_key) || [];
    list.push(stage);
    stagesByWorld.set(stage.world_key, list);
  }

  let completedCount = 0;
  let previousWorldComplete = true;

  const worldsWithProgress: WorldWithProgress[] = worlds.map((world) => {
    const worldUnlocked =
      userLevel >= world.required_level && previousWorldComplete;
    const stages = (stagesByWorld.get(world.key) || []).sort(
      (a, b) => a.stage_number - b.stage_number
    );

    let previousStageCompleted = true;
    const stagesWithProgress: StageWithProgress[] = stages.map((stage) => {
      const progress = progressByStage.get(stage.key) || null;
      const isCompleted = progress?.completed === true;

      let status: StageStatus = 'locked';
      if (!worldUnlocked) {
        status = 'locked';
      } else if (isCompleted) {
        status = 'completed';
        completedCount += 1;
      } else if (previousStageCompleted) {
        status = 'current';
        previousStageCompleted = false;
      } else {
        status = 'locked';
      }

      if (isCompleted) {
        previousStageCompleted = true;
      }

      return {
        ...stage,
        status,
        progress: progress as UserStageProgressRow | null,
      };
    });

    const completedStages = stagesWithProgress.filter(
      (s) => s.status === 'completed'
    ).length;

    const allStagesDone =
      stages.length > 0 && completedStages >= stages.length;

    let worldStatus: WorldStatus = 'locked';
    if (!worldUnlocked) {
      worldStatus = 'locked';
    } else if (allStagesDone) {
      worldStatus = 'completed';
    } else {
      worldStatus = 'in_progress';
    }

    previousWorldComplete = allStagesDone;

    return {
      ...world,
      status: worldStatus,
      completedStages,
      stages: stagesWithProgress,
    };
  });

  const nextStage = findNextStage(worldsWithProgress);

  return { worlds: worldsWithProgress, completedCount, nextStage };
}

function findNextStage(worlds: WorldWithProgress[]): NextStageInfo | null {
  for (const world of worlds) {
    if (world.status === 'locked') continue;
    const current = world.stages.find((s) => s.status === 'current');
    if (current) {
      return {
        worldKey: world.key,
        worldTitle: world.title,
        worldIcon: world.icon,
        stageKey: current.key,
        stageTitle: current.title,
        stageNumber: current.stage_number,
        totalStagesInWorld: world.total_stages,
        isBoss: current.is_boss_stage,
      };
    }
  }
  return null;
}

export async function getStageByKey(
  supabase: SupabaseClient<Database>,
  stageKey: string
): Promise<(StageRow & { world?: WorldRow }) | null> {
  const client = supabase as unknown as SupabaseClient;

  const { data: stage } = await client
    .from('stages')
    .select('*')
    .eq('key', stageKey)
    .maybeSingle();

  if (!stage) return null;

  const { data: world } = await client
    .from('worlds')
    .select('*')
    .eq('key', (stage as StageRow).world_key)
    .maybeSingle();

  return { ...(stage as StageRow), world: world as WorldRow | undefined };
}

export async function getUserLevel(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<number> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('total_xp')
    .eq('user_id', userId)
    .maybeSingle();

  const totalXp = (profile as { total_xp?: number } | null)?.total_xp || 0;
  return getRankForXp(totalXp).level;
}

export async function completeStage(
  supabase: SupabaseClient<Database>,
  userId: string,
  stageKey: string,
  worldKey: string,
  score: number,
  weakestQuestion?: string
) {
  const client = supabase as unknown as SupabaseClient;

  const { data: stage } = await client
    .from('stages')
    .select('*')
    .eq('key', stageKey)
    .maybeSingle();

  if (!stage) {
    return { error: 'Stage not found', passed: false };
  }

  const stageRow = stage as StageRow;
  const passed = score >= stageRow.passing_score;
  const stars = passed ? getStarsForScore(score) : 0;

  const { data: existing } = await client
    .from('user_stage_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('stage_key', stageKey)
    .maybeSingle();

  const prev = existing as ProgressRow | null;
  const attempts = (prev?.attempts || 0) + 1;
  const bestScore = Math.max(prev?.best_score || 0, score);
  const bestStars = Math.max(prev?.stars || 0, stars);
  const wasCompleted = prev?.completed === true;
  const nowCompleted = passed || wasCompleted;

  let xpAwarded = 0;
  if (passed && !wasCompleted) {
    xpAwarded = stageRow.xp_reward;
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('user_id', userId)
      .maybeSingle();
    const totalXp =
      ((profile as { total_xp?: number } | null)?.total_xp || 0) + xpAwarded;
    await (supabase as unknown as SupabaseClient)
      .from('user_profiles')
      .update({ total_xp: totalXp })
      .eq('user_id', userId);
  }

  const { error: upsertError } = await client.from('user_stage_progress').upsert(
    {
      user_id: userId,
      stage_key: stageKey,
      world_key: worldKey,
      completed: nowCompleted,
      best_score: bestScore,
      attempts,
      stars: bestStars,
      completed_at: passed
        ? prev?.completed_at || new Date().toISOString()
        : prev?.completed_at || null,
    },
    { onConflict: 'user_id,stage_key' }
  );

  if (upsertError) {
    console.error('Stage progress upsert error:', upsertError.message);
  }

  const path = await fetchLearningPath(
    supabase,
    userId,
    await getUserLevel(supabase, userId)
  );

  const nextStage = path.nextStage;
  const worldComplete =
    path.worlds.find((w) => w.key === worldKey)?.status === 'completed';

  return {
    passed,
    score,
    passingScore: stageRow.passing_score,
    stars: bestStars,
    xpAwarded,
    isBoss: stageRow.is_boss_stage,
    worldComplete,
    nextStage,
    weakestQuestion,
    totalCompleted: path.completedCount,
    totalStages: TOTAL_STAGES,
  };
}

export { TOTAL_STAGES };
