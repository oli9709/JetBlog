import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { encryptText } from '@/lib/utils/encryption';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import jwt from 'jsonwebtoken';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  const u = (raw ?? '').trim().replace(/\/$/, '');
  if (!u) return u;
  if (!u.startsWith('http://') && !u.startsWith('https://')) return 'https://' + u;
  return u;
}

function isLocalhost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    );
  } catch { return false; }
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

function buildGhostJwt(keyId: string, keySecret: string): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iat: now, exp: now + 300, aud: '/admin/' },
    Buffer.from(keySecret, 'hex'),
    { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT', kid: keyId } }
  );
}

// ─── Saqlash ──────────────────────────────────────────────────────────────────

type BrandVoice = {
  voice_description: string;
  tone: string;
  target_audience: string;
  rules: string[];
};

const DEFAULT_BRAND_VOICE: BrandVoice = {
  voice_description: '',
  tone: 'professional',
  target_audience: 'umumiylik',
  rules: [],
};

// ─── Inline insert helper ─────────────────────────────────────────────────────
// Uses the SAME authenticated supabase client from the route handler so
// auth.uid() is guaranteed to match the verified session — RLS passes.

async function insertSite(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<NextResponse | null> {
  const { data, error } = await supabase
    .from('sites')
    .insert([payload])
    .select()
    .single();

  if (error) {
    // Log the full Postgres error so Vercel logs show the real cause
    console.error('[sites/verify] INSERT failed:', JSON.stringify({
      code:    error.code,
      message: error.message,
      details: error.details,
      hint:    error.hint,
    }));
    return NextResponse.json({
      ok: false,
      errorCode: 'db_error',
      error: `Bazaga saqlashda xatolik: ${error.message}`,
    });
  }

  return NextResponse.json({
    ok: true,
    success: true,
    steps: { dns: true, auth: true, write: true },
    site: data,
  });
}

// ─── Route ────────────────────────────────────────────────────────────────────

/**
 * POST /api/sites/verify
 *
 * WordPress: { platform_type: 'wordpress', url, wp_username, wp_password }
 * Ghost:     { platform_type: 'ghost', url, adapter_config: { apiUrl, adminApiKey } }
 * Webflow:   { platform_type: 'webflow', url, adapter_config: { token, collectionId } }
 * Webhook:   { platform_type: 'webhook', url, adapter_config: { endpointUrl, secretKey } }
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.verify, async () => {
    try {
      // ── Auth ──────────────────────────────────────────────────────────────
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(list) {
              list.forEach(({ name, value, options }) => {
                try { cookieStore.set(name, value, options); } catch { /* read-only */ }
              });
            },
          },
        }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { ok: false, errorCode: 'unknown', error: 'Tizimga kirish talab etiladi!' },
          { status: 401 }
        );
      }
      const userId = user.id;

      // ── Body ──────────────────────────────────────────────────────────────
      let body: Record<string, unknown>;
      try {
        body = await request.json() as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          { ok: false, errorCode: 'unknown', error: 'So\'rov tanasi noto\'g\'ri' },
          { status: 200 }
        );
      }

      const platform = ((body.platform_type ?? body.platform) as string | undefined) ?? 'wordpress';

      // Article generation / autopilot language — DB CHECK allows uz/en/ru; default 'uz'
      const allowedLangs = ['uz', 'en', 'ru'] as const;
      const bodyLang = (body.default_language as string | undefined) ?? 'uz';
      const defaultLanguage: 'uz' | 'en' | 'ru' =
        (allowedLangs as readonly string[]).includes(bodyLang) ? (bodyLang as 'uz' | 'en' | 'ru') : 'uz';
      const adapterCfg = (body.adapter_config ?? {}) as Record<string, string>;

      // ── Webhook ───────────────────────────────────────────────────────────
      if (platform === 'webhook') {
        // Diagnostic: log the raw incoming fields so we can confirm what the client sent
        console.log('[webhook/verify] incoming body fields:', JSON.stringify({
          url:            body.url,
          platform_type:  body.platform_type,
          adapter_config: body.adapter_config,
        }));
        const endpointUrl = normalizeUrl(adapterCfg.endpointUrl ?? (body.url as string) ?? '');
        const secretKey   = adapterCfg.secretKey ?? '';

        if (!endpointUrl) {
          return NextResponse.json({ ok: false, errorCode: 'dns_invalid_url', step: 'dns', error: 'URL kiritilmagan' });
        }
        if (!isValidUrl(endpointUrl)) {
          return NextResponse.json({ ok: false, errorCode: 'dns_invalid_url', step: 'dns', error: "URL format noto'g'ri" });
        }
        if (isLocalhost(endpointUrl)) {
          return NextResponse.json({ ok: false, errorCode: 'webhook_localhost', step: 'dns', error: "Localhost tekshirib bo'lmaydi" });
        }

        // /api/jetblog GET tekshiruv — with one retry for cold-start hosts (e.g. Render free tier)
        // Strip /api/jetblog suffix if the user pasted the full probe URL as the endpoint,
        // then re-append it — so both "https://example.com" and "https://example.com/api/jetblog"
        // resolve to the same correct probe target.
        const baseUrl = endpointUrl.replace(/\/api\/jetblog\/?$/, '').replace(/\/?$/, '');
        const testUrl = baseUrl + '/api/jetblog';
        console.log('[webhook/verify] endpointUrl:', endpointUrl, '→ probing:', testUrl);

        const probeJetblog = async (): Promise<{ ok: boolean; errorCode?: string; detail?: string }> => {
          for (let attempt = 1; attempt <= 2; attempt++) {
            let httpStatus: number | null = null;
            let rawBody = '';
            try {
              const res = await fetch(testUrl, {
                method: 'GET',
                // 15s per attempt; cold-start hosts return fast 503, not a long hang
                signal: AbortSignal.timeout(15_000),
              });
              httpStatus = res.status;

              // Always read body so we can log it and check the status string
              // even if the HTTP status is non-2xx (e.g. mis-configured 503 that
              // still returns the correct JSON payload).
              try { rawBody = await res.text(); } catch { rawBody = '(unreadable)'; }

              // Try to parse as JSON regardless of res.ok
              let data: Record<string, unknown> = {};
              try { data = JSON.parse(rawBody) as Record<string, unknown>; } catch { /* not JSON */ }

              const statusVal = (data.status as string | undefined ?? '').trim();
              const matched = statusVal === 'JetBlog webhook active';

              console.log(
                `[webhook/verify] attempt=${attempt} status=${httpStatus} matched=${matched}` +
                ` body=${rawBody.slice(0, 200)}`
              );

              if (matched) return { ok: true };

              // 5xx on attempt 1 → retry (cold start); any other failure is final
              if (attempt === 1 && httpStatus !== null && httpStatus >= 500) {
                console.log('[webhook/verify] 5xx on attempt 1, waiting 4s before retry…');
                await new Promise(r => setTimeout(r, 4_000));
                continue;
              }

              // Final failure — build a descriptive detail string
              const detail = httpStatus !== null
                ? `HTTP ${httpStatus} — body: ${rawBody.slice(0, 300)}`
                : `no response`;
              return { ok: false, errorCode: 'webhook_not_found', detail };

            } catch (err: unknown) {
              const errName = err instanceof Error ? err.name : 'UnknownError';
              const errMsg  = err instanceof Error ? err.message : String(err);
              console.error(
                `[webhook/verify] attempt=${attempt} fetch threw ${errName}: ${errMsg}`
              );

              // AbortError = timeout; retry once
              if (attempt === 1 && errName === 'AbortError') {
                console.log('[webhook/verify] timeout on attempt 1, retrying…');
                await new Promise(r => setTimeout(r, 2_000));
                continue;
              }

              // Network error or second timeout
              const isColdStart = errName === 'AbortError';
              return {
                ok: false,
                errorCode: isColdStart ? 'webhook_cold_start' : 'webhook_not_found',
                detail: `${errName}: ${errMsg}`,
              };
            }
          }
          // Should never reach here
          return { ok: false, errorCode: 'webhook_not_found', detail: 'max attempts exceeded' };
        }

        const probe = await probeJetblog();

        if (!probe.ok) {
          console.error('[webhook/verify] FAILED', probe);
          const isColdStart = probe.errorCode === 'webhook_cold_start';
          return NextResponse.json({
            ok: false,
            errorCode: probe.errorCode,
            step: 'dns',
            error: isColdStart
              ? "Server uyg'onmoqda (Render free tier). 60 soniyadan keyin qayta urinib ko'ring."
              : `Endpoint topilmadi: ${probe.detail}`,
          });
        }

        // Store the clean base URL (not the /api/jetblog probe path) so cron jobs
        // can append /api/jetblog themselves without doubling the path.
        return await insertSite(supabase, {
          user_id: userId,
          url: baseUrl,
          wp_username: '',
          wp_password: '',
          brand_voice: DEFAULT_BRAND_VOICE,
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'webhook',
          default_language: defaultLanguage,
          adapter_config: { endpointUrl: baseUrl, secretKey: secretKey ? encryptText(secretKey) : '' },
        });
      }

      // ── Umumiy URL tekshiruv ───────────────────────────────────────────────
      const rawUrl = normalizeUrl((body.url as string) ?? '');
      if (!rawUrl) {
        return NextResponse.json({ ok: false, errorCode: 'dns_invalid_url', step: 'dns', error: 'URL kiritilmagan' });
      }
      if (!isValidUrl(rawUrl)) {
        return NextResponse.json(
          { ok: false, errorCode: 'dns_invalid_url', step: 'dns', error: "URL format noto'g'ri", hint: 'Masalan: https://saytingiz.com' },
          { status: 200 }
        );
      }

      // ── WordPress ─────────────────────────────────────────────────────────
      if (platform === 'wordpress') {
        const wp_username = (body.wp_username as string) ?? adapterCfg.username ?? '';
        const wp_password = (body.wp_password as string) ?? adapterCfg.password ?? '';

        if (!wp_username || !wp_password) {
          return NextResponse.json({ ok: false, errorCode: 'wp_auth_failed', step: 'auth', error: 'Username va parol kerak' });
        }

        // Local sayt — tekshiruvni o'tkazib yuborish
        if (isLocalhost(rawUrl)) {
          return await insertSite(supabase, {
            user_id: userId,
            url: rawUrl,
            wp_username,
            wp_password: encryptText(wp_password),
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'wordpress',
            default_language: defaultLanguage,
            adapter_config: {},
          });
        }

        try {
          const wpApiUrl = rawUrl + '/wp-json/wp/v2/posts?per_page=1';
          const credentials = Buffer.from(`${wp_username}:${wp_password}`).toString('base64');

          const res = await fetch(wpApiUrl, {
            headers: { Authorization: `Basic ${credentials}` },
            signal: AbortSignal.timeout(15_000),
          });

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ ok: false, errorCode: 'wp_auth_failed', step: 'auth', error: 'Autentifikatsiya xatosi' });
          }
          if (!res.ok) {
            return NextResponse.json({ ok: false, errorCode: 'wp_not_found', step: 'dns', error: 'WordPress REST API topilmadi' });
          }

          return await insertSite(supabase, {
            user_id: userId,
            url: rawUrl,
            wp_username,
            wp_password: encryptText(wp_password),
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'wordpress',
            default_language: defaultLanguage,
            adapter_config: {},
          });
        } catch {
          return NextResponse.json({ ok: false, errorCode: 'wp_not_found', step: 'dns', error: "WordPress ga ulanib bo'lmadi" });
        }
      }

      // ── Ghost ─────────────────────────────────────────────────────────────
      if (platform === 'ghost') {
        const apiUrl     = normalizeUrl(adapterCfg.apiUrl ?? rawUrl);
        const adminApiKey = adapterCfg.adminApiKey ?? '';

        if (!adminApiKey || !adminApiKey.includes(':')) {
          return NextResponse.json({ ok: false, errorCode: 'ghost_auth_failed', step: 'auth', error: "Admin API Key noto'g'ri formatda (id:secret bo'lishi kerak)" });
        }

        try {
          const [keyId, keySecret] = adminApiKey.split(':');
          const ghostJwt = buildGhostJwt(keyId, keySecret);

          const ghostApiUrl = apiUrl + '/ghost/api/admin/posts/?limit=1';
          const res = await fetch(ghostApiUrl, {
            headers: {
              Authorization: `Ghost ${ghostJwt}`,
              'Content-Type': 'application/json',
              'Accept-Version': 'v5.0',
            },
            signal: AbortSignal.timeout(15_000),
          });

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ ok: false, errorCode: 'ghost_auth_failed', step: 'auth', error: "Admin API Key noto'g'ri" });
          }
          if (!res.ok) {
            return NextResponse.json({ ok: false, errorCode: 'ghost_auth_failed', step: 'auth', error: `Ghost API xatosi: ${res.status}` });
          }

          return await insertSite(supabase, {
            user_id: userId,
            url: rawUrl,
            wp_username: '',
            wp_password: '',
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'ghost',
            default_language: defaultLanguage,
            adapter_config: { apiUrl, adminApiKey: encryptText(adminApiKey) },
          });
        } catch {
          return NextResponse.json({ ok: false, errorCode: 'ghost_auth_failed', step: 'auth', error: "Ghost ga ulanib bo'lmadi" });
        }
      }

      // ── Webflow ───────────────────────────────────────────────────────────
      if (platform === 'webflow') {
        // adapter_config dan maydonlarni olish (ConnectionTest tomonidan yuboriladi)
        const token          = adapterCfg.apiToken ?? adapterCfg.token ?? '';
        const siteId         = adapterCfg.siteId ?? '';
        const collectionId   = adapterCfg.collectionId ?? adapterCfg.collection_id ?? '';
        const collectionSlug = adapterCfg.collectionSlug ?? 'posts';
        const siteDomain     = adapterCfg.siteDomain ?? '';
        const fieldMap       = (adapterCfg.fieldMap ?? {}) as Record<string, string>;

        if (!token) {
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: 'API token kiritilmagan' });
        }
        if (!collectionId) {
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: 'Kolleksiya tanlanmagan' });
        }
        if (!fieldMap.body) {
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: "Kontent maydoni (body) xaritasiz bo'lmaydi" });
        }

        try {
          // Kolleksiyani GET qilib tekshirish — token + ID ni bir vaqtda validates qiladi
          const res = await fetch(`https://api.webflow.com/v2/collections/${collectionId}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: AbortSignal.timeout(10_000),
          });

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: "API token noto'g'ri yoki ruxsat yo'q" });
          }
          if (res.status === 402) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_free_plan', step: 'auth', error: "Webflow bepul plan CMS API ni qo'llab-quvvatlamaydi" });
          }
          if (res.status === 404) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: 'Kolleksiya topilmadi. Collection ID ni tekshiring' });
          }
          if (!res.ok) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: `Webflow API xatosi: ${res.status}` });
          }

          // DB ga saqlash — apiToken shifrlangan holda
          return await insertSite(supabase, {
            user_id: userId,
            url: rawUrl,
            wp_username: '',
            wp_password: '',
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'webflow',
            default_language: defaultLanguage,
            adapter_config: {
              apiToken:       encryptText(token),
              siteId,
              collectionId,
              collectionSlug,
              siteDomain,
              fieldMap,
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Webflow ga ulanib bo'lmadi";
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: msg });
        }
      }

      // ── Noto'g'ri platform ────────────────────────────────────────────────
      return NextResponse.json({ ok: false, errorCode: 'unknown', error: `Noto'g'ri platform_type: ${platform}` });

    } catch (err: unknown) {
      // Hech qachon 500 qaytarmasin
      console.error('[sites/verify] unhandled error:', err);
      return NextResponse.json(
        { ok: false, errorCode: 'unknown', step: 'dns', error: 'Xato yuz berdi. Qayta urinib ko\'ring.' },
        { status: 200 }
      );
    }
  });
}
