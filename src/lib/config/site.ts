/**
 * Yagona haqiqat manbai — JetBlog kanonik URL si
 *
 * Ishlatish:
 *   import { SITE_URL, getBaseUrl } from '@/lib/config/site';
 *
 * Muhit o'zgaruvchisi:
 *   NEXT_PUBLIC_DOMAIN — Vercel Production da https://jetblog.app ga o'rnating
 *
 * Fallback mantiqi:
 *   - development → http://localhost:3000  (mahalliy server)
 *   - production  → https://jetblog.app   (NEXT_PUBLIC_DOMAIN o'rnatilmagan bo'lsa)
 */

/** Joriy muhitga mos kanonik base URL (server-side safe) */
export function getBaseUrl(): string {
  // Agar muhit o'zgaruvchisi ochiq belgilangan bo'lsa — uni ishlat (har ikkala muhitda)
  if (process.env.NEXT_PUBLIC_DOMAIN) {
    return process.env.NEXT_PUBLIC_DOMAIN.replace(/\/$/, '');
  }
  // Mahalliy dev muhiti
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // Production fallback
  return 'https://jetblog.app';
}

/**
 * Build vaqtida baholanadigan SITE_URL.
 * metadata, sitemap, robots, OG kabi statik joylarda ishlating.
 * Runtime da (route handler ichida) getBaseUrl() ni afzal ko'ring.
 */
export const SITE_URL: string = getBaseUrl();

const siteConfig = {
  name: 'JetBlog',
  alt_name: 'JetBlog',
  description: 'WordPress saytingiz uchun AI SEO Autopilot',
  url: SITE_URL,
  ogImage: `${SITE_URL}/og-image.png`,
  loading_bar_color: '#00F2FE',
  links: {
    twitter: 'https://twitter.com/jetblog_app',
    github: 'https://github.com/jetblog-app',
    linkedin: 'https://linkedin.com/company/jetblog-app',
  },
};

export default siteConfig;
