import 'server-only';

import { getAdapter } from '@/lib/adapters';
import { ArticlePayload, PublishResult } from '@/lib/adapters/base';
import { ArticleT, SiteT } from '@/lib/types/supabase';
import { runPostPublishSEO } from '@/lib/API/Services/seo/postPublishSEO';

/**
 * Yagona publish yo'li — ham qo'lda (`/api/publish`) ham avtomatik (`/api/cron`) publish
 * shu funksiyadan foydalanadi. To'liq SEO ma'lumotini (seoTitle/seoDescription/tags)
 * adapter (WordPress/Ghost/Webhook) ga uzatadi.
 *
 * Muvaffaqiyatli nashrdan so'ng SEO signallari fire-and-forget tarzida yuboriladi:
 *   - IndexNow (Bing/Yandex) — faqat WordPress
 *   - Google Search Console Indexing API
 *   - Sitemap isitish
 */
export async function publishArticle(
  site: SiteT,
  article: ArticleT
): Promise<PublishResult> {
  const payload: ArticlePayload = {
    title: article.title,
    content: article.content,
    featuredImageUrl: article.featured_image_url ?? undefined,
    seoTitle: article.seo_title ?? article.title,
    seoDescription: article.seo_description ?? undefined,
    tags: article.tags ?? [],
  };

  const adapter = getAdapter(site);
  const result = await adapter.publish(payload);

  // SEO signallari — fire-and-forget, publish muvaffaqiyatiga ta'sir qilmaydi
  if (result.url) {
    runPostPublishSEO({ site, publishedUrl: result.url }).catch((err) => {
      console.error('[publishArticle] PostPublishSEO uncaught error:', err);
    });
  }

  return result;
}
