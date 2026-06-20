import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { SiteT } from '@/lib/types/supabase';
import { submitIndexNow } from './indexnow';
import { submitGSCIndexing } from './gscIndexing';

/**
 * Sitemap URL larini "isitish" (warm) — Google/Bing sitemap ni crawl qilishda
 * cache yangilanishiga yordam beradi. Eski ping endpointlari (Google/Bing) olib
 * tashlangan, shuning uchun bu yerda faqat GET orqali saytmapni tekshiramiz.
 * Non-fatal: xato bo'lsa log qilinadi, throw qilinmaydi.
 */
async function warmSitemap(siteUrl: string): Promise<void> {
  const base = siteUrl.replace(/\/$/, '');
  const candidates = [`${base}/sitemap.xml`, `${base}/sitemap_index.xml`];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'JetBlog-SitemapBot/1.0' },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        console.log(`[Sitemap] Warmed: ${url} (${res.status})`);
        // Birinchi topilgan sitemap yetarli
        return;
      }
    } catch {
      // Keyingi URL ga o'tish
    }
  }
  console.log(`[Sitemap] No sitemap found at ${base} (non-fatal)`);
}

/**
 * Nashrdan keyin barcha SEO signallarini jo'natish:
 *   1. IndexNow  (Bing, Yandex va boshqalar) — faqat WordPress
 *   2. Google Search Console Indexing API
 *   3. Sitemap isitish
 *
 * Har bir qadam o'z try/catch ichida — biri muvaffaqiyatsiz bo'lsa boshqalar davom etadi.
 * Bu funksiya HECH QACHON throw qilmaydi — fire-and-forget uchun mo'ljallangan.
 */
export async function runPostPublishSEO(params: {
  site: SiteT;
  publishedUrl: string;
}): Promise<void> {
  const { site, publishedUrl } = params;

  // 1. IndexNow
  try {
    await submitIndexNow(site, publishedUrl);
  } catch (err: unknown) {
    console.error('[PostPublishSEO] IndexNow error:', err);
    if (err instanceof Error) Sentry.captureException(err, { tags: { feature: 'indexnow' } });
  }

  // 2. GSC Indexing API
  try {
    await submitGSCIndexing(site.id, site.user_id, publishedUrl);
  } catch (err: unknown) {
    console.error('[PostPublishSEO] GSC Indexing error:', err);
    if (err instanceof Error) Sentry.captureException(err, { tags: { feature: 'gsc-indexing' } });
  }

  // 3. Sitemap warm — faqat url mavjud bo'lsa (webhook/ghost uchun url bo'sh bo'lishi mumkin)
  try {
    if (site.url) {
      await warmSitemap(site.url);
    } else {
      console.log('[PostPublishSEO] Sitemap warm skipped: no site url');
    }
  } catch (err: unknown) {
    console.error('[PostPublishSEO] Sitemap warm error:', err);
    if (err instanceof Error) Sentry.captureException(err, { tags: { feature: 'sitemap-warm' } });
  }
}
