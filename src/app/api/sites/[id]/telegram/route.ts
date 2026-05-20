import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendTelegramTestMessage } from '@/lib/API/Services/telegram/notify';

/**
 * PUT /api/sites/[id]/telegram
 * Telegram chat_id ni saqlash:
 * 1. Test xabar yuboradi
 * 2. Muvaffaqiyatli bo'lsa sites jadvalida yangilaydi
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { telegram_chat_id } = body;

    if (!telegram_chat_id) {
      return NextResponse.json({ error: 'telegram_chat_id talab qilinadi!' }, { status: 400 });
    }

    // Sayt foydalanuvchiga tegishli ekanligini tekshirish
    const { data: site, error: siteErr } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .single();

    if (siteErr || !site) {
      return NextResponse.json({ error: 'Sayt topilmadi yoki sizga tegishli emas!' }, { status: 404 });
    }

    // Telegram ga test xabar yuborish
    const testOk = await sendTelegramTestMessage(telegram_chat_id);
    if (!testOk) {
      return NextResponse.json(
        { error: 'Telegram xabar yuborib bo\'lmadi. Chat ID ni tekshiring va bot admin ekanligini tasdiqlang.' },
        { status: 400 }
      );
    }

    // Test muvaffaqiyatli — bazada saqlash
    const { error: updateErr } = await supabase
      .from('sites')
      .update({ telegram_chat_id })
      .eq('id', siteId)
      .eq('user_id', session.user.id);

    if (updateErr) {
      console.error('Sites telegram_chat_id yangilashda xato:', updateErr);
      return NextResponse.json({ error: 'Bazada saqlashda xatolik yuz berdi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, telegram_chat_id });

  } catch (error: any) {
    console.error('Sites Telegram Route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/sites/[id]/telegram
 * Telegram ulanishini o'chirish
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('sites')
      .update({ telegram_chat_id: null })
      .eq('id', siteId)
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json({ error: 'O\'chirishda xatolik.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
