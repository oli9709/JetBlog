import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { syncGscKeywordsForSite } from '@/lib/API/Services/gsc/discoverKeywords';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — GSC per-site takes seconds

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') === cronSecret) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * POST /api/cron/gsc-sync
 * Haftalik cron — barcha faol saytlar uchun GSC dan yangi keyword'lar topib qo'shadi.
 * QStash yoki har qanday scheduler dushanba 05:00 UTC da chaqirsin.
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Faol saytlar + GSC token bo'lganlari
  const { data: sites, error } = await svc
    .from('sites')
    .select('id, gsc_tokens!inner(id)')
    .eq('is_active', true);

  if (error) {
    console.error('[cron/gsc-sync] site query failed', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (sites ?? []) as Array<{ id: string }>;
  console.log('[cron/gsc-sync] start', { sites_found: list.length });

  let totalAdded = 0;
  let totalSkipped = 0;
  const perSite: Array<{ siteId: string; added: number; skipped: number; reason?: string; error?: string }> = [];

  for (const site of list) {
    try {
      const result = await syncGscKeywordsForSite(site.id, 20);
      totalAdded += result.added;
      totalSkipped += result.skipped;
      perSite.push({
        siteId: site.id,
        added: result.added,
        skipped: result.skipped,
        reason: result.reason,
        error: result.error,
      });
    } catch (err: any) {
      console.error('[cron/gsc-sync] site failed', { siteId: site.id, message: err?.message });
      perSite.push({ siteId: site.id, added: 0, skipped: 0, error: err?.message ?? 'unknown' });
    }
  }

  console.log('[cron/gsc-sync] done', {
    sites_processed: list.length,
    total_added: totalAdded,
    total_skipped: totalSkipped,
  });

  return NextResponse.json({
    ok: true,
    sites_processed: list.length,
    total_added: totalAdded,
    total_skipped: totalSkipped,
    per_site: perSite,
  });
}

// GET — CRON providers ba'zan GET yuborishadi
export const GET = POST;
