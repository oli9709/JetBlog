import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendTelegramPost } from '@/lib/API/Services/telegram/notify';

function extractExcerpt(html: string, maxLength = 220): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/**
 * POST /api/telegram/notify
 * Nashr qilingan maqolani Telegram kanaliga anons qilish
 * Body: { siteId, articleId }
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { siteId, articleId } = body;

    if (!siteId || !articleId) {
      return NextResponse.json({ error: 'siteId va articleId talab qilinadi!' }, { status: 400 });
    }

    // Sayt ma'lumotlarini olish
    const { data: site, error: siteErr } = await supabase
      .from('sites')
      .select('id, url, telegram_chat_id')
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .single();

    if (siteErr || !site) {
      return NextResponse.json({ error: 'Sayt topilmadi!' }, { status: 404 });
    }

    if (!site.telegram_chat_id) {
      return NextResponse.json({ skipped: true, reason: 'Telegram chat_id ulanmagan' });
    }

    // Maqola ma'lumotlarini olish
    const { data: article, error: articleErr } = await supabase
      .from('articles')
      .select('id, title, content, featured_image_url, wp_post_id')
      .eq('id', articleId)
      .single();

    if (articleErr || !article) {
      return NextResponse.json({ error: 'Maqola topilmadi!' }, { status: 404 });
    }

    const excerpt = extractExcerpt(article.content);
    const cleanUrl = site.url.replace(/\/+$/, '');
    const articleUrl = article.wp_post_id
      ? `${cleanUrl}/?p=${article.wp_post_id}`
      : cleanUrl;

    const sent = await sendTelegramPost({
      chatId: site.telegram_chat_id,
      title: article.title,
      excerpt,
      url: articleUrl,
      imageUrl: article.featured_image_url
    });

    if (!sent) {
      return NextResponse.json({ error: 'Telegram xabar yuborib bo\'lmadi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Telegram Notify Route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
