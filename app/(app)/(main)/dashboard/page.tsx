import { CommandCenterDashboard } from '@/components/dashboard/CommandCenterDashboard';
import { fetchQuestsWithProgress } from '@/lib/quest-tracking';
import { fetchLearningPath, getUserLevel, TOTAL_STAGES } from '@/lib/stage-progress';
import { mergeSkillProgress } from '@/lib/skill-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session!.user.id)
    .maybeSingle();

  const { data: skillRows } = await supabase
    .from('skill_progress')
    .select('*')
    .eq('user_id', session!.user.id);

  const { data: allSessions } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false });

  const sessionIds = allSessions?.map((item) => item.id) || [];

  const { data: answers } = sessionIds.length
    ? await supabase
        .from('session_answers')
        .select('*')
        .in('session_id', sessionIds)
        .not('score', 'is', null)
    : { data: [] };

  const firstName =
    profile?.first_name?.trim() ||
    (session!.user.user_metadata?.first_name as string | undefined)?.trim() ||
    (session!.user.user_metadata?.full_name as string | undefined)
      ?.split(' ')[0]
      ?.trim() ||
    'Femi';

  const { daily: dailyQuests } = await fetchQuestsWithProgress(
    supabase,
    session!.user.id
  );

  const userLevel = await getUserLevel(supabase, session!.user.id);
  const { nextStage, completedCount } = await fetchLearningPath(
    supabase,
    session!.user.id,
    userLevel
  );

  return (
    <CommandCenterDashboard
      profile={profile}
      sessions={allSessions || []}
      answers={answers || []}
      skills={mergeSkillProgress(skillRows)}
      firstName={firstName}
      dailyQuests={dailyQuests}
      nextStage={nextStage}
      stagesCompletedCount={completedCount}
      totalStages={TOTAL_STAGES}
    />
  );
}
