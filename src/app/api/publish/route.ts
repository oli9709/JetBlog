import { NextRequest, NextResponse, after } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { GetArticleById } from '@/lib/API/Database/articles/queries';
import { GetSiteById } from '@/lib/API/Database/sites/queries';
import { SupabaseUpdateArticle } from '@/lib/API/Database/articles/mutations';
import { publishArticle } from '@/lib/API/Services/publish/publishArticle';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { capturePublishError } from '@/lib/monitoring';
import { notifyArticlePublished } from '@/lib/API/Services/telegram/notifyArticle';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Service-role admin — Telegram notify uchun (cron/publish flow'da user session yo'q). */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
      }

      userId = user.id;
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
      console.log('[publish] boshlandi', {
        siteId,
        articleId,
        platform: site.platform_type,
        userId,
      });

      let result;
      try {
        result = await publishArticle(site, article);
      } catch (err: unknown) {
        // TO'LIQ log — receiver javob body'si, status, stack barchasi Vercel logда ko'rinsin
        const e = err as {
          message?: string;
          status?: number;
          response?: unknown;
          stack?: string;
          cause?: any;
          name?: string;
        };
        console.error('[publish] XATOSI', {
          siteId,
          articleId,
          platform,
          name: e?.name,
          status: e?.status,
          message: e?.message,
          response:
            typeof e?.response === 'string'
              ? e.response.slice(0, 500)
              : JSON.stringify(e?.response ?? '').slice(0, 500),
          cause: e?.cause?.message ?? (e?.cause ? String(e.cause).slice(0, 200) : undefined),
          stack: e?.stack?.split('\n').slice(0, 5).join(' | '),
        });

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

      // 6. Telegram notify — after() bilan response yuborilgandan keyin bajariladi.
      //    Service-role client — RLS bypass, cookie / session shart emas.
      after(async () => {
        try {
          const result = await notifyArticlePublished({
            supabase: supabaseAdmin,
            siteId: site.id,
            articleId,
          });
          console.info('[publish/notify] telegram result', {
            siteId: site.id,
            articleId,
            ...result,
          });
        } catch (err: any) {
          console.error('[publish/notify] telegram threw (non-fatal)', {
            siteId: site.id,
            articleId,
            message: err?.message,
            cause: err?.cause?.message ?? err?.cause,
          });
        }
      });

      return NextResponse.json({
        success: true,
        platform,
        postId: result.postId,
        url: result.url,
        article: updatedRes.data,
      });
    } catch (error: unknown) {
      const e = error as {
        message?: string;
        status?: number;
        response?: unknown;
        stack?: string;
        cause?: any;
        name?: string;
      };
      console.error('[publish] OUTER XATOSI', {
        siteId,
        articleId,
        platform,
        userId,
        name: e?.name,
        status: e?.status,
        message: e?.message,
        response:
          typeof e?.response === 'string'
            ? e.response.slice(0, 500)
            : JSON.stringify(e?.response ?? '').slice(0, 500),
        cause: e?.cause?.message ?? (e?.cause ? String(e.cause).slice(0, 200) : undefined),
        stack: e?.stack?.split('\n').slice(0, 5).join(' | '),
      });

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
