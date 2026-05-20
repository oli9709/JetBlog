import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GetKeywordById } from '@/lib/API/Database/keywords/queries';
import { GetSiteById } from '@/lib/API/Database/sites/queries';
import { SupabaseInsertArticle } from '@/lib/API/Database/articles/mutations';
import { SupabaseUpdateKeyword } from '@/lib/API/Database/keywords/mutations';
import { GenerateArticleWithClaude } from '@/lib/API/Services/claude/generate';
import { GenerateCoverImage } from '@/lib/API/Services/image/generate';
import { sendWebhook } from '@/lib/API/Services/webhook/send';

/**
 * POST /api/generate
 * Tanlangan kalit so'z uchun maqola va muqova rasmini to'liq generatsiya qilish
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    
    // Foydalanuvchi seansini olish
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { keywordId } = body;

    if (!keywordId) {
      return NextResponse.json({ error: 'keywordId talab qilinadi!' }, { status: 400 });
    }

    // 1. Kalit so'z ma'lumotlarini olish
    const keywordRes = await GetKeywordById(keywordId);
    if (keywordRes.error || !keywordRes.data) {
      return NextResponse.json({ error: 'Kalit so\'z topilmadi yoki tarmoq xatosi!' }, { status: 404 });
    }
    const keywordData = keywordRes.data;

    // 2. Sayt ma'lumotlarini va brend ovozini olish
    const siteRes = await GetSiteById(keywordData.site_id, userId);
    if (siteRes.error || !siteRes.data) {
      return NextResponse.json({ error: 'Sayt topilmadi yoki u sizga tegishli emas!' }, { status: 404 });
    }
    const siteData = siteRes.data;

    // 3. Foydalanuvchi hisobida yetarli kredit borligini tekshirish
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single();
    
    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profil ma\'lumotlari topilmadi!' }, { status: 404 });
    }

    const credits = profile.credits_remaining ?? 0;

    if (credits < 1) {
      return NextResponse.json({ error: 'Yetarli kredit mavjud emas!' }, { status: 403 });
    }

    // 4. Kreditni 1 taga kamaytirish
    try {
      await supabase
        .from('profiles')
        .update({ credits_remaining: credits - 1 })
        .eq('id', userId);
    } catch (err) {
      console.warn('Failed to deduct credits:', err);
    }

    // 5. Claude orqali matn yozish
    const articleDraft = await GenerateArticleWithClaude({
      keyword: keywordData.keyword,
      brandVoice: siteData.brand_voice,
      language: keywordData.language
    });

    // 6. DALL-E 3 orqali muqova rasm yaratish (xato bo'lsa pipeline to'xtamaydi)
    let coverUrl: string | null = null;
    try {
      coverUrl = await GenerateCoverImage({
        keyword: keywordData.keyword,
        title: articleDraft.title,
        language: keywordData.language
      });
    } catch (imgErr) {
      console.error('Rasm generatsiyasida xatolik yuz berdi:', imgErr);
    }

    // 7. Yaratilgan maqolani bazaga saqlash
    const articleRes = await SupabaseInsertArticle({
      site_id: keywordData.site_id,
      keyword_id: keywordId,
      title: articleDraft.title,
      content: articleDraft.content,
      featured_image_url: coverUrl || null,
      status: 'draft',
      ai_tokens_used: articleDraft.tokensUsed
    });
    
    if (articleRes.error || !articleRes.data) {
      return NextResponse.json({ error: 'Maqolani saqlashda xatolik yuz berdi!' }, { status: 500 });
    }
    
    const articleData = articleRes.data[0];

    // 8. Kalit so'z holatini 'completed' ga o'zgartirish va bog'langan article_id ni saqlash
    try {
      await SupabaseUpdateKeyword(keywordId, {
        status: 'completed',
        article_id: articleData.id
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
            article_id: articleData.id
          }
        }).catch(err => console.error('Webhook send error:', err));
      }
    }

    return NextResponse.json({
      success: true,
      article: articleData
    });

  } catch (error: any) {
    console.error('Generate Route Global Error:', error);
    return NextResponse.json({ error: error.message || 'Tizimda kutilmagan xatolik yuz berdi.' }, { status: 500 });
  }
}
