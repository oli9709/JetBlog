import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GetArticleById } from '@/lib/API/Database/articles/queries';
import { GetSiteById } from '@/lib/API/Database/sites/queries';
import { SupabaseUpdateArticle } from '@/lib/API/Database/articles/mutations';
import { publishArticle } from '@/lib/API/Services/publish/publishArticle';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { capturePublishError } from '@/lib/monitoring';
import { getBaseUrl } from '@/lib/config/site';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/publish
 * Universal publish endpoint — WordPress, Ghost va Webhook ni qo'llab-quvvatlaydi.
 *
 * Body: { articleId: string }
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.publish, async () => {
    let userId = '';
    let siteId = '';
    let platform = 'unknown';
    let articleId = '';

    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try { cookieStore.set(name, value, options); } catch { /* read-only context */ }
            });
          },
        },
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
      }

      userId = session.user.id;
      const body = await req.json() as { articleId?: string };
      articleId = body.articleId ?? '';

      if (!articleId) {
        return NextResponse.json({ error: 'articleId talab qilinadi!' }, { status: 400 });
      }

      // 1. Maqolani DB dan olish
      const articleRes = await GetArticleById(articleId);
      if (!articleRes.data) {
        return NextResponse.json({ error: 'Maqola topilmadi!' }, { status: 404 });
      }
      const article = articleRes.data;

      // 2. Sayt ma'lumotlarini olish
      const siteRes = await GetSiteById(article.site_id, userId);
      if (!siteRes.data) {
        return NextResponse.json({ error: 'Sayt sozlamalari topilmadi!' }, { status: 404 });
      }
      const site = siteRes.data;
      siteId = site.id;
      platform = site.platform_type;

      // 3-4. Yagona publish yo'li — to'liq SEO (seoTitle/seoDescription/tags) bilan
      let result;
      try {
        result = await publishArticle(site, article);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Publish xatosi';
        await SupabaseUpdateArticle(articleId, { status: 'error', error_message: msg });

        if (err instanceof Error) {
          capturePublishError(err, { userId, siteId, platform, articleId });
        }

        return NextResponse.json({ error: msg }, { status: 500 });
      }

      // 5. DB yangilash — published_url ni saqlash (ichki havolalar + SEO pings uchun)
      const updatedRes = await SupabaseUpdateArticle(articleId, {
        status: 'published',
        published_at: new Date().toISOString(),
        wp_post_id: isNaN(Number(result.postId)) ? undefined : Number(result.postId),
        published_url: result.url || null,
        error_message: null,
      });

      // 6. Telegram notify — fire-and-forget
      const origin = getBaseUrl();
      fetch(`${origin}/api/telegram/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify({ siteId: site.id, articleId }),
      }).catch((err) => console.error('Telegram notify error (non-fatal):', err));

      return NextResponse.json({
        success: true,
        platform,
        postId: result.postId,
        url: result.url,
        article: updatedRes.data,
      });
    } catch (error: unknown) {
      console.error('Universal Publish Route error:', error);

      if (error instanceof Error && userId) {
        capturePublishError(error, { userId, siteId, platform, articleId });
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Tizimda kutilmagan xatolik.' },
        { status: 500 }
      );
    }
  });
}
