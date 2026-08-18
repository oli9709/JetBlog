import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { refreshGSCToken } from './refresh';

export interface DiscoverResult {
  added: number;
  skipped: number;
  total_candidates: number;
  reason?: string;
  error?: string;
}

interface GSCQueryRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// NOTE: We use googleapis.com/webmasters/v3 (same as gsc/fetch.ts) because
// searchconsole.googleapis.com/v1 returns 404 HTML on this project's tokens.
const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3/sites';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** GSC API'ga so'rov (auto refresh with one retry on 401). */
async function fetchGscQueries(
  gscSiteUrl: string,
  accessToken: string,
  tokenRow: { id: string; refresh_token: string | null; expires_at: string }
): Promise<{ rows: GSCQueryRow[]; refreshed?: string } | { error: string; status: number }> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = `${SEARCH_CONSOLE_API}/${encodeURIComponent(gscSiteUrl)}/searchAnalytics/query`;
  const body = JSON.stringify({
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 100,
  });

  const doFetch = async (tok: string) =>
    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tok}`,
        'Content-Type': 'application/json',
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });

  let res = await doFetch(accessToken).catch(() => null);
  if (!res) return { error: 'network', status: 0 };

  // Bir marta refresh token orqali qayta urinish
  if (res.status === 401 && tokenRow.refresh_token) {
    console.log('[gsc-discover] 401 → refreshing token');
    const refreshed = await refreshGSCToken(tokenRow.refresh_token);
    if (refreshed.error || !refreshed.access_token) {
      return { error: `token refresh: ${refreshed.error ?? 'no token'}`, status: 401 };
    }
    // DB'да yangilash
    await svc()
      .from('gsc_tokens')
      .update({
        access_token: refreshed.access_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenRow.id);
    res = await doFetch(refreshed.access_token).catch(() => null);
    if (!res) return { error: 'network after refresh', status: 0 };
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { error: `after refresh: ${res.status} ${t.slice(0, 120)}`, status: res.status };
    }
    const json = (await res.json()) as { rows?: GSCQueryRow[] };
    return { rows: json.rows ?? [], refreshed: refreshed.access_token };
  }

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    return { error: `${res.status} ${t.slice(0, 120)}`, status: res.status };
  }

  const json = (await res.json()) as { rows?: GSCQueryRow[] };
  return { rows: json.rows ?? [] };
}

/**
 * Sayt uchun GSC'дан yangi keyword'lar topib, keywords jadvaliga qo'shadi.
 * Har doim non-throw — `error` yoki `reason` ni result obyektida qайtaradi.
 */
export async function syncGscKeywordsForSite(
  siteId: string,
  limit = 20
): Promise<DiscoverResult> {
  const db = svc();

  // 1. Site + user + default_language
  const { data: site, error: siteErr } = await db
    .from('sites')
    .select('id, url, user_id, default_language')
    .eq('id', siteId)
    .maybeSingle();

  if (siteErr || !site) {
    console.error('[gsc-discover] site not found', { siteId });
    return { added: 0, skipped: 0, total_candidates: 0, error: 'site not found' };
  }

  // 2. GSC token for this site
  const { data: tokenRow } = await db
    .from('gsc_tokens')
    .select('id, access_token, refresh_token, expires_at, gsc_site_url')
    .eq('site_id', siteId)
    .eq('user_id', site.user_id)
    .maybeSingle();

  if (!tokenRow) {
    console.log('[gsc-discover] no GSC token', { siteId });
    return { added: 0, skipped: 0, total_candidates: 0, reason: 'gsc_not_connected' };
  }

  const gscSiteUrl = tokenRow.gsc_site_url as string | null;
  if (!gscSiteUrl) {
    console.log('[gsc-discover] no gsc_site_url', { siteId });
    return { added: 0, skipped: 0, total_candidates: 0, reason: 'no_gsc_property' };
  }

  // 3. Query GSC
  const gsc = await fetchGscQueries(gscSiteUrl, tokenRow.access_token, {
    id: tokenRow.id,
    refresh_token: tokenRow.refresh_token,
    expires_at: tokenRow.expires_at,
  });

  if ('error' in gsc) {
    console.error('[gsc-discover] api error', { siteId, ...gsc });
    return { added: 0, skipped: 0, total_candidates: 0, error: gsc.error };
  }

  const rows = gsc.rows ?? [];
  console.log('[gsc-discover] fetched', { siteId, rowCount: rows.length });

  // 4. Filter candidates: impressions>=5, position>=3, clicks<impressions
  const candidates = rows.filter((r) => {
    return r.impressions >= 5 && r.position >= 3 && r.clicks < r.impressions;
  });

  // 5. Rank
  const ranked = candidates
    .map((r) => {
      const wastedRatio = 1 - Math.min(r.clicks / r.impressions, 1);
      const score = r.impressions * wastedRatio * (1 / Math.max(r.position, 1));
      return { row: r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log('[gsc-discover] filtered', {
    siteId,
    candidates: candidates.length,
    top: ranked.length,
  });

  if (ranked.length === 0) {
    return { added: 0, skipped: 0, total_candidates: candidates.length };
  }

  // 6. Duplicate check + insert
  const lang = site.default_language ?? 'en';
  let added = 0;
  let skipped = 0;

  for (const { row } of ranked) {
    const keyword = row.keys[0]?.trim();
    if (!keyword) continue;

    // Case-insensitive duplicate check — only against ACTIVE rows
    // (pending/approved). Historical `completed` rows don't block a fresh cycle.
    const { data: existing } = await db
      .from('keywords')
      .select('id')
      .eq('site_id', siteId)
      .in('status', ['pending', 'approved'])
      .ilike('keyword', keyword)
      .limit(1)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const { error: insErr } = await db.from('keywords').insert({
      site_id: siteId,
      keyword,
      status: 'pending',
      language: lang,
      source: 'gsc_auto',
      gsc_impressions: Math.round(row.impressions),
      gsc_position: Number(row.position.toFixed(2)),
      gsc_synced_at: new Date().toISOString(),
    });

    if (insErr) {
      // Unique index violation (e.g., race) — skip silently
      if (insErr.code === '23505') {
        skipped++;
      } else {
        console.warn('[gsc-discover] insert failed', { siteId, keyword, message: insErr.message });
      }
      continue;
    }
    added++;
  }

  console.log('[gsc-discover] done', {
    siteId,
    added,
    skipped,
    total_candidates: candidates.length,
  });

  return { added, skipped, total_candidates: candidates.length };
}
