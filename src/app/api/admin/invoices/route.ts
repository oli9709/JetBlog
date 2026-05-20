import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await adminClient
      .from('profiles').select('is_admin').eq('id', session.user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Invoicelarni email bilan birga olish
    const { data: invoices, error } = await adminClient
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // User emaillarini qo'shish
    const userIds = Array.from(new Set((invoices || []).map(i => i.user_id)));
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    (authUsers?.users || []).forEach(u => { if (u.email) emailMap[u.id] = u.email; });

    const enriched = (invoices || []).map(i => ({ ...i, user_email: emailMap[i.user_id] || null }));

    return NextResponse.json({ success: true, invoices: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
