import { NextRequest, NextResponse } from 'next/server';
import type { Ratelimit } from '@upstash/ratelimit';
import { checkRateLimit } from './ratelimit';

/**
 * Rate limit wrapper — har bir API route da takrorlanishni oldini oladi.
 * identifier: autentifikatsiya qilingan user id yoki IP.
 */
export async function withRateLimit(
  req: NextRequest,
  limiter: Ratelimit,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier =
    req.headers.get('x-user-id') ??
    req.headers.get('x-forwarded-for') ??
    'anonymous';

  const { success, retryAfter } = await checkRateLimit(limiter, identifier);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Iltimos, biroz kuting.', retryAfter },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  return handler();
}
