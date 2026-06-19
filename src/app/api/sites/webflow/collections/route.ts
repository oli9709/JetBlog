/**
 * GET /api/sites/webflow/collections?token=<apiToken>&siteId=<siteId>
 *
 * Webflow API orqali:
 *   1. Barcha saytlarni ro'yxatini qaytaradi (token darajasida) — siteId yo'q bo'lsa
 *   2. Berilgan siteId uchun kolleksiyalar + har bir kolleksiya maydonlarini qaytaradi
 *
 * UI tomonidan connection wizard 2-bosqichida ishlatiladi.
 * Autentifikatsiya: foydalanuvchi session (cookie orqali).
 * Rate limit: rateLimiters.verify (10/daqiqa).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';

const WF_BASE = 'https://api.webflow.com/v2';
const TIMEOUT = 10_000;

// ── Webflow API yordamchi ────────────────────────────────────────────────────

async function wfGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${WF_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("API Token noto'g'ri yoki ruxsat yo'q");
  }
  if (res.status === 402) {
    throw new Error("Webflow CMS API uchun Starter plan talab qilinadi");
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Webflow API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ── Tiplari ──────────────────────────────────────────────────────────────────

interface WfSite {
  id: string;
  displayName: string;
  shortName: string;
  customDomains: Array<{ url: string }>;
}

interface WfCollection {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
}

interface WfField {
  id: string;
  displayName: string;
  slug: string;
  type: string;
  isRequired: boolean;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  return withRateLimit(req, rateLimiters.verify, async () => {
    // ── Auth ────────────────────────────────────────────────────────────────
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Tizimga kirish talab etiladi' }, { status: 401 });
    }

    // ── Parametrlar ─────────────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const token    = searchParams.get('token')?.trim() ?? '';
    const siteId   = searchParams.get('siteId')?.trim() ?? '';

    if (!token) {
      return NextResponse.json({ error: 'token parametri talab qilinadi' }, { status: 400 });
    }

    try {
      // ── Faqat token: saytlar ro'yxatini qaytarish ─────────────────────────
      if (!siteId) {
        const { sites } = await wfGet<{ sites: WfSite[] }>('/sites', token);
        return NextResponse.json({
          sites: sites.map((s) => ({
            id: s.id,
            displayName: s.displayName,
            shortName: s.shortName,
            // Asosiy domen: custom domain bo'lsa — o'sha, bo'lmasa .webflow.io
            domain: s.customDomains?.[0]?.url ?? `${s.shortName}.webflow.io`,
          })),
        });
      }

      // ── siteId bilan: kolleksiyalar + maydonlar ───────────────────────────
      const [siteData, collectionsData] = await Promise.all([
        wfGet<WfSite>(`/sites/${siteId}`, token),
        wfGet<{ collections: WfCollection[] }>(`/sites/${siteId}/collections`, token),
      ]);

      const domain = siteData.customDomains?.[0]?.url ?? `${siteData.shortName}.webflow.io`;

      // Har bir kolleksiya uchun maydonlarni parallel yuklash
      const collectionsWithFields = await Promise.all(
        (collectionsData.collections ?? []).map(async (col) => {
          try {
            const colDetail = await wfGet<{ fields: WfField[] }>(
              `/collections/${col.id}`,
              token
            );
            return {
              id:           col.id,
              displayName:  col.displayName,
              singularName: col.singularName,
              slug:         col.slug,
              fields:       (colDetail.fields ?? []).map((f) => ({
                id:          f.id,
                displayName: f.displayName,
                slug:        f.slug,
                type:        f.type,
                isRequired:  f.isRequired,
              })),
            };
          } catch {
            return {
              id:           col.id,
              displayName:  col.displayName,
              singularName: col.singularName,
              slug:         col.slug,
              fields:       [],
            };
          }
        })
      );

      return NextResponse.json({
        siteId,
        domain,
        collections: collectionsWithFields,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Webflow API xatoligi';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  });
}
