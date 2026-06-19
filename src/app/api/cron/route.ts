/**
 * /api/cron — Avtopilot DISPATCHER (yengil, tezkor)
 *
 * Vazifasi: Bugun nashr qilish vaqti kelgan faol saytlarni topish va
 * har biri uchun alohida ishchi (/api/cron/site) ni navbatga qo'yish.
 * Hech qachon maqola generate yoki publish qilmaydi — bu ishchining ishi.
 *
 * Avtorizatsiya: Authorization: Bearer <CRON_SECRET>  yoki  ?secret=<CRON_SECRET>
 *
 * Navbat:
 *   - QSTASH_TOKEN mavjud → Upstash QStash orqali (retry, DLQ bilan)
 *   - QSTASH_TOKEN yo'q  → to'g'ridan-to'g'ri HTTP (mahalliy dev uchun)
 *
 * Muhit o'zgaruvchilari:
 *   CRON_SECRET                   — majburiy; yo'q bo'lsa hech qachon ruxsat berilmaydi
 *   QSTASH_TOKEN                  — QStash nashr kaliti
 *   QSTASH_CURRENT_SIGNING_KEY    — ishchi autentifikatsiyasi uchun
 *   QSTASH_NEXT_SIGNING_KEY       — ishchi autentifikatsiyasi uchun (kalit aylanishi)
 *   NEXT_PUBLIC_APP_URL           — ishchi URL ni qurish uchun (masalan https://app.jetblog.app)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @upstash/qstash — dynamic import (Turbopack build-time resolution muammosini oldini olish)
import { SiteT } from '@/lib/types/supabase';

export const dynamic = 'force-dynamic';

// ── Yordamchi: autorizatsiya ─────────────────────────────────────────────────

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;

  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') === cronSecret) return true;
  } catch { /* ignore */ }

  return false;
}

// ── Yordamchi: sayt bugun nashr vaqtiga yetganmi? ───────────────────────────

function isDueSite(site: SiteT): boolean {
  // publish_days: ['Monday', 'Wednesday', ...] — UTC kun nomi bilan taqqoslanadi
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
  const publishDays = (site.publish_days || []).map((d) => d.toLowerCase());
  if (!publishDays.includes(todayName)) return false;

  // publish_time: 'HH:MM:SS' UTC — joriy UTC soati >= publish_time bo'lishi kerak
  if (!site.publish_time) return true; // belgilanmagan → istalgan vaqtda nashr qilish mumkin
  const nowUtc = new Date();
  const [h, m] = site.publish_time.split(':').map(Number);
  const publishMinutes = h * 60 + m;
  const nowMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
  return nowMinutes >= publishMinutes;
}

// ── Asosiy dispatcher mantiq ─────────────────────────────────────────────────

async function runDispatcher(): Promise<{ enqueued: number; skipped: number; sites: string[] }> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sites, error } = await client
    .from('sites')
    .select('*')
    .eq('is_active', true);

  if (error) throw new Error(`Faol saytlarni olishda xatolik: ${error.message}`);
  if (!sites || sites.length === 0) return { enqueued: 0, skipped: 0, sites: [] };

  const dueSites = (sites as SiteT[]).filter(isDueSite);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  const workerUrl = `${appUrl}/api/cron/site`;
  const qstashToken = process.env.QSTASH_TOKEN;
  const cronSecret = process.env.CRON_SECRET!;

  const enqueuedUrls: string[] = [];
  let skipped = 0;

  for (const site of dueSites) {
    const body = JSON.stringify({ site_id: site.id });

    if (qstashToken) {
      // ── QStash: retry x3 avtomatik, xato bo'lsa DLQ ga o'tadi ─────────────
      const { Client: QStashClient } = await import('@upstash/qstash');
      const qstash = new QStashClient({ token: qstashToken });
      await qstash.publishJSON({
        url: workerUrl,
        body: { site_id: site.id },
        retries: 3,
        // Ishchi idempotency kalit: bir xil site+sana juftligi bir marta qayta tiklanadi
        // QStash deduplication: 24 soat davomida bir xil content-based key
        headers: {
          'X-JetBlog-Site-Id': site.id,
        },
      });
    } else {
      // ── Fallback: to'g'ridan-to'g'ri HTTP (mahalliy dev / QSTASH_TOKEN yo'q) ─
      // Fire-and-forget — dispatcher javobini kutmaydi
      fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
        body,
      }).catch((err) => {
        console.error(`[Dispatcher] Fallback HTTP xatoligi site=${site.id}:`, err);
      });
    }

    enqueuedUrls.push(site.url);
  }

  skipped = (sites as SiteT[]).length - dueSites.length;

  return { enqueued: enqueuedUrls.length, skipped, sites: enqueuedUrls };
}

// ── Route handler ────────────────────────────────────────────────────────────

async function handleRequest(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
  }
  try {
    const result = await runDispatcher();
    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    console.error('[Dispatcher] Xatolik:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Dispatcher xatoligi' },
      { status: 500 }
    );
  }
}

export const GET  = handleRequest;
export const POST = handleRequest;
