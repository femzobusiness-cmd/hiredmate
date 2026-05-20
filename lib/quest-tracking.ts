import type { Database } from '@/lib/database.types';
import {
  applyModeToProgress,
  type CompletedQuest,
  countModesFromProgress,
  getPeriodStartForFrequency,
  isQuestRequirementMet,
  type QuestEvent,
  type QuestRow,
  type QuestWithProgress,
} from '@/lib/quests';
import type { SupabaseClient } from '@supabase/supabase-js';

type QuestProgressInsert = {
  user_id: string;
  quest_key: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  period_start: string;
  xp_claimed: boolean;
};

type ProfileQuestFields = {
  total_xp: number;
  current_streak: number;
  last_practice_date: string | null;
  longest_streak: number;
};

type QuestProgressRow = {
  id: string;
  quest_key: string;
  period_start: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  xp_claimed: boolean;
};

export async function ensureQuestProgressRecords(
  supabase: SupabaseClient<Database>,
  userId: string,
  quests: QuestRow[]
) {
  if (!quests.length) return;

  const client = supabase as unknown as SupabaseClient;
  const rows = quests.map((quest) => ({
    user_id: userId,
    quest_key: quest.key,
    progress: 0,
    completed: false,
    period_start: getPeriodStartForFrequency(
      quest.frequency === 'weekly' ? 'weekly' : 'daily'
    ),
    xp_claimed: false,
  }));

  const { error } = await client.from('user_quest_progress').upsert(rows, {
    onConflict: 'user_id,quest_key,period_start',
    ignoreDuplicates: true,
  });

  if (error) {
    console.error('Quest progress upsert error:', error.message);
  }
}

export async function fetchQuestsWithProgress(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ daily: QuestWithProgress[]; weekly: QuestWithProgress[] }> {
  const client = supabase as unknown as SupabaseClient;

  const { data: quests, error: questsError } = await client
    .from('quests')
    .select('*')
    .order('frequency', { ascending: true });

  console.log('Quests data:', quests);
  if (questsError) {
    console.error('Quests fetch error:', questsError.message);
  }

  const questList = (quests || []) as QuestRow[];
  await ensureQuestProgressRecords(supabase, userId, questList);

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('current_streak, last_practice_date')
    .eq('user_id', userId)
    .maybeSingle();
  const profile = profileData as Pick<
    ProfileQuestFields,
    'current_streak' | 'last_practice_date'
  > | null;

  const today = getPeriodStartForFrequency('daily');
  const { data: progressRows, error: progressError } = await client
    .from('user_quest_progress')
    .select('*')
    .eq('user_id', userId);

  console.log('Progress data:', progressRows);
  if (progressError) {
    console.error('Quest progress fetch error:', progressError.message);
  }

  const progressByKey = new Map(
    ((progressRows || []) as QuestProgressRow[]).map((row) => [
      `${row.quest_key}:${row.period_start}`,
      row,
    ])
  );

  const mapQuest = (quest: QuestRow): QuestWithProgress => {
    const periodStart = getPeriodStartForFrequency(quest.frequency);
    const row = progressByKey.get(`${quest.key}:${periodStart}`);
    let progress = row?.progress || 0;
    let completed = row?.completed || false;

    if (
      quest.key === 'daily_streak' &&
      profile?.last_practice_date === today &&
      (profile?.current_streak || 0) > 0
    ) {
      progress = Math.max(progress, quest.requirement_value);
      completed = true;
      if (row && !row.completed) {
        void client
          .from('user_quest_progress')
          .update({
            progress: quest.requirement_value,
            completed: true,
            completed_at: new Date().toISOString(),
            xp_claimed: row.xp_claimed,
          })
          .eq('id', row.id);
      }
    }

    return {
      ...quest,
      progressId: row?.id || null,
      progress,
      completed,
      completedAt: row?.completed_at || null,
      xpClaimed: row?.xp_claimed ?? false,
      periodStart,
    };
  };

  const isDaily = (q: QuestRow) =>
    q.frequency?.toLowerCase() === 'daily' || q.quest_type?.toLowerCase() === 'daily';
  const isWeekly = (q: QuestRow) =>
    q.frequency?.toLowerCase() === 'weekly' || q.quest_type?.toLowerCase() === 'weekly';

  const daily = questList.filter(isDaily).map(mapQuest);
  const weekly = questList.filter(isWeekly).map(mapQuest);

  return { daily, weekly };
}

