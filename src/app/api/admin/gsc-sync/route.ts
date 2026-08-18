import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/API/Services/admin/guard';
import { logAdminAction } from '@/lib/API/Services/admin/audit';
import { syncGscKeywordsForSite } from '@/lib/API/Services/gsc/discoverKeywords';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * POST /api/admin/gsc-sync
 * Admin qo'lda GSC sync'ni ishga tushiradi. `CRON_SECRET`'ga hojat yo'q —
 * admin session tekshiruvidan o'tadi.
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sites, error } = await svc
    .from('sites')
    .select('id, gsc_tokens!inner(id)')
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (sites ?? []) as Array<{ id: string }>;
  let totalAdded = 0;
  let totalSkipped = 0;
  const perSite: Array<{ siteId: string; added: number; skipped: number; reason?: string; error?: string }> = [];

  for (const s of list) {
    try {
      const r = await syncGscKeywordsForSite(s.id, 20);
      totalAdded += r.added;
      totalSkipped += r.skipped;
      perSite.push({ siteId: s.id, added: r.added, skipped: r.skipped, reason: r.reason, error: r.error });
    } catch (err: any) {
      perSite.push({ siteId: s.id, added: 0, skipped: 0, error: err?.message ?? 'unknown' });
    }
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'admin.role_changed', // reuse — no dedicated action; details tell story
    details: {
      action_type: 'gsc_sync_triggered',
      sites_processed: list.length,
      total_added: totalAdded,
      total_skipped: totalSkipped,
    },
  });

  console.log('[admin/gsc-sync] done', {
    sites_processed: list.length,
    total_added: totalAdded,
  });

  return NextResponse.json({
    ok: true,
    sites_processed: list.length,
    total_added: totalAdded,
    total_skipped: totalSkipped,
    per_site: perSite,
  });
}
