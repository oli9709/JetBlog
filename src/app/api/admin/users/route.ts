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

    const [profilesRes, authRes, sitesRes, articlesRes] = await Promise.all([
      adminClient.from('profiles').select('id, plan, credits_remaining, is_admin, created_at'),
      adminClient.auth.admin.listUsers(),
      adminClient.from('sites').select('id, user_id'),
      adminClient.from('articles').select('id, site_id')
    ]);

    const emailMap: Record<string, string> = {};
    const createdMap: Record<string, string> = {};
    (authRes.data?.users || []).forEach(u => {
      if (u.email) emailMap[u.id] = u.email;
      createdMap[u.id] = u.created_at;
    });

    // Site id → user_id mapping
    const siteUserMap: Record<string, string> = {};
    (sitesRes.data || []).forEach(s => { siteUserMap[s.id] = s.user_id; });

    const sitesCountMap: Record<string, number> = {};
    (sitesRes.data || []).forEach(s => {
      sitesCountMap[s.user_id] = (sitesCountMap[s.user_id] || 0) + 1;
    });

    // Articles count per user (via site)
    const articlesCountMap: Record<string, number> = {};
    (articlesRes.data || []).forEach(a => {
      const uid = siteUserMap[a.site_id];
      if (uid) articlesCountMap[uid] = (articlesCountMap[uid] || 0) + 1;
    });

    const users = (profilesRes.data || []).map(p => ({
      id: p.id,
      email: emailMap[p.id] || p.id.slice(0, 8),
      plan: p.plan || 'FREE',
      credits_remaining: p.credits_remaining ?? 0,
      is_admin: p.is_admin ?? false,
      created_at: createdMap[p.id] || p.created_at,
      sites_count: sitesCountMap[p.id] || 0,
      articles_count: articlesCountMap[p.id] || 0
    }));

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
