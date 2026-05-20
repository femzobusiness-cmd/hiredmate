'use client';

import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo size="sm" showText={false} />
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
