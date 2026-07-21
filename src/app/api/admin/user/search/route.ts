import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdmin, adminServiceClient } from '@/lib/API/Services/admin/guard';

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const email = (url.searchParams.get('email') ?? '').trim().toLowerCase();
  if (email.length < 3) return NextResponse.json({ user: null });

  const svc = adminServiceClient();
  const { data: authList } = await svc.auth.admin.listUsers({ perPage: 200, page: 1 });
  const found = (authList?.users as Array<{ id: string; email?: string }>)?.find(
    (u) => (u.email ?? '').toLowerCase() === email
  );
  if (!found) return NextResponse.json({ user: null });

  const { data: profile } = await svc
    .from('profiles')
    .select('role')
    .eq('id', found.id)
    .maybeSingle();

  return NextResponse.json({
    user: { id: found.id, email: found.email, role: profile?.role ?? 'user' },
  });
}
