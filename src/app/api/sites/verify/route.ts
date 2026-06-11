import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encryptText } from '@/lib/utils/encryption';
import { SupabaseInsertSite } from '@/lib/API/Database/sites/mutations';
import { WordPressAdapter } from '@/lib/adapters/wordpress';
import { GhostAdapter } from '@/lib/adapters/ghost';
import { WebhookAdapter } from '@/lib/adapters/webhook';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';

function normalizeUrl(raw: string): string {
  const u = (raw ?? '').trim();
  if (!u) return u;
  if (!u.startsWith('http://') && !u.startsWith('https://')) return 'https://' + u;
  return u;
}

function isLocalhost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
  } catch { return false; }
}

function wpErrorCode(error: string): string {
  if (/401|403|unauthorized|forbidden/i.test(error)) return 'wp_auth_failed';
  return 'wp_not_found';
}

function ghostErrorCode(error: string): string {
  if (/401|403|unauthorized/i.test(error)) return 'ghost_auth_failed';
  return 'dns_not_found';
}

function webhookErrorCode(error: string): string {
  if (/401|403|signature/i.test(error)) return 'webhook_invalid_signature';
  return 'webhook_not_found';
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/sites/verify
 * Sayt ulanishini tekshirib, muvaffaqiyatli bo'lsa DB ga saqlaydi.
 *
 * WordPress: { platform_type: 'wordpress', url, wp_username, wp_password }
 * Ghost:     { platform_type: 'ghost', url, adapter_config: { apiUrl, adminApiKey } }
 * Webhook:   { platform_type: 'webhook', url, adapter_config: { endpointUrl, secretKey } }
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.verify, async () => {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try { cookieStore.set(name, value, options); } catch { /* read-only */ }
            });
          },
        },
      });

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json({ success: false, error: 'Tizimga kirish talab etiladi!' }, { status: 401 });
      }

      const userId = session.user.id;
      const body = await request.json();
      const platform = (body.platform_type as string) || 'wordpress';

      // ── WordPress ────────────────────────────────────────────────────────────
      if (platform === 'wordpress') {
        let { url, wp_username, wp_password } = body as { url: string; wp_username: string; wp_password: string };
        url = normalizeUrl(url);
        if (!url || !wp_username || !wp_password) {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: 'url, wp_username va wp_password kerak!' }, { status: 400 });
        }
        try { new URL(url); } catch {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: "URL format noto'g'ri", hint: 'Masalan: https://saytingiz.com' }, { status: 400 });
        }

        // Local sayt — API tekshiruvini o'tkazib yuborish
        if (isLocalhost(url)) {
          const insertResult = await SupabaseInsertSite({
            user_id: userId, url, wp_username,
            wp_password: encryptText(wp_password),
            brand_voice: { tone: 'professional', voice_description: '', target_audience: '', rules: [] },
            publish_days: ['Monday', 'Wednesday', 'Friday'],
            publish_time: '09:00:00',
            is_active: true,
            platform_type: 'wordpress',
            adapter_config: {},
          });
          if (insertResult.error) return NextResponse.json({ success: false, errorCode: 'unknown', error: 'Bazaga saqlashda xatolik' }, { status: 500 });
          return NextResponse.json({ success: true, message: 'Local sayt ulandi!', site: insertResult.data });
        }

        const encryptedPassword = encryptText(wp_password);
        const adapter = new WordPressAdapter(url, wp_username, encryptedPassword);
        const verify = await adapter.verify();
        if (!verify.ok) {
          return NextResponse.json({ success: false, errorCode: wpErrorCode(verify.error ?? ''), error: verify.error }, { status: 400 });
        }

        const insertResult = await SupabaseInsertSite({
          user_id: userId, url, wp_username,
          wp_password: encryptedPassword,
          brand_voice: { voice_description: '', tone: 'professional', target_audience: 'umumiylik', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'wordpress',
          adapter_config: {},
        });

        if (insertResult.error) return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik yuz berdi.' }, { status: 500 });
        return NextResponse.json({ success: true, message: 'WordPress sayti muvaffaqiyatli ulandi!', site: insertResult.data });
      }

      // ── Ghost ─────────────────────────────────────────────────────────────────
      if (platform === 'ghost') {
        const { adapter_config } = body as { adapter_config?: { apiUrl?: string; adminApiKey?: string } };
        let url = normalizeUrl((body as { url?: string }).url ?? '');
        const apiUrl = normalizeUrl(adapter_config?.apiUrl ?? url);
        const adminApiKey = adapter_config?.adminApiKey ?? '';
        if (!apiUrl || !adminApiKey) {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: 'url va adapter_config.adminApiKey kerak!' }, { status: 400 });
        }
        try { new URL(apiUrl); } catch {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: "URL format noto'g'ri" }, { status: 400 });
        }
        url = url || apiUrl;

        let adapter: GhostAdapter;
        try {
          adapter = new GhostAdapter(apiUrl, adminApiKey);
        } catch (err: unknown) {
          return NextResponse.json({ success: false, errorCode: 'ghost_auth_failed', error: err instanceof Error ? err.message : 'Ghost config xatosi' }, { status: 400 });
        }

        const verify = await adapter.verify();
        if (!verify.ok) return NextResponse.json({ success: false, errorCode: ghostErrorCode(verify.error ?? ''), error: verify.error }, { status: 400 });

        const insertResult = await SupabaseInsertSite({
          user_id: userId, url, wp_username: '', wp_password: '',
          brand_voice: { voice_description: '', tone: 'professional', target_audience: 'umumiylik', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'ghost',
          adapter_config: { apiUrl, adminApiKey },
        });

        if (insertResult.error) return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik yuz berdi.' }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Ghost sayti muvaffaqiyatli ulandi!', site: insertResult.data });
      }

      // ── Webhook ───────────────────────────────────────────────────────────────
      if (platform === 'webhook') {
        const { adapter_config } = body as { adapter_config?: { endpointUrl?: string; secretKey?: string } };
        const endpointUrl = normalizeUrl(adapter_config?.endpointUrl ?? (body as { url?: string }).url ?? '');
        const secretKey   = adapter_config?.secretKey ?? '';

        if (!endpointUrl || !secretKey) {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: 'endpointUrl va secretKey kerak!' }, { status: 400 });
        }
        try { new URL(endpointUrl); } catch {
          return NextResponse.json({ success: false, errorCode: 'dns_invalid_url', error: "URL format noto'g'ri", hint: 'Masalan: https://saytingiz.com/api/jetblog' }, { status: 400 });
        }
        if (isLocalhost(endpointUrl)) {
          return NextResponse.json({ success: false, errorCode: 'webhook_localhost', error: 'Localhost tekshirib bo\'lmaydi' }, { status: 400 });
        }

        const adapter = new WebhookAdapter(endpointUrl, secretKey);
        const verify = await adapter.verify();
        if (!verify.ok) return NextResponse.json({ success: false, errorCode: webhookErrorCode(verify.error ?? ''), error: verify.error }, { status: 400 });

        const insertResult = await SupabaseInsertSite({
          user_id: userId, url: endpointUrl, wp_username: '', wp_password: '',
          brand_voice: { voice_description: '', tone: 'professional', target_audience: 'umumiylik', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'webhook',
          adapter_config: { endpointUrl, secretKey },
        });

        if (insertResult.error) return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik yuz berdi.' }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Webhook muvaffaqiyatli ulandi!', site: insertResult.data });
      }

      return NextResponse.json({ success: false, error: `Noto\'g\'ri platform_type: ${platform}` }, { status: 400 });
    } catch (error: unknown) {
      console.error('Sites verify route error:', error);
      return NextResponse.json({ success: false, error: 'Tizim ichki xatoligi yuz berdi.' }, { status: 500 });
    }
  });
}
