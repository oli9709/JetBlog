import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { paypalFetch } from '@/lib/API/Services/paypal/client';

/**
 * POST /api/paypal/subscription/cancel
 * User o'z subscription'ini bekor qiladi. Muvaffaqiyat bo'lsa PayPal webhook
 * BILLING.SUBSCRIPTION.CANCELLED yuboradi va profiles avtomatik yangilanadi.
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.publish, async () => {
    try {
      const supabase = await SupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: profile, error: profErr } = await admin
        .from('profiles')
        .select('paypal_subscription_id, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profErr || !profile?.paypal_subscription_id) {
        return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
      }
      if (profile.subscription_status !== 'active' && profile.subscription_status !== 'suspended') {
        return NextResponse.json({ error: `Cannot cancel from status: ${profile.subscription_status}` }, { status: 409 });
      }

      const res = await paypalFetch(
        `/v1/billing/subscriptions/${encodeURIComponent(profile.paypal_subscription_id)}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: 'User requested cancellation' }),
        }
      );

      if (res.ok === false) {
        return NextResponse.json(
          { error: 'PayPal cancel failed', debug_id: res.error.debugId },
          { status: 502 }
        );
      }

      // Optimistic update — webhook keyin final holатni yozadi
      await admin
        .from('profiles')
        .update({ subscription_status: 'cancelled' })
        .eq('id', user.id);

      console.log('[paypal] subscription cancelled', {
        userId: user.id,
        subscriptionId: profile.paypal_subscription_id,
      });

      return NextResponse.json({ success: true, status: 'cancelled' });
    } catch (err) {
      const e = err as { message?: string; stack?: string };
      console.error('[paypal] cancel: unexpected exception', {
        message: e?.message,
        stack: e?.stack?.split('\n').slice(0, 3).join(' | '),
      });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
