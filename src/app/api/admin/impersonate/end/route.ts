import 'server-only';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';
import { IMPERSONATION_COOKIE } from '@/lib/API/Services/admin/impersonation';

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

  const svc = adminServiceClient();
  if (sessionId) {
    await svc
      .from('admin_impersonation_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('admin_id', admin.id);
  }
  cookieStore.delete(IMPERSONATION_COOKIE);

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'impersonation.ended',
    details: { sessionId },
  });

  return NextResponse.json({ success: true });
}
