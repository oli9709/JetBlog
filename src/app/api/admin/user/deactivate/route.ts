import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';
import { paypalFetch } from '@/lib/API/Services/paypal/client';

const Body = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().email(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { userId, confirmEmail } = parsed.data;

  const svc = adminServiceClient();
  const { data: auth } = await svc.auth.admin.getUserById(userId);
  const email = auth?.user?.email ?? '';
  if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Confirmation email does not match' }, { status: 400 });
  }

  const { data: profile } = await svc
    .from('profiles')
    .select('role, paypal_subscription_id, subscription_status')
    .eq('id', userId)
    .maybeSingle();
  if (profile?.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot deactivate super_admin' }, { status: 403 });
  }

  // Cancel PayPal if active
  if (profile?.paypal_subscription_id && profile.subscription_status === 'active') {
    await paypalFetch(
      `/v1/billing/subscriptions/${encodeURIComponent(profile.paypal_subscription_id)}/cancel`,
      { method: 'POST', body: JSON.stringify({ reason: 'Account deactivated by admin' }) }
    );
  }

  await svc
    .from('profiles')
    .update({
      deactivated_at: new Date().toISOString(),
      subscription_status: 'cancelled',
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_by: admin.id,
      suspended_reason: 'Account deactivated',
    })
    .eq('id', userId);

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'user.deactivated',
    targetUserId: userId,
    targetUserEmail: email,
  });

  return NextResponse.json({ success: true });
}
