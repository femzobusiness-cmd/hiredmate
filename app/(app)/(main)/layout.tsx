import AppShell from '@/components/layout/AppShell';
import { getIncompleteQuestCount } from '@/lib/quest-tracking';
import { fetchLearningPath, getUserLevel, TOTAL_STAGES } from '@/lib/stage-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, plan, rank_title, total_xp')
    .eq('user_id', session!.user.id)
    .single();

  const incompleteQuestCount = await getIncompleteQuestCount(
    supabase,
    session!.user.id
  );

  const userLevel = await getUserLevel(supabase, session!.user.id);
  const { completedCount: stagesCompletedCount } = await fetchLearningPath(
    supabase,
    session!.user.id,
    userLevel
  );

  return (
    <AppShell
      userName={profile?.first_name || session!.user.email?.split('@')[0]}
      userEmail={session!.user.email}
      plan={profile?.plan || 'free'}
      rankTitle={profile?.rank_title || 'Student Nurse'}
      totalXp={profile?.total_xp || 0}
      incompleteQuestCount={incompleteQuestCount}
      stagesCompletedCount={stagesCompletedCount}
      totalStages={TOTAL_STAGES}
    >
      {children}
    </AppShell>
  );
}
