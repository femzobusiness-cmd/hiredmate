import { CommunityClient } from '@/components/community/CommunityClient';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function CommunityPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name')
    .eq('user_id', session!.user.id)
    .maybeSingle();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, achievement_key, earned_at')
    .eq('user_id', session!.user.id)
    .order('earned_at', { ascending: false });

  const userName =
    profile?.first_name?.trim() ||
    (session!.user.user_metadata?.first_name as string | undefined)?.trim() ||
    'Nurse';

  return (
    <CommunityClient
      userName={userName}
      initialAchievements={achievements || []}
    />
  );
}
