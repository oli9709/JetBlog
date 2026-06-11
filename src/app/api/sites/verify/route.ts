import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encryptText } from '@/lib/utils/encryption';
import { SupabaseInsertSite } from '@/lib/API/Database/sites/mutations';
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

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json(
          { ok: false, errorCode: 'unknown', error: 'Tizimga kirish talab etiladi!' },
          { status: 401 }
        );
      }
      const userId = session.user.id;

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
      const adapterCfg = (body.adapter_config ?? {}) as Record<string, string>;

      // ── Webhook ───────────────────────────────────────────────────────────
      if (platform === 'webhook') {
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

        // /api/jetblog GET tekshiruv
        try {
          const testUrl = endpointUrl.replace(/\/?$/, '') + '/api/jetblog';
          const res = await fetch(testUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(10_000),
          });

          if (res.ok) {
            let data: Record<string, unknown> = {};
            try { data = await res.json() as Record<string, unknown>; } catch { /* non-JSON ok */ }

            if (data.status === 'JetBlog webhook active') {
              // Muvaffaqiyatli — DB ga saqlash
              const insert = await SupabaseInsertSite({
                user_id: userId,
                url: endpointUrl,
                wp_username: '',
                wp_password: '',
                brand_voice: DEFAULT_BRAND_VOICE,
                publish_days: ['Monday', 'Wednesday', 'Friday'],
                publish_time: '09:00:00',
                is_active: true,
                platform_type: 'webhook',
                adapter_config: { endpointUrl, secretKey },
              });
              if (insert.error) {
                return NextResponse.json({ ok: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' });
              }
              return NextResponse.json({ ok: true, success: true, steps: { dns: true, auth: true, write: true }, site: insert.data });
            }
          }

          return NextResponse.json({ ok: false, errorCode: 'webhook_not_found', step: 'dns', error: 'Endpoint topilmadi' });
        } catch {
          return NextResponse.json({ ok: false, errorCode: 'webhook_not_found', step: 'dns', error: "Saytga ulanib bo'lmadi" });
        }
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
          const insert = await SupabaseInsertSite({
            user_id: userId,
            url: rawUrl,
            wp_username,
            wp_password: encryptText(wp_password),
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'wordpress',
            adapter_config: {},
          });
          if (insert.error) {
            return NextResponse.json({ ok: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' });
          }
          return NextResponse.json({ ok: true, success: true, steps: { dns: true, auth: true, write: true }, site: insert.data });
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

          const encryptedPassword = encryptText(wp_password);
          const insert = await SupabaseInsertSite({
            user_id: userId,
            url: rawUrl,
            wp_username,
            wp_password: encryptedPassword,
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'wordpress',
            adapter_config: {},
          });
          if (insert.error) {
            return NextResponse.json({ ok: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' });
          }
          return NextResponse.json({ ok: true, success: true, steps: { dns: true, auth: true, write: true }, site: insert.data });
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

          const insert = await SupabaseInsertSite({
            user_id: userId,
            url: rawUrl,
            wp_username: '',
            wp_password: '',
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'ghost',
            adapter_config: { apiUrl, adminApiKey },
          });
          if (insert.error) {
            return NextResponse.json({ ok: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' });
          }
          return NextResponse.json({ ok: true, success: true, steps: { dns: true, auth: true, write: true }, site: insert.data });
        } catch {
          return NextResponse.json({ ok: false, errorCode: 'ghost_auth_failed', step: 'auth', error: "Ghost ga ulanib bo'lmadi" });
        }
      }

      // ── Webflow ───────────────────────────────────────────────────────────
      if (platform === 'webflow') {
        const token        = adapterCfg.token ?? '';
        const collectionId = adapterCfg.collectionId ?? adapterCfg.collection_id ?? '';

        if (!token) {
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: 'API token kiritilmagan' });
        }

        try {
          const res = await fetch('https://api.webflow.com/v2/sites', {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
            signal: AbortSignal.timeout(15_000),
          });

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: "API token noto'g'ri" });
          }
          if (res.status === 402) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_free_plan', step: 'auth', error: 'Webflow bepul plan CMS API ni qo\'llab-quvvatlamaydi' });
          }
          if (!res.ok) {
            return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: `Webflow API xatosi: ${res.status}` });
          }

          const insert = await SupabaseInsertSite({
            user_id: userId,
            url: rawUrl,
            wp_username: '',
            wp_password: '',
            brand_voice: DEFAULT_BRAND_VOICE,
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'webhook', // webflow DB'da webhook tipida saqlanadi
            adapter_config: { token, collectionId },
          });
          if (insert.error) {
            return NextResponse.json({ ok: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' });
          }
          return NextResponse.json({ ok: true, success: true, steps: { dns: true, auth: true, write: true }, site: insert.data });
        } catch {
          return NextResponse.json({ ok: false, errorCode: 'webflow_auth_failed', step: 'auth', error: "Webflow ga ulanib bo'lmadi" });
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
