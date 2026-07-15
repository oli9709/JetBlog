import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notifyArticlePublished } from '@/lib/API/Services/telegram/notifyArticle';

/**
 * POST /api/telegram/notify — QO'LDA brauzer tugmasi uchun.
 * Session-authenticated. Publish flow bu route'ni ISHLATMAYDI — u to'g'ridan-to'g'ri
 * `notifyArticlePublished()` ni service-role bilan chaqiradi.
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

    // RLS orqali: sessionli client faqat foydalanuvchining o'z saytlarini ko'radi.
    // Helper structured log yozadi, throw qilmaydi — natijani obyekt qaytaradi.
    const result = await notifyArticlePublished({
      supabase: supabase as any,
      siteId,
      articleId,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (result.skipped) {
      return NextResponse.json({ skipped: true, reason: result.skipped });
    }
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Telegram Notify Route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
