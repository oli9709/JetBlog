import { NextResponse } from 'next/server';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { GetArticleById } from '@/lib/API/Database/articles/queries';
import { GetSiteById } from '@/lib/API/Database/sites/queries';
import { SupabaseUpdateArticle } from '@/lib/API/Database/articles/mutations';
import { PublishToWordPress } from '@/lib/API/Services/wordpress/publish';
import { decryptText } from '@/lib/utils/encryption';
import { getBaseUrl } from '@/lib/config/site';

/**
 * POST /api/wordpress/publish
 * Qoralama maqolani WordPress ga nashr etadi.
 * Nashrdan keyin Telegram notify ni async (fire-and-forget) chaqiradi.
 */
export async function POST(req: Request) {
  try {
    const supabase = await SupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'articleId talab qilinadi!' }, { status: 400 });
    }

    // 1. Maqolani olish
    const articleRes = await GetArticleById(articleId);
    if (!articleRes.data) {
      return NextResponse.json({ error: 'Maqola topilmadi!' }, { status: 404 });
    }
    const article = articleRes.data;

    // 2. Sayt ma'lumotlarini olish
    const siteRes = await GetSiteById(article.site_id, userId);
    if (!siteRes.data) {
      return NextResponse.json({ error: 'WordPress sayti sozlamalari topilmadi!' }, { status: 404 });
    }
    const site = siteRes.data;

    // 3. WordPress ga nashr etish
    const decryptedPassword = decryptText(site.wp_password || '');
    const publishRes = await PublishToWordPress({
      url: site.url,
      username: site.wp_username,
      applicationPassword: decryptedPassword,
      title: article.title,
      content: article.content,
      featuredImageUrl: article.featured_image_url,
      status: 'published'
    });

    if (!publishRes.success) {
      await SupabaseUpdateArticle(articleId, {
        status: 'error',
        error_message: publishRes.error || 'WordPress REST API nashr qilish xatoligi'
      });
      return NextResponse.json(
        { error: publishRes.error || 'WordPress saytiga yuborishda xatolik.' },
        { status: 500 }
      );
    }

    // 4. Maqola holatini 'published' ga yangilash
    const updatedArticleRes = await SupabaseUpdateArticle(articleId, {
      status: 'published',
      published_at: new Date().toISOString(),
      wp_post_id: publishRes.wpPostId,
      error_message: null
    });

    // 5. Telegram notify — async fire-and-forget (WP nashrini kutmaydi)
    const origin = getBaseUrl();
    fetch(`${origin}/api/telegram/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // session cookie larni o'tkazish uchun
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({ siteId: site.id, articleId })
    }).catch(err => console.error('Telegram notify fire-and-forget xatosi:', err));

    return NextResponse.json({
      success: true,
      wpPostId: publishRes.wpPostId,
      article: updatedArticleRes.data
    });

  } catch (error: any) {
    console.error('WordPress Publish Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Tizimda kutilmagan xatolik.' },
      { status: 500 }
    );
  }
}
