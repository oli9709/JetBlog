import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { SiteT } from '@/lib/types/supabase';
import { decryptText } from '@/lib/utils/encryption';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** UUID ni IndexNow uchun hex string formatga keltirish */
function generateKey(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * WordPress saytga IndexNow kaliti faylini yuklash (best-effort).
 * WP /wp-json/wp/v2/media endpoint orqali text/plain faylni yuklaydi.
 * Agar hosting yoki WP sozlamalari ruxsat bermasa — xato log qilinadi, throw qilinmaydi.
 */
async function uploadKeyFileToWordPress(
  baseUrl: string,
  authHeader: string,
  key: string
): Promise<boolean> {
  try {
    const filename = `${key}.txt`;
    const res = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'text/plain',
      },
      body: key,
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      console.log(`[IndexNow] Key file uploaded to WP: /${filename}`);
      return true;
    }

    // 422 = unprocessable (file type not allowed by WP) — umumiy holat
    const text = await res.text().catch(() => '');
    console.warn(`[IndexNow] WP key file upload failed (${res.status}): ${text.slice(0, 120)}`);
    console.warn('[IndexNow] Key file upload to WP failed. User should manually upload the key file.');
    return false;
  } catch (err) {
    console.warn('[IndexNow] Key file upload error (non-fatal):', err);
    return false;
  }
}

/**
 * IndexNow ga URL yuborish.
 *
 * Faqat WordPress saytlari uchun ishlaydi — Ghost/Webhook key faylni host qila olmaydi.
 * Barcha xatolar non-fatal: log + Sentry, throw qilinmaydi.
 */
export async function submitIndexNow(
  site: SiteT,
  publishedUrl: string
): Promise<void> {
  // Ghost va Webhook saytlari key faylni host qila olmaydi — o'tkazib yuborish
  if (site.platform_type !== 'wordpress') {
    console.log(`[IndexNow] skipped: cannot host key file on platform "${site.platform_type}"`);
    return;
  }

  // WordPress sayt url si bo'sh bo'lsa (ma'lumotlar bazasida null) — xavfsiz o'tkazib yuborish
  if (!site.url) {
    console.log('[IndexNow] skipped: no site url');
    return;
  }

  try {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Kalitni olish yoki yangi yaratish
    let key = site.indexnow_key;
    if (!key) {
      key = generateKey();
      const { error } = await serviceClient
        .from('sites')
        .update({ indexnow_key: key })
        .eq('id', site.id);

      if (error) {
        console.warn('[IndexNow] Failed to persist key to DB:', error.message);
        // Kalit saqlanmasa ham davom etamiz (bu sessiyada ishlatamiz)
      }
    }

    const host = new URL(site.url).hostname;
    const siteBase = site.url.replace(/\/$/, '');
    const keyLocation = `${siteBase}/${key}.txt`;

    // Key fayl mavjudligini tekshirish
    const keyFileCheck = await fetch(keyLocation, {
      signal: AbortSignal.timeout(5_000),
    }).catch(() => null);

    if (!keyFileCheck || !keyFileCheck.ok) {
      // Faylni WP orqali yuklashga urinish
      const password = decryptText(site.wp_password || '').replace(/\s+/g, '');
      const authHeader =
        'Basic ' +
        Buffer.from(`${site.wp_username.trim()}:${password}`).toString('base64');

      await uploadKeyFileToWordPress(siteBase, authHeader, key);
    }

    // IndexNow API ga POST yuborish
    const body = {
      host,
      key,
      keyLocation,
      urlList: [publishedUrl],
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Submitted: ${publishedUrl} (status ${res.status})`);
    } else {
      const text = await res.text().catch(() => '');
      console.warn(`[IndexNow] Non-200 response (${res.status}): ${text.slice(0, 200)}`);
    }
  } catch (err: unknown) {
    console.error('[IndexNow] Unexpected error (non-fatal):', err);
    if (err instanceof Error) Sentry.captureException(err, { tags: { feature: 'indexnow' } });
  }
}
