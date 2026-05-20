import AppShell from '@/components/layout/AppShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SalaryPrepLayout({
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
    .select('first_name')
    .eq('user_id', session!.user.id)
    .single();

  return (
    <AppShell
      userName={profile?.first_name || session!.user.email?.split('@')[0]}
      userEmail={session!.user.email}
    >
      {children}
    </AppShell>
  );
}
