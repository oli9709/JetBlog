import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';

const Body = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(1).max(100_000),
  reason: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
  }
  const { userId, amount, reason } = parsed.data;

  const svc = adminServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .maybeSingle();
  const previous = profile?.credits_remaining ?? 0;
  const next = previous + amount;

  const { error } = await svc.from('profiles').update({ credits_remaining: next }).eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: auth } = await svc.auth.admin.getUserById(userId);
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'credits.added',
    targetUserId: userId,
    targetUserEmail: auth?.user?.email ?? undefined,
    details: { amount, reason, previous, new: next },
  });

  return NextResponse.json({ success: true, credits_remaining: next });
}
