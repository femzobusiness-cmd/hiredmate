import { WorldDetailClient } from '@/components/learn/WorldDetailClient';
import { fetchLearningPath, getUserLevel } from '@/lib/stage-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type PageProps = {
  params: { world: string };
};

export default async function WorldDetailPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const userLevel = await getUserLevel(supabase, user.id);
  const { worlds } = await fetchLearningPath(supabase, user.id, userLevel);
  const world = worlds.find((w) => w.key === params.world);

  if (!world) notFound();

  return <WorldDetailClient world={world} />;
}
