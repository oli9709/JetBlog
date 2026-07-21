import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';

const Body = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().email(),
  confirmText: z.string(),
});

export async function POST(req: Request) {
  // Only super_admin can permanently delete
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { userId, confirmEmail, confirmText } = parsed.data;

  if (confirmText.trim() !== 'DELETE') {
    return NextResponse.json({ error: 'Confirmation text must be "DELETE"' }, { status: 400 });
  }

  const svc = adminServiceClient();
  const { data: auth } = await svc.auth.admin.getUserById(userId);
  const email = auth?.user?.email ?? '';
  if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Confirmation email does not match' }, { status: 400 });
  }

  const { data: profile } = await svc.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (profile?.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot delete super_admin' }, { status: 403 });
  }

  // Log FIRST — after delete, target_user_id will be null (CASCADE SET NULL)
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'user.deleted_permanently',
    targetUserId: userId,
    targetUserEmail: email,
  });

  const { error } = await svc.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
