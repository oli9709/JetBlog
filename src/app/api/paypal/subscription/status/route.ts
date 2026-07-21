import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';

/**
 * GET /api/paypal/subscription/status
 * Current user'ning subscription holатini qaytaradi.
 */
export async function GET() {
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

    const { data, error } = await admin
      .from('profiles')
      .select(
        'paypal_subscription_id, subscription_status, subscription_plan, subscription_started_at, subscription_next_billing, credits_remaining'
      )
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[paypal] status: profile fetch failed', { userId: user.id, message: error.message });
      return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
    }

    return NextResponse.json({
      subscriptionId: data?.paypal_subscription_id ?? null,
      status: data?.subscription_status ?? 'none',
      plan: data?.subscription_plan ?? 'none',
      startedAt: data?.subscription_started_at ?? null,
      nextBilling: data?.subscription_next_billing ?? null,
      credits: data?.credits_remaining ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
