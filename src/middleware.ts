import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // api, _next, _vercel, monitoring-tunnel va kengaytmali fayllarni o'tkazib yuborish
    '/((?!api|_next|_vercel|monitoring-tunnel|.*\\..*).*)',
  ],
};
