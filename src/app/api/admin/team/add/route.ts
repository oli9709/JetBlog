import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';

const Body = z.object({ userId: z.string().uuid() });

export async function POST(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const svc = adminServiceClient();
  const { error } = await svc.from('profiles').update({ role: 'admin' }).eq('id', parsed.data.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: auth } = await svc.auth.admin.getUserById(parsed.data.userId);
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'admin.added',
    targetUserId: parsed.data.userId,
    targetUserEmail: auth?.user?.email ?? undefined,
  });

  return NextResponse.json({ success: true });
}
