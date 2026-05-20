import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeshBackground } from '@/components/ui/MeshBackground';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <MeshBackground />
      {children}
    </>
  );
}
