import SettingsClient from '@/components/settings/SettingsClient';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return (
    <SettingsClient
      initialProfile={profile as UserProfile | null}
      user={{
        id: session.user.id,
        email: session.user.email || '',
      }}
    />
  );
}
