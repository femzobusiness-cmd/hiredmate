import { QuestBoardClient } from '@/components/quests/QuestBoardClient';
import { PageTransition } from '@/components/ui/PageTransition';
import { fetchQuestsWithProgress } from '@/lib/quest-tracking';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function QuestsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { daily, weekly } = await fetchQuestsWithProgress(supabase, user.id);

  return (
    <PageTransition>
      <QuestBoardClient initialDaily={daily} initialWeekly={weekly} />
    </PageTransition>
  );
}
