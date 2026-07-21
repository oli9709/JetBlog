import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { paypalFetch, getPlanCredits, type PaypalPlan } from '@/lib/API/Services/paypal/client';

const BodySchema = z.object({
  subscriptionId: z.string().min(3),
  planName: z.enum(['starter', 'pro']),
});

interface PaypalSubscriptionResp {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  start_time?: string;
  billing_info?: {
    next_billing_time?: string;
  };
  subscriber?: { email_address?: string };
}

/**
 * POST /api/paypal/subscription/activate
 *
 * Front (PayPalButtons.onApprove) chaqiradi. PayPal'dan subscription holатini
 * tasdiqлаb, profiles jadvalidagi subscription_* maydonlarни yangilaydi va
 * oylik kredit qo'shadi.
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.publish, async () => {
    try {
      // 1. Auth
      const supabase = await SupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Body validate
      const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
      }
      const { subscriptionId, planName } = parsed.data;
      const plan = planName as PaypalPlan;

      // 3. PayPal'dan verify — status ACTIVE bo'lishi kerak (yoki APPROVED, keyin webhook ACTIVATED qiladi)
      const paypalRes = await paypalFetch<PaypalSubscriptionResp>(
        `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { method: 'GET' }
      );

      if (paypalRes.ok === false) {
        return NextResponse.json(
          { error: 'PayPal subscription fetch failed', debug_id: paypalRes.error.debugId },
          { status: 502 }
        );
      }

      const sub = paypalRes.data;
      // ACTIVE — real to'lov o'tgan; APPROVED — user rozi bo'lgan lekin PayPal hali confirm qilmagan.
      // Ikkalasini ham qabul qilamiz; webhook ACTIVATED keyin holатni tasdiqлaydi.
      if (sub.status !== 'ACTIVE' && sub.status !== 'APPROVED') {
        console.warn('[paypal] activate: unexpected status', { userId: user.id, status: sub.status, subscriptionId });
        return NextResponse.json(
          { error: `Subscription not active (status: ${sub.status})` },
          { status: 409 }
        );
      }

      // 4. Profiles yangilash — service role (RLS bypass)
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Kredit qo'shish uchun avvalgi credits_remaining ni olishimiz kerak
      const { data: profile, error: profErr } = await admin
        .from('profiles')
        .select('credits_remaining, paypal_subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profErr) {
        console.error('[paypal] activate: profile fetch failed', { userId: user.id, message: profErr.message });
        return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
      }

      // Agar shu subscription_id allaqachon aktivlashtirilgan bo'lsa — kredit takror qo'shmaymiz
      const isReactivation = profile?.paypal_subscription_id === subscriptionId;
      const credits = getPlanCredits(plan);
      const newBalance = (profile?.credits_remaining ?? 0) + (isReactivation ? 0 : credits);

      const { error: updateErr } = await admin
        .from('profiles')
        .update({
          paypal_subscription_id: subscriptionId,
          subscription_status: sub.status === 'ACTIVE' ? 'active' : 'active',
          subscription_plan: plan,
          subscription_started_at: sub.start_time ?? new Date().toISOString(),
          subscription_next_billing: sub.billing_info?.next_billing_time ?? null,
          credits_remaining: newBalance,
        })
        .eq('id', user.id);

      if (updateErr) {
        console.error('[paypal] activate: profile update failed', { userId: user.id, message: updateErr.message });
        return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
      }

      console.log('[paypal] subscription activated', {
        userId: user.id,
        plan,
        subscriptionId,
        reactivation: isReactivation,
        creditsAdded: isReactivation ? 0 : credits,
      });

      return NextResponse.json({
        success: true,
        plan,
        status: 'active',
        creditsAdded: isReactivation ? 0 : credits,
      });
    } catch (err) {
      const e = err as { message?: string; stack?: string };
      console.error('[paypal] activate: unexpected exception', {
        message: e?.message,
        stack: e?.stack?.split('\n').slice(0, 3).join(' | '),
      });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
