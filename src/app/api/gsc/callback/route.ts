import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const DASHBOARD_URL = '/dashboard/brand-voice';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const siteId = searchParams.get('state') || null;
  const errorParam = searchParams.get('error');

  if (errorParam || !code) {
    return NextResponse.redirect(new URL(`${DASHBOARD_URL}?gsc=error`, request.url));
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
      code
    })
  });

  const tokens = await tokenRes.json();

  if (tokens.error) {
    console.error('GSC token exchange error:', tokens.error);
    return NextResponse.redirect(new URL(`${DASHBOARD_URL}?gsc=error`, request.url));
  }

  // Fetch GSC site list to pick first verified site
  let gscSiteUrl = '';
  try {
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const sitesData = await sitesRes.json();
    gscSiteUrl = sitesData.siteEntry?.[0]?.siteUrl ?? '';
  } catch {
    // Non-fatal — user has no sites yet or API quota
  }

  // Save to Supabase
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const { error: dbError } = await supabase.from('gsc_tokens').upsert(
    {
      user_id: user.id,
      site_id: siteId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
      gsc_site_url: gscSiteUrl,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,site_id' }
  );

  if (dbError) {
    console.error('GSC token save error:', dbError);
    return NextResponse.redirect(new URL(`${DASHBOARD_URL}?gsc=error`, request.url));
  }

  return NextResponse.redirect(new URL(`${DASHBOARD_URL}?gsc=success`, request.url));
}
