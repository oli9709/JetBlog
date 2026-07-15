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

/** Joriy muhitga mos kanonik base URL (server-side safe).
 *  Env qanchalik buzuq bo'lmasin (bare host, trailing whitespace, typo),
 *  new URL() orqali normalizatsiya qilinadi yoki fallback qaytariladi. */
export function getBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_DOMAIN ?? '').trim();
  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://www.jetblog.app';

  if (!raw) return fallback;

  // Force protocol if the env is a bare host like "jetblog.app"
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  // Validate — reject malformed values so callers never build broken URLs
  try {
    const u = new URL(withScheme);
    // .origin => "https://host[:port]" — no trailing slash, safe for new URL(path, origin)
    return u.origin;
  } catch {
    console.error(
      `[getBaseUrl] NEXT_PUBLIC_DOMAIN is malformed: "${raw}" — falling back to ${fallback}`
    );
    return fallback;
  }
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
