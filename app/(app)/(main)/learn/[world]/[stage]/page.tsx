import { StagePlayClient } from '@/components/learn/StagePlayClient';
import { getStageByKey, getUserLevel, fetchLearningPath } from '@/lib/stage-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: { world: string; stage: string };
};

export default async function StagePlayPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const stageData = await getStageByKey(supabase, params.stage);
  if (!stageData || stageData.world_key !== params.world || !stageData.world) {
    notFound();
  }

  const userLevel = await getUserLevel(supabase, user.id);
  const { worlds } = await fetchLearningPath(supabase, user.id, userLevel);
  const world = worlds.find((w) => w.key === params.world);
  const stageProgress = world?.stages.find((s) => s.key === params.stage);

  if (!world || !stageProgress || stageProgress.status === 'locked') {
    redirect(`/learn/${params.world}`);
  }

  return <StagePlayClient stage={stageData} world={stageData.world} />;
}