export async function trackQuestEvents(
  supabase: SupabaseClient<Database>,
  userId: string,
  event: QuestEvent
): Promise<{ completedQuests: CompletedQuest[] }> {
  const client = supabase as unknown as SupabaseClient;
  const completedQuests: CompletedQuest[] = [];

  const { data: quests } = await client.from('quests').select('*');
  const questList = (quests || []) as QuestRow[];
  if (!questList.length) return { completedQuests };

  await ensureQuestProgressRecords(supabase, userId, questList);

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('total_xp, current_streak, last_practice_date, longest_streak')
    .eq('user_id', userId)
    .maybeSingle();
  const profile = profileData as ProfileQuestFields | null;

  let runningXp = profile?.total_xp || 0;

  const today = getPeriodStartForFrequency('daily');

  for (const quest of questList) {
    const periodStart = getPeriodStartForFrequency(quest.frequency);

    const { data: rowData } = await client
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_key', quest.key)
      .eq('period_start', periodStart)
      .maybeSingle();
    const row = rowData as QuestProgressRow | null;

    if (!row || row.completed) continue;

    let nextProgress = row.progress || 0;

    switch (quest.requirement_type) {
      case 'questions_answered':
        nextProgress += event.questionsAnswered || 0;
        break;
      case 'score_above':
        if ((event.score || 0) >= quest.requirement_value) nextProgress = 1;
        break;
      case 'practice_minutes':
        if (quest.key === 'daily_streak' && profile?.last_practice_date === today) {
          nextProgress = quest.requirement_value;
        } else {
          nextProgress += Math.ceil(event.practiceMinutes || 0);
        }
        break;
      case 'clinical_blanks_session':
        if (
          event.clinicalBlanksSession ||
          (event.mode === 'clinical_blanks' && event.sessionCompleted)
        ) {
          nextProgress = 1;
        }
        break;
      case 'perfect_score':
        if (event.perfectScore) nextProgress = 1;
        break;
      case 'sessions_completed':
        if (event.sessionCompleted) nextProgress += 1;
        break;
      case 'beat_best_score': {
        const beat =
          event.beatBestScore ??
          (event.sessionCompleted && event.score != null
            ? await checkBeatBestScore(supabase, userId, event.score)
            : false);
        if (beat) nextProgress = 1;
        break;
      }
      case 'all_modes_used':
        nextProgress = applyModeToProgress(nextProgress, event.mode);
        break;
      case 'skill_xp_earned':
        nextProgress += event.skillXpEarned || 0;
        break;
      case 'streak_days':
        if ((profile?.current_streak || 0) >= quest.requirement_value) {
          nextProgress = quest.requirement_value;
        }
        break;
    }

    const met = isQuestRequirementMet(quest, nextProgress, quest.requirement_value);
    const updates: Partial<QuestProgressInsert> = {
      progress: nextProgress,
      completed: met,
    };

    if (met && !row.completed) {
      updates.completed_at = new Date().toISOString();

      if (!row.xp_claimed) {
        runningXp += quest.xp_reward;
        await (supabase as unknown as SupabaseClient)
          .from('user_profiles')
          .update({ total_xp: runningXp })
          .eq('user_id', userId);
        updates.xp_claimed = true;

        completedQuests.push({
          questKey: quest.key,
          title: quest.title,
          icon: quest.icon,
          xpReward: quest.xp_reward,
        });
      }
    }

    await client
      .from('user_quest_progress')
      .update(updates)
      .eq('id', row.id);
  }

  return { completedQuests };
}

export async function getIncompleteQuestCount(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { daily } = await fetchQuestsWithProgress(supabase, userId);
  return daily.filter((q) => !q.completed).length;
}

export async function checkBeatBestScore(
  supabase: SupabaseClient<Database>,
  userId: string,
  currentScore: number
) {
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('score')
    .eq('user_id', userId)
    .not('score', 'is', null)
    .order('score', { ascending: false })
    .limit(2);

  const scores =
    (sessions as { score: number | null }[] | null)
      ?.map((s) => (s.score != null ? Math.round(Number(s.score)) : 0))
      .filter((s) => s > 0) || [];

  if (scores.length < 2) return false;
  const previousBest = Math.max(...scores.slice(1));
  return currentScore > previousBest;
}
