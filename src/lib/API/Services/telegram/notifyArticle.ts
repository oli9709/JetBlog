import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendTelegramPost } from './notify';
import { normalizeArticleUrl } from '@/lib/utils/normalizeUrl';

export interface NotifyArticleParams {
  /** Service-role client (cron/publish) yoki authenticated session client
   *  (brauzer "Telegram'ga yubor" tugmasi). */
  supabase: SupabaseClient;
  siteId: string;
  articleId: string;
}

export interface NotifyArticleResult {
  sent: boolean;
  skipped?: string;
  error?: string;
}

function extractExcerpt(html: string, maxLength = 220): string {
  const text = (html ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/**
 * Nashr qilingan maqolani Telegram kanaliga anons qilish.
 *
 * Har doim NON-FATAL: hech qachon throw qilmaydi, natijani obyekt sifatida
 * qaytaradi. Har bir qadam structured log qoldiradi — Vercel log'da aynan
 * nima bo'lganini ko'rish uchun.
 *
 * Chaqiruvchi qanday `supabase` bersa, shu client bilan ishlaydi:
 *   - Cron / publish flow → service-role admin client (user_id filter yo'q,
 *     siteId o'zi yetadi, RLS bypass)
 *   - Brauzer "Telegram'ga yubor" tugmasi → authenticated session client
 *     (RLS foydalanuvchi o'ziga tegishli saytga cheklaydi)
 */
export async function notifyArticlePublished(
  params: NotifyArticleParams
): Promise<NotifyArticleResult> {
  const { supabase, siteId, articleId } = params;

  try {
    // 1. Sayt: telegram_chat_id va URL
    const { data: site, error: siteErr } = await supabase
      .from('sites')
      .select('id, url, telegram_chat_id')
      .eq('id', siteId)
      .single();

    if (siteErr || !site) {
      console.error('[notify/telegram] site not found', {
        siteId,
        articleId,
        message: siteErr?.message,
      });
      return { sent: false, error: 'site not found' };
    }

    if (!site.telegram_chat_id) {
      console.info('[notify/telegram] skipped: no telegram_chat_id', {
        siteId,
        articleId,
      });
      return { sent: false, skipped: 'no telegram_chat_id' };
    }

    // 2. Maqola
    const { data: article, error: articleErr } = await supabase
      .from('articles')
      .select('id, title, content, featured_image_url, wp_post_id, published_url')
      .eq('id', articleId)
      .single();

    if (articleErr || !article) {
      console.error('[notify/telegram] article not found', {
        siteId,
        articleId,
        message: articleErr?.message,
      });
      return { sent: false, error: 'article not found' };
    }

    // 3. Article URL — published_url (canonical) → wp_post_id fallback → site.url
    const cleanSiteUrl = (site.url ?? '').replace(/\/+$/, '');

    // Shared normalize — full URL / relative path / bo'sh holatlarini boshqaradi
    const normalized = normalizeArticleUrl(article.published_url, site.url);
    const articleUrl =
      normalized ||
      (article.wp_post_id && cleanSiteUrl
        ? `${cleanSiteUrl}/?p=${article.wp_post_id}`
        : cleanSiteUrl);

    console.info('[notify/telegram] resolved article URL', {
      siteId,
      articleId,
      publishedUrl: article.published_url,
      siteUrl: cleanSiteUrl,
      finalUrl: articleUrl,
    });

    // 4. Telegram POST
    const excerpt = extractExcerpt(article.content);
    const sent = await sendTelegramPost({
      chatId: site.telegram_chat_id,
      title: article.title,
      excerpt,
      url: articleUrl,
      imageUrl: article.featured_image_url,
    });

    if (!sent) {
      console.error('[notify/telegram] sendTelegramPost returned false', {
        siteId,
        articleId,
        chatId: site.telegram_chat_id,
      });
      return { sent: false, error: 'telegram api rejected' };
    }

    console.info('[notify/telegram] sent OK', {
      siteId,
      articleId,
      chatId: site.telegram_chat_id,
      hasImage: !!article.featured_image_url,
    });
    return { sent: true };
  } catch (err: any) {
    // Har qanday kutilmagan xato — non-fatal, structured log
    console.error('[notify/telegram] unexpected exception (non-fatal)', {
      siteId,
      articleId,
      message: err?.message,
      cause: err?.cause?.message ?? err?.cause,
    });
    return { sent: false, error: err?.message ?? 'unknown error' };
  }
}
