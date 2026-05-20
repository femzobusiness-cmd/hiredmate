import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createSupabaseRouteClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth', request.url));
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
