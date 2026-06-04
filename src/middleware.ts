import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API routes, static files, Sentry tunnel
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/monitoring-tunnel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Run next-intl middleware for locale detection & routing
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match everything except api, _next, static files
    '/((?!api|_next|_vercel|monitoring-tunnel|.*\\..*).*)',
  ],
};
