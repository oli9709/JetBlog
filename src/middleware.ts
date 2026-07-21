import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  const guarded = pathname.match(/^\/(uz|ru|en)\/(dashboard|admin)(\/|$)/);
  if (!guarded) return response;
  const locale = guarded[1];
  const section = guarded[2] as 'dashboard' | 'admin';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_suspended')
    .eq('id', session.user.id)
    .maybeSingle();

  if (section === 'admin') {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      // 404 — don't reveal admin route existence
      return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url));
    }
  } else if (section === 'dashboard') {
    if (profile?.is_suspended) {
      return NextResponse.rewrite(new URL(`/${locale}/suspended`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
