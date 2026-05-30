import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';

type DetectResult = {
  platform: 'wordpress' | 'ghost' | 'webflow' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  hints: string[];
};

/**
 * POST /api/sites/detect
 * URL bo'yicha CMS platformasini aniqlaydi.
 *
 * Body: { url: string }
 * Response: { platform, confidence, hints }
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.detect, async () => {
    try {
      const body = await req.json() as { url?: string };
      if (!body.url) {
        return NextResponse.json({ error: 'url talab qilinadi!' }, { status: 400 });
      }

      const normalized = body.url.replace(/\/$/, '').replace(/\/wp-json.*$/, '');
      const result = await detectPlatform(normalized);
      return NextResponse.json(result);
    } catch (error: unknown) {
      console.error('Platform detect error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Detection xatosi' },
        { status: 500 }
      );
    }
  });
}

async function detectPlatform(baseUrl: string): Promise<DetectResult> {
  const hints: string[] = [];
  const checks = await Promise.allSettled([
    checkWordPress(baseUrl, hints),
    checkGhost(baseUrl, hints),
    checkWebflow(baseUrl, hints),
  ]);

  const [wpScore, ghostScore, webflowScore] = checks.map((c) =>
    c.status === 'fulfilled' ? c.value : 0
  );

  const max = Math.max(wpScore, ghostScore, webflowScore);

  if (max === 0) return { platform: 'unknown', confidence: 'low', hints };

  if (max === wpScore) {
    return { platform: 'wordpress', confidence: wpScore >= 2 ? 'high' : 'medium', hints };
  }
  if (max === ghostScore) {
    return { platform: 'ghost', confidence: ghostScore >= 2 ? 'high' : 'medium', hints };
  }
  return { platform: 'webflow', confidence: webflowScore >= 2 ? 'high' : 'medium', hints };
}

async function checkWordPress(baseUrl: string, hints: string[]): Promise<number> {
  let score = 0;
  try {
    const res = await fetch(`${baseUrl}/wp-json/`, { method: 'GET', signal: AbortSignal.timeout(5000) });
    if (res.ok) { score += 2; hints.push('WordPress REST API /wp-json/ topildi'); }
  } catch { /* ignore */ }

  try {
    const res = await fetch(`${baseUrl}/wp-login.php`, { method: 'HEAD', signal: AbortSignal.timeout(5000), redirect: 'manual' });
    if (res.status < 500) { score += 1; hints.push('wp-login.php mavjud'); }
  } catch { /* ignore */ }

  try {
    const res = await fetch(baseUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const html = await res.text();
      if (html.includes('/wp-content/') || html.includes('wp-includes')) {
        score += 1; hints.push('HTML da wp-content/wp-includes topildi');
      }
      if ((res.headers.get('x-powered-by') ?? '').toLowerCase().includes('wordpress')) {
        score += 1; hints.push('X-Powered-By: WordPress header topildi');
      }
    }
  } catch { /* ignore */ }

  return score;
}

async function checkGhost(baseUrl: string, hints: string[]): Promise<number> {
  let score = 0;
  try {
    const res = await fetch(`${baseUrl}/ghost/api/admin/site/`, {
      method: 'GET',
      headers: { 'Accept-Version': 'v5.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 401 || res.status === 200) {
      score += 2; hints.push('Ghost Admin API /ghost/api/admin/ topildi');
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(baseUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const html = await res.text();
      if (html.includes('ghost.io') || (html.includes('content/themes/') && html.includes('Ghost'))) {
        score += 1; hints.push('HTML da Ghost izlari topildi');
      }
      const ghostHeaders = (res.headers.get('x-ghost-cache-status') ?? '') + (res.headers.get('x-cache-invalidate') ?? '');
      if (ghostHeaders) { score += 1; hints.push('Ghost cache headerlari topildi'); }
    }
  } catch { /* ignore */ }

  return score;
}

async function checkWebflow(baseUrl: string, hints: string[]): Promise<number> {
  let score = 0;
  try {
    const res = await fetch(baseUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const html = await res.text();
      if (html.includes('webflow.com') || html.includes('data-wf-page') || html.includes('data-wf-site')) {
        score += 2; hints.push('HTML da Webflow atributlari topildi');
      }
      if ((res.headers.get('x-powered-by') ?? '').toLowerCase().includes('webflow')) {
        score += 1; hints.push('X-Powered-By: Webflow header topildi');
      }
    }
  } catch { /* ignore */ }

  return score;
}
