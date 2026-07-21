import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  paypalFetch,
  getPaypalCredentials,
  getPlanCredits,
  type PaypalPlan,
} from '@/lib/API/Services/paypal/client';

/**
 * POST /api/paypal/webhook
 *
 * PayPal → JetBlog webhook receiver.
 *
 * Xavfsizlik:
 *  - RAW body (imzo tekshiruvi PayPal serverida)
 *  - PayPal /v1/notifications/verify-webhook-signature ga verify so'rovi
 *  - Idempotency: paypal_webhook_events.paypal_event_id UNIQUE
 *
 * Log qoidasi: to'liq body chiqmasin — faqat event_type, resource_id, status.
 */

interface PaypalEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  resource?: {
    id?: string;
    status?: string;
    plan_id?: string;
    custom_id?: string;
    subscriber?: { email_address?: string };
    billing_info?: { next_billing_time?: string };
    billing_agreement_id?: string; // PAYMENT.SALE.COMPLETED da subscription_id
  };
  create_time?: string;
}

// Rate limit'siz — PayPal ko'p retry qilishi mumkin, biz idempotency bilan ushlaymiz.
export async function POST(req: Request) {
  const rawBody = await req.text();

  // 1. Headerlarni yig'ish
  const transmissionId = req.headers.get('paypal-transmission-id') ?? '';
  const transmissionTime = req.headers.get('paypal-transmission-time') ?? '';
  const certUrl = req.headers.get('paypal-cert-url') ?? '';
  const authAlgo = req.headers.get('paypal-auth-algo') ?? '';
  const transmissionSig = req.headers.get('paypal-transmission-sig') ?? '';

  if (!transmissionId || !transmissionSig || !certUrl) {
    console.warn('[paypal/webhook] 400 missing signature headers');
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
  }

  // 2. Event parse
  let event: PaypalEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error('[paypal/webhook] 400 invalid JSON', { bodyLen: rawBody.length });
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { webhookId } = getPaypalCredentials();
  if (!webhookId) {
    console.error('[paypal/webhook] webhook_id missing — check PAYPAL_WEBHOOK_ID_* env');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // 3. Imzoni PayPal orqali verify qilish
  const verifyRes = await paypalFetch<{ verification_status: string }>(
    '/v1/notifications/verify-webhook-signature',
    {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    }
  );

  if (verifyRes.ok === false) {
    console.error('[paypal/webhook] 401 signature verify request failed', {
      status: 'fetch-error',
      eventId: event.id,
      eventType: event.event_type,
      debug_id: verifyRes.error.debugId,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  if (verifyRes.data.verification_status !== 'SUCCESS') {
    console.error('[paypal/webhook] 401 signature invalid', {
      status: verifyRes.data.verification_status,
      eventId: event.id,
      eventType: event.event_type,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. Supabase admin client
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 5. Idempotency — event_id unique
  const resourceId = event.resource?.id ?? event.resource?.billing_agreement_id ?? null;
  const { data: existing } = await admin
    .from('paypal_webhook_events')
    .select('id')
    .eq('paypal_event_id', event.id)
    .maybeSingle();

  if (existing) {
    console.log('[paypal/webhook] duplicate event, skipping', {
      eventId: event.id,
      eventType: event.event_type,
    });
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 6. Subscription id → user id lookup
  //    Ba'zi event turlari resource.id = subscription id, ba'zilari
  //    resource.billing_agreement_id (PAYMENT.SALE.COMPLETED)
  const subscriptionId =
    (event.resource?.id && event.resource_type === 'subscription' ? event.resource.id : null) ??
    event.resource?.billing_agreement_id ??
    (event.event_type.startsWith('BILLING.SUBSCRIPTION') ? event.resource?.id ?? null : null);

  let userId: string | null = null;
  if (subscriptionId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('id, credits_remaining, subscription_plan')
      .eq('paypal_subscription_id', subscriptionId)
      .maybeSingle();
    if (profile) userId = profile.id;
  }

  // 7. Event handling
  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        if (userId) {
          await admin
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_next_billing: event.resource?.billing_info?.next_billing_time ?? null,
            })
            .eq('id', userId);
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        if (userId) {
          await admin.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', userId);
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        if (userId) {
          await admin.from('profiles').update({ subscription_status: 'suspended' }).eq('id', userId);
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        if (userId) {
          await admin.from('profiles').update({ subscription_status: 'expired' }).eq('id', userId);
        }
        break;
      }
      case 'PAYMENT.SALE.COMPLETED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED': {
        // Oylik yangi to'lov — kredit qo'shish + next_billing yangilash
        if (userId) {
          const { data: prof } = await admin
            .from('profiles')
            .select('credits_remaining, subscription_plan')
            .eq('id', userId)
            .maybeSingle();
          const plan = (prof?.subscription_plan ?? 'starter') as PaypalPlan;
          const credits = getPlanCredits(plan);
          const newBalance = (prof?.credits_remaining ?? 0) + credits;
          await admin
            .from('profiles')
            .update({
              credits_remaining: newBalance,
              subscription_status: 'active',
              subscription_next_billing: event.resource?.billing_info?.next_billing_time ?? null,
            })
            .eq('id', userId);
          console.log('[paypal/webhook] monthly credit added', { userId, plan, credits });
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        console.warn('[paypal/webhook] payment failed', { userId, subscriptionId, eventId: event.id });
        // Status'ни o'zgartirmayapmiz — PayPal keyin SUSPENDED yuboradi agar retry ham fail bo'lsa.
        break;
      }
      default:
        console.log('[paypal/webhook] unhandled event', { eventType: event.event_type, eventId: event.id });
    }

    // 8. Log record (idempotency guard)
    await admin.from('paypal_webhook_events').insert({
      paypal_event_id: event.id,
      event_type: event.event_type,
      resource_id: resourceId,
      user_id: userId,
      payload: event as unknown as Record<string, unknown>,
    });

    console.log('[paypal/webhook] processed', {
      eventType: event.event_type,
      eventId: event.id,
      userId,
      resourceId,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    const e = err as { message?: string; stack?: string };
    console.error('[paypal/webhook] handler error', {
      eventId: event.id,
      eventType: event.event_type,
      message: e?.message,
      stack: e?.stack?.split('\n').slice(0, 3).join(' | '),
    });
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}
