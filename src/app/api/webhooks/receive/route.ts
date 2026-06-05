import 'server-only';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// supabaseAdmin — RLS bypass uchun service role ishlatiladi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1. Webhook ID headerdan olish
    const webhookId = req.headers.get('x-jetblog-webhook-id');
    const signature  = req.headers.get('x-jetblog-signature');

    if (!webhookId) {
      return NextResponse.json({ error: 'X-JetBlog-Webhook-Id header talab qilinadi' }, { status: 400 });
    }

    // 2. Webhook ma'lumotlarini olish
    const { data: webhook, error: whErr } = await supabaseAdmin
      .from('webhooks')
      .select('id, secret_key, is_active, site_id')
      .eq('id', webhookId)
      .single();

    if (whErr || !webhook) {
      return NextResponse.json({ error: 'Webhook topilmadi' }, { status: 404 });
    }

    if (!webhook.is_active) {
      return NextResponse.json({ error: 'Webhook faol emas' }, { status: 403 });
    }

    // 3. HMAC-SHA256 imzo tekshirish
    if (signature) {
      const expected = crypto
        .createHmac('sha256', webhook.secret_key)
        .update(rawBody)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature.replace(/^sha256=/, ''), 'hex'),
        Buffer.from(expected, 'hex')
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Noto\'g\'ri imzo' }, { status: 401 });
      }
    }

    // 4. Payload parse
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Noto\'g\'ri JSON payload' }, { status: 400 });
    }

    const { event, data: articleData } = payload;

    // 5. article.published eventi uchun maqola statusini yangilash
    if (event === 'article.published' && articleData?.id) {
      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({
          status: 'published',
          published_at: articleData.publishedAt ?? new Date().toISOString(),
        })
        .eq('id', articleData.id)
        .eq('site_id', webhook.site_id);

      if (updateError) {
        console.error('[webhook/receive] article update error:', updateError.message);
      }
    }

    // 6. Webhook so'nggi trigger vaqtini yangilash
    await supabaseAdmin
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status: 200,
        connection_tested: true,
      })
      .eq('id', webhookId);

    return NextResponse.json({ received: true, event: event ?? 'unknown' });

  } catch (err: any) {
    console.error('[webhook/receive] unhandled error:', err?.message);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
