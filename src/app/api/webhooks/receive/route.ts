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
  const ua = req.headers.get('user-agent') ?? '';
  const webhookIdHeader = req.headers.get('x-jetblog-webhook-id');
  const signatureHeader = req.headers.get('x-jetblog-signature');

  try {
    const rawBody = await req.text();

    // 0. Bo'sh payload tekshiruvi
    if (!rawBody) {
      console.error('[webhook/receive] 400 empty payload', {
        webhookIdHeader,
        ua,
      });
      return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
    }

    if (!webhookIdHeader) {
      console.error('[webhook/receive] 400 missing webhook id header', {
        ua,
        bodyLen: rawBody.length,
        bodyPreview: rawBody.slice(0, 120),
      });
      return NextResponse.json({ error: 'Missing webhook ID' }, { status: 400 });
    }
    const webhookId = webhookIdHeader;
    const signature = signatureHeader;

    // 2. Webhook ma'lumotlarini olish
    const { data: webhook, error: whErr } = await supabaseAdmin
      .from('webhooks')
      .select('id, secret_key, is_active, site_id')
      .eq('id', webhookId)
      .single();

    if (whErr || !webhook) {
      console.error('[webhook/receive] 404 webhook not found', {
        webhookId,
        dbError: whErr?.message,
      });
      return NextResponse.json({ error: 'Webhook topilmadi' }, { status: 404 });
    }

    if (!webhook.is_active) {
      console.error('[webhook/receive] 403 webhook inactive', {
        webhookId,
        siteId: webhook.site_id,
      });
      return NextResponse.json({ error: 'Webhook faol emas' }, { status: 403 });
    }

    // 3. HMAC-SHA256 imzo tekshirish
    if (signature) {
      const expected = crypto
        .createHmac('sha256', webhook.secret_key)
        .update(rawBody)
        .digest('hex');

      const sigHex = signature.replace(/^sha256=/, '');

      // timingSafeEqual bir xil uzunlikdagi bufferlar talab qiladi
      // noto'g'ri hex bo'lsa 401 qaytarish
      let isValid = false;
      try {
        const sigBuf      = Buffer.from(sigHex, 'hex');
        const expectedBuf = Buffer.from(expected, 'hex');
        isValid = sigBuf.length === expectedBuf.length &&
          crypto.timingSafeEqual(sigBuf, expectedBuf);
      } catch {
        isValid = false;
      }

      if (!isValid) {
        console.error('[webhook/receive] 401 invalid signature', {
          webhookId,
          siteId: webhook.site_id,
          providedLen: signature.length,
        });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // 4. Payload parse
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('[webhook/receive] 400 invalid JSON', {
        webhookId,
        bodyLen: rawBody.length,
        bodyPreview: rawBody.slice(0, 120),
        parseErr: parseErr instanceof Error ? parseErr.message : String(parseErr),
      });
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
