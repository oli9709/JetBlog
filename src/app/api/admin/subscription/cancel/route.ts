import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';
import { paypalFetch } from '@/lib/API/Services/paypal/client';

const Body = z.object({ userId: z.string().uuid(), reason: z.string().optional() });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { userId, reason } = parsed.data;

  const svc = adminServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('paypal_subscription_id, subscription_status')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.paypal_subscription_id && profile.subscription_status === 'active') {
    const res = await paypalFetch(
      `/v1/billing/subscriptions/${encodeURIComponent(profile.paypal_subscription_id)}/cancel`,
      { method: 'POST', body: JSON.stringify({ reason: reason ?? 'Admin action' }) }
    );
    if (res.ok === false) {
      // PayPal API xato — DB'ni ham yangilamaymiz
      return NextResponse.json({ error: 'PayPal cancel failed', debug_id: res.error.debugId }, { status: 502 });
    }
  }

  await svc.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', userId);

  const { data: auth } = await svc.auth.admin.getUserById(userId);
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'subscription.cancelled',
    targetUserId: userId,
    targetUserEmail: auth?.user?.email ?? undefined,
    details: { reason },
  });

  return NextResponse.json({ success: true });
}
