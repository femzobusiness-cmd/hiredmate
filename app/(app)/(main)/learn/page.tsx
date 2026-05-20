import { LearningPathMap } from '@/components/learn/LearningPathMap';
import { fetchLearningPath, getUserLevel } from '@/lib/stage-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function LearnPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const userLevel = await getUserLevel(supabase, user.id);
  const { worlds, completedCount } = await fetchLearningPath(
    supabase,
    user.id,
    userLevel
  );

  return <LearningPathMap worlds={worlds} completedCount={completedCount} />;
}
