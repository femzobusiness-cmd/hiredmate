import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createSupabaseRouteClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, onboarding_completed')
        .eq('user_id', data.user.id)
        .single();

      if (!profile) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          first_name:
            data.user.user_metadata?.first_name ||
            data.user.user_metadata?.full_name?.split(' ')[0] ||
            null,
          onboarding_completed: false,
        });
      }

      const redirectTo = profile?.onboarding_completed
        ? '/dashboard'
        : '/onboarding';

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
