import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
