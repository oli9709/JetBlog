import { NextResponse } from 'next/server';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { getGSCStats } from '@/lib/API/Services/gsc/fetch';
import { refreshGSCToken } from '@/lib/API/Services/gsc/refresh';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'siteId talab qilinadi' }, { status: 400 });
    }

    const supabase = await SupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get token for this site
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('gsc_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('site_id', siteId)
      .single();

    if (tokenErr || !tokenRow) {
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    let accessToken = tokenRow.access_token;

    // Refresh if expired (with 60s buffer)
    if (new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000)) {
      if (!tokenRow.refresh_token) {
        return NextResponse.json({ connected: false, error: 'Token muddati tugagan, qayta ulang' }, { status: 200 });
      }

      const refreshed = await refreshGSCToken(tokenRow.refresh_token);

      if (refreshed.error) {
        return NextResponse.json({ connected: false, error: 'Token yangilashda xatolik, qayta ulang' }, { status: 200 });
      }

      accessToken = refreshed.access_token;
      await supabase.from('gsc_tokens').update({
        access_token: refreshed.access_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', tokenRow.id);
    }

    if (!tokenRow.gsc_site_url) {
      return NextResponse.json({ connected: true, noSite: true }, { status: 200 });
    }

    const stats = await getGSCStats(accessToken, tokenRow.gsc_site_url);

    return NextResponse.json({
      connected: true,
      gscSiteUrl: tokenRow.gsc_site_url,
      stats
    });
  } catch (err: any) {
    console.error('GSC stats error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
