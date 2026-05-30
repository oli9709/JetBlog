import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GetKeywordById } from '@/lib/API/Database/keywords/queries';
import { GetSiteById } from '@/lib/API/Database/sites/queries';
import { SupabaseInsertArticle, SupabaseUpdateArticle } from '@/lib/API/Database/articles/mutations';
import { SupabaseUpdateKeyword } from '@/lib/API/Database/keywords/mutations';
import { GenerateArticleWithClaude } from '@/lib/API/Services/claude/generate';
import { GenerateCoverImage } from '@/lib/API/Services/image/generate';
import { sendWebhook } from '@/lib/API/Services/webhook/send';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { captureGenerationError } from '@/lib/monitoring';

/**
 * POST /api/generate
 * Tanlangan kalit so'z uchun maqola va muqova rasmini to'liq generatsiya qilish.
 * Avval placeholder article yaratadi (status: queued) va articleId qaytaradi.
 * Keyin pipeline davomida Realtime orqali ko'rinadigan status yangilanadi.
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.generate, async () => {
    let userId = '';
    let siteId = '';
    let keyword = '';
    let creditsRemaining = 0;
    let articleId: string | null = null;

    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
      }

      userId = session.user.id;
      const body = await req.json();
      const { keywordId } = body;

      if (!keywordId) {
        return NextResponse.json({ error: 'keywordId talab qilinadi!' }, { status: 400 });
      }

      // 1. Kalit so'z ma'lumotlarini olish
      const keywordRes = await GetKeywordById(keywordId);
      if (keywordRes.error || !keywordRes.data) {
        return NextResponse.json({ error: "Kalit so'z topilmadi yoki tarmoq xatosi!" }, { status: 404 });
      }
      const keywordData = keywordRes.data;
      keyword = keywordData.keyword;
      siteId = keywordData.site_id;

      // 2. Sayt ma'lumotlarini olish
      const siteRes = await GetSiteById(keywordData.site_id, userId);
      if (siteRes.error || !siteRes.data) {
        return NextResponse.json({ error: 'Sayt topilmadi yoki u sizga tegishli emas!' }, { status: 404 });
      }
      const siteData = siteRes.data;

      // 3. Kredit tekshirish
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        return NextResponse.json({ error: "Profil ma'lumotlari topilmadi!" }, { status: 404 });
      }

      const credits = profile.credits_remaining ?? 0;
      creditsRemaining = credits;

      if (credits < 1) {
        return NextResponse.json({ error: 'Yetarli kredit mavjud emas!' }, { status: 403 });
      }

      // 4. Kredit kamaytirish
      try {
        await supabase
          .from('profiles')
          .update({ credits_remaining: credits - 1 })
          .eq('id', userId);
      } catch (err) {
        console.warn('Failed to deduct credits:', err);
      }

      // 5. Placeholder article — status: 'queued'. articleId shu yerda qaytariladi.
      const placeholderRes = await SupabaseInsertArticle({
        site_id: keywordData.site_id,
        keyword_id: keywordId,
        title: keyword,
        content: '',
        status: 'queued',
        ai_tokens_used: 0,
        generation_started_at: new Date().toISOString(),
      } as any);

      if (placeholderRes.error || !placeholderRes.data) {
        return NextResponse.json({ error: 'Maqola yaratishda xatolik yuz berdi!' }, { status: 500 });
      }

      articleId = (placeholderRes.data as any).id as string;

      // Mijozga articleId ni darhol qaytarish (Realtime subscription uchun)
      // Lekin bu route sinxron ishlaydi — pipeline davom etadi, Realtime orqali status ko'rinadi.
      // (Asinxron pattern uchun queue kerak bo'lar edi; hozir sinxron qoladi)

      // 6. Status: generating
      await supabase
        .from('articles')
        .update({ status: 'generating' })
        .eq('id', articleId);

      const articleDraft = await GenerateArticleWithClaude({
        keyword: keywordData.keyword,
        brandVoice: siteData.brand_voice,
        language: keywordData.language,
      });

      // 7. Status: imaging
      await supabase
        .from('articles')
        .update({ status: 'imaging', title: articleDraft.title })
        .eq('id', articleId);

      let coverUrl: string | null = null;
      try {
        coverUrl = await GenerateCoverImage({
          keyword: keywordData.keyword,
          title: articleDraft.title,
          language: keywordData.language,
        });
      } catch (imgErr) {
        console.error('Rasm generatsiyasida xatolik yuz berdi:', imgErr);
      }

      // 8. Status: publishing
      await supabase
        .from('articles')
        .update({ status: 'publishing' })
        .eq('id', articleId);

      // 9. To'liq ma'lumotlarni yozish
      const { data: finalArticle, error: finalErr } = await supabase
        .from('articles')
        .update({
          title: articleDraft.title,
          content: articleDraft.content,
          featured_image_url: coverUrl,
          status: 'draft',
          ai_tokens_used: articleDraft.tokensUsed,
          generation_completed_at: new Date().toISOString(),
        })
        .eq('id', articleId)
        .select()
        .single();

      if (finalErr || !finalArticle) {
        throw new Error('Maqolani finallashtrishda xatolik yuz berdi!');
      }

      // 10. Kalit so'z holatini 'completed' ga o'zgartirish
      try {
        await SupabaseUpdateKeyword(keywordId, {
          status: 'completed',
          article_id: articleId,
        });
      } catch (err) {
        console.warn('SupabaseUpdateKeyword failed:', err);
      }

      // Webhook trigger — fire-and-forget
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('*')
        .eq('site_id', keywordData.site_id)
        .eq('is_active', true)
        .contains('events', ['article.published']);

      if (webhooks?.length) {
        const excerpt = articleDraft.content.replace(/<[^>]*>/g, '').trim().slice(0, 300);
        for (const wh of webhooks) {
          sendWebhook({
            webhookId: wh.id,
            endpointUrl: wh.endpoint_url,
            secretKey: wh.secret_key,
            event: 'article.published',
            payload: {
              title: articleDraft.title,
              excerpt,
              featured_image_url: coverUrl,
              keyword: keywordData.keyword,
              language: keywordData.language,
              article_id: articleId,
            },
          }).catch((err) => console.error('Webhook send error:', err));
        }
      }

      return NextResponse.json({ success: true, articleId, article: finalArticle });
    } catch (error: unknown) {
      console.error('Generate Route Global Error:', error);

      // Status: failed
      if (articleId) {
        try {
          const supabase = createRouteHandlerClient<any>({ cookies: () => cookies() as any });
          await supabase
            .from('articles')
            .update({
              status: 'failed',
              generation_error: error instanceof Error ? error.message : 'Tizimda kutilmagan xatolik',
            })
            .eq('id', articleId);
        } catch {
          // non-blocking
        }
      }

      if (error instanceof Error && userId) {
        captureGenerationError(error, { userId, siteId, keyword, creditsRemaining });
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Tizimda kutilmagan xatolik yuz berdi.' },
        { status: 500 }
      );
    }
  });
}
