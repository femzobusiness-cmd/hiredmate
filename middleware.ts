import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

const publicRoutes = ['/', '/login', '/signup', '/pricing'];

function isPublicRoute(pathname: string) {
  return (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/auth/callback')
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refreshes the session cookie on every matched request so users stay logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  res.headers.set('x-pathname', pathname);

  if (isPublicRoute(pathname)) {
    return res;
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = session.user;
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id, onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle();

  let onboardingCompleted = existingProfile?.onboarding_completed === true;

  if (!existingProfile) {
    const { data: createdProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        first_name:
          (user.user_metadata?.first_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
          null,
        onboarding_completed: false,
      })
      .select('onboarding_completed')
      .maybeSingle();

    onboardingCompleted = createdProfile?.onboarding_completed === true;
  }

  if (!onboardingCompleted && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  if (onboardingCompleted && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
