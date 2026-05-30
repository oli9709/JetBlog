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
        const { url, wp_username, wp_password } = body;
        if (!url || !wp_username || !wp_password) {
          return NextResponse.json({ success: false, error: 'url, wp_username va wp_password kerak!' }, { status: 400 });
        }

        // Local sayt — API tekshiruvini o'tkazib yuborish
        try {
          const hostname = new URL(url).hostname;
          const isLocal = hostname.endsWith('.local') || hostname === 'localhost' || hostname === '127.0.0.1';
          if (isLocal) {
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
            if (insertResult.error) return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik' }, { status: 500 });
            return NextResponse.json({ success: true, message: 'Local sayt ulandi!', site: insertResult.data });
          }
        } catch { /* URL parse xatosi */ }

        const encryptedPassword = encryptText(wp_password);
        const adapter = new WordPressAdapter(url, wp_username, encryptedPassword);
        const verify = await adapter.verify();
        if (!verify.ok) {
          return NextResponse.json({ success: false, error: verify.error }, { status: 400 });
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
        const { url, adapter_config } = body;
        if (!url || !adapter_config?.apiUrl || !adapter_config?.adminApiKey) {
          return NextResponse.json({ success: false, error: 'url, adapter_config.apiUrl va adapter_config.adminApiKey kerak!' }, { status: 400 });
        }

        let adapter: GhostAdapter;
        try {
          adapter = new GhostAdapter(adapter_config.apiUrl, adapter_config.adminApiKey);
        } catch (err: unknown) {
          return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Ghost config xatosi' }, { status: 400 });
        }

        const verify = await adapter.verify();
        if (!verify.ok) return NextResponse.json({ success: false, error: verify.error }, { status: 400 });

        const insertResult = await SupabaseInsertSite({
          user_id: userId, url, wp_username: '', wp_password: '',
          brand_voice: { voice_description: '', tone: 'professional', target_audience: 'umumiylik', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'ghost',
          adapter_config: { apiUrl: adapter_config.apiUrl, adminApiKey: adapter_config.adminApiKey },
        });

        if (insertResult.error) return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik yuz berdi.' }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Ghost sayti muvaffaqiyatli ulandi!', site: insertResult.data });
      }

      // ── Webhook ───────────────────────────────────────────────────────────────
      if (platform === 'webhook') {
        const { url, adapter_config } = body;
        if (!url || !adapter_config?.endpointUrl || !adapter_config?.secretKey) {
          return NextResponse.json({ success: false, error: 'url, adapter_config.endpointUrl va adapter_config.secretKey kerak!' }, { status: 400 });
        }

        const adapter = new WebhookAdapter(adapter_config.endpointUrl, adapter_config.secretKey);
        const verify = await adapter.verify();
        if (!verify.ok) return NextResponse.json({ success: false, error: verify.error }, { status: 400 });

        const insertResult = await SupabaseInsertSite({
          user_id: userId, url, wp_username: '', wp_password: '',
          brand_voice: { voice_description: '', tone: 'professional', target_audience: 'umumiylik', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true,
          platform_type: 'webhook',
          adapter_config: { endpointUrl: adapter_config.endpointUrl, secretKey: adapter_config.secretKey },
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
