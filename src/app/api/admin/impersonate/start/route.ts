import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';
import { IMPERSONATION_COOKIE } from '@/lib/API/Services/admin/impersonation';

const Body = z.object({ userId: z.string().uuid() });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { userId } = parsed.data;

  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 });
  }

  const svc = adminServiceClient();
  const { data: target } = await svc.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (target?.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot impersonate super_admin' }, { status: 403 });
  }

  // End any active session for this admin
  await svc
    .from('admin_impersonation_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('admin_id', admin.id)
    .is('ended_at', null);

  const { data: session, error } = await svc
    .from('admin_impersonation_sessions')
    .insert({ admin_id: admin.id, target_user_id: userId })
    .select('id')
    .single();
  if (error || !session) return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  });

  const { data: auth } = await svc.auth.admin.getUserById(userId);
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'impersonation.started',
    targetUserId: userId,
    targetUserEmail: auth?.user?.email ?? undefined,
    details: { sessionId: session.id },
  });

  return NextResponse.json({ success: true });
}
