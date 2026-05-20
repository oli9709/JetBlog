import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GenerateArticleWithClaude } from '@/lib/API/Services/claude/generate';
import { GenerateCoverImage } from '@/lib/API/Services/image/generate';
import { PublishToWordPress } from '@/lib/API/Services/wordpress/publish';
import { sendTelegramPost } from '@/lib/API/Services/telegram/notify';
import { SupabaseInsertArticle, SupabaseUpdateArticle } from '@/lib/API/Database/articles/mutations';
import { SupabaseUpdateKeyword } from '@/lib/API/Database/keywords/mutations';
import { decryptText } from '@/lib/utils/encryption';

export const dynamic = 'force-dynamic';

async function runCron() {
  // Service role client — RLS bypass qiladi, cron uchun kerak
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sites, error: sitesError } = await client
    .from('sites')
    .select('*')
    .eq('is_active', true);

  if (sitesError) throw new Error('Faol saytlarni olishda xatolik yuz berdi.');
  if (!sites || sites.length === 0) {
    return { message: 'Hech qanday faol sayt topilmadi.', results: [] };
  }

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const results: any[] = [];

  for (const site of sites) {
    const publishDays = site.publish_days || [];
    const isPublishDay = publishDays.map((d: string) => d.toLowerCase()).includes(todayName);

    if (!isPublishDay) {
      results.push({ site: site.url, status: 'skipped', reason: 'Bugun nashr qilish kuni emas.' });
      continue;
    }

    const { data: profile } = await client
      .from('profiles')
      .select('credits_remaining')
      .eq('id', site.user_id)
      .single();

    const currentCredits = profile?.credits_remaining || 0;
    if (currentCredits < 1) {
      results.push({ site: site.url, status: 'error', reason: 'Kreditlar tugagan.' });
      continue;
    }

    const { data: keywords } = await client
      .from('keywords')
      .select('*')
      .eq('site_id', site.id)
      .in('status', ['approved', 'pending'])
      .order('created_at', { ascending: true })
      .limit(1);

    if (!keywords || keywords.length === 0) {
      results.push({ site: site.url, status: 'skipped', reason: 'Tasdiqlangan kalit so\'zlar topilmadi.' });
      continue;
    }

    const activeKeyword = keywords[0];

    try {
      await client
        .from('profiles')
        .update({ credits_remaining: currentCredits - 1 })
        .eq('id', site.user_id);

      const draft = await GenerateArticleWithClaude({
        keyword: activeKeyword.keyword,
        brandVoice: site.brand_voice,
        language: activeKeyword.language
      });

      let coverUrl: string | null = null;
      try {
        coverUrl = await GenerateCoverImage({
          keyword: activeKeyword.keyword,
          title: draft.title,
          language: activeKeyword.language
        });
      } catch (imgErr) {
        console.error('Cron rasm yaratishda xatolik:', imgErr);
      }

      const articleRes = await SupabaseInsertArticle({
        site_id: site.id,
        keyword_id: activeKeyword.id,
        title: draft.title,
        content: draft.content,
        featured_image_url: coverUrl || null,
        status: 'draft',
        ai_tokens_used: draft.tokensUsed
      });

      if (!articleRes.data) throw new Error('Maqolani bazaga saqlab bo\'lmadi.');

      const articleId = articleRes.data.id;

      const decryptedPassword = decryptText(site.wp_password || '');
      const wpPublishRes = await PublishToWordPress({
        url: site.url,
        username: site.wp_username,
        applicationPassword: decryptedPassword,
        title: draft.title,
        content: draft.content,
        featuredImageUrl: coverUrl,
        status: 'published'
      });

      if (!wpPublishRes.success) {
        await SupabaseUpdateArticle(articleId, {
          status: 'error',
          error_message: wpPublishRes.error || 'WordPress REST API ulanish xatoligi'
        });
        results.push({ site: site.url, status: 'error', reason: wpPublishRes.error });
        continue;
      }

      await SupabaseUpdateArticle(articleId, {
        status: 'published',
        published_at: new Date().toISOString(),
        wp_post_id: wpPublishRes.wpPostId
      });

      await SupabaseUpdateKeyword(activeKeyword.id, {
        status: 'completed',
        article_id: articleId
      });

      if (site.telegram_chat_id) {
        try {
          const cleanUrl = site.url.replace(/\/+$/, '');
          const articleUrl = wpPublishRes.wpPostId
            ? `${cleanUrl}/?p=${wpPublishRes.wpPostId}`
            : cleanUrl;
          const excerpt = draft.content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 220) + '...';

          await sendTelegramPost({
            chatId: site.telegram_chat_id,
            title: draft.title,
            excerpt,
            url: articleUrl,
            imageUrl: coverUrl
          });
        } catch (teleErr) {
          console.error('Cron Telegram anons xatoligi:', teleErr);
        }
      }

      results.push({
        site: site.url,
        status: 'success',
        keyword: activeKeyword.keyword,
        wpPostId: wpPublishRes.wpPostId
      });

    } catch (siteErr: any) {
      console.error(`Site ${site.url} uchun autopilot xatolik:`, siteErr);
      results.push({ site: site.url, status: 'error', reason: siteErr.message || 'Kutilmagan xatolik' });
    }
  }

  return { results };
}

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  // POST: Authorization: Bearer <secret>
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;

  // GET: ?secret=<secret>
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') === cronSecret) return true;
  } catch {}

  return false;
}

// POST /api/cron — pg_cron / pg_net dan chaqiriladi
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
  }
  try {
    const data = await runCron();
    return NextResponse.json({ success: true, processedDate: new Date().toISOString(), ...data });
  } catch (error: any) {
    console.error('Cron POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/cron — vercel cron / manual test uchun
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
  }
  try {
    const data = await runCron();
    return NextResponse.json({ success: true, processedDate: new Date().toISOString(), ...data });
  } catch (error: any) {
    console.error('Cron GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
