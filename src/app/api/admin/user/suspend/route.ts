import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';

const Body = z.object({
  userId: z.string().uuid(),
  suspend: z.boolean(),
  reason: z.string().min(3).max(500).optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { userId, suspend, reason } = parsed.data;

  if (suspend && !reason) {
    return NextResponse.json({ error: 'reason required when suspending' }, { status: 400 });
  }

  const svc = adminServiceClient();
  // Cannot suspend super_admin
  const { data: target } = await svc.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (target?.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot suspend super_admin' }, { status: 403 });
  }

  const update = suspend
    ? {
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_by: admin.id,
        suspended_reason: reason ?? null,
      }
    : { is_suspended: false, suspended_at: null, suspended_by: null, suspended_reason: null };

  const { error } = await svc.from('profiles').update(update).eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: auth } = await svc.auth.admin.getUserById(userId);
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: suspend ? 'user.suspended' : 'user.unsuspended',
    targetUserId: userId,
    targetUserEmail: auth?.user?.email ?? undefined,
    details: { reason },
  });

  return NextResponse.json({ success: true });
}
