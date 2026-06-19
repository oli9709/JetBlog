import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { refreshGSCToken } from '@/lib/API/Services/gsc/refresh';

/**
 * Google Indexing API orqali nashr etilgan URL ni indekslashga yuborish.
 *
 * Eslatmalar:
 * - Google Indexing API odatda faqat `Employer` yoki news hamkorlari uchun ochiq.
 *   Umumiy saytlar uchun 403 qaytarishi mumkin — bu holat non-fatal hisoblanadi.
 * - Token scope: foydalanuvchining GSC access_token da `https://www.googleapis.com/auth/indexing`
 *   scope bo'lishi kerak. Agar yo'q bo'lsa — xatolik log qilinadi, throw qilinmaydi.
 * - Barcha xatolar non-fatal: log + Sentry.
 */
export async function submitGSCIndexing(
  siteId: string,
  userId: string,
  publishedUrl: string
): Promise<void> {
  try {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // GSC tokenini olish
    const { data: tokenRow, error: tokenErr } = await serviceClient
      .from('gsc_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      console.log('[GSC Indexing] No GSC token found for this site — skipping');
      return;
    }

    // GSC property URL ni URL bilan solishtirish
    const gscSiteUrl: string = tokenRow.gsc_site_url || '';
    if (gscSiteUrl) {
      const publishedHost = new URL(publishedUrl).hostname.replace(/^www\./, '');
      const gscHost = gscSiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
      if (!gscHost.includes(publishedHost) && !publishedHost.includes(gscHost)) {
        console.log(`[GSC Indexing] Domain mismatch: GSC="${gscHost}" vs published="${publishedHost}" — skipping`);
        return;
      }
    }

    // Token yangilash (60s buffer)
    let accessToken: string = tokenRow.access_token;
    if (new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000)) {
      if (!tokenRow.refresh_token) {
        console.log('[GSC Indexing] Token expired and no refresh_token — skipping');
        return;
      }
      const refreshed = await refreshGSCToken(tokenRow.refresh_token as string);
      if (refreshed.error || !refreshed.access_token) {
        console.warn('[GSC Indexing] Token refresh failed:', refreshed.error);
        return;
      }
      accessToken = refreshed.access_token;
      await serviceClient
        .from('gsc_tokens')
        .update({
          access_token: refreshed.access_token,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenRow.id);
    }

    // Google Indexing API chaqiruvi
    const res = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: publishedUrl, type: 'URL_UPDATED' }),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (res.ok) {
      console.log(`[GSC Indexing] URL_UPDATED submitted: ${publishedUrl}`);
    } else {
      const body = await res.text().catch(() => '');
      if (res.status === 403 || res.status === 400) {
        // Umumiy holat: Indexing API bu sayt turi uchun yoqilmagan
        console.log(`[GSC Indexing] API not available for this property (${res.status}): ${body.slice(0, 120)}`);
      } else {
        console.warn(`[GSC Indexing] Non-OK response (${res.status}): ${body.slice(0, 200)}`);
      }
    }
  } catch (err: unknown) {
    console.error('[GSC Indexing] Unexpected error (non-fatal):', err);
    if (err instanceof Error) Sentry.captureException(err, { tags: { feature: 'gsc-indexing' } });
  }
}
