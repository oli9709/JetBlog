// ─── Types ───────────────────────────────────────────────────────────────────

export type AIPlatform = 'nextjs' | 'laravel' | 'django' | 'nuxt';

export interface PromptConfig {
  webhookUrl: string;
  secretKey: string;
  webhookId: string;
  platform: AIPlatform;
}

// ─── Platform metadata (backward compat) ─────────────────────────────────────

export const PLATFORM_META: Record<AIPlatform, { label: string; icon: string; color: string }> = {
  nextjs:  { label: 'Next.js',  icon: '▲', color: '#000000' },
  laravel: { label: 'Laravel',  icon: '🔴', color: '#FF2D20' },
  django:  { label: 'Django',   icon: '🟢', color: '#0C4B33' },
  nuxt:    { label: 'Nuxt',     icon: '💚', color: '#00DC82' },
};

// ─── Universal prompt ─────────────────────────────────────────────────────────

export function generateUniversalPrompt(
  _webhookUrl: string,
  _secretKey: string
): string {
  // Signature: (webhookUrl, secretKey) kept for backwards compat.
  // Actual creds are injected via env — the prompt shows YOUR_JETBLOG_SECRET
  // as a placeholder so users don't paste real secrets into public chats.
  void _webhookUrl;
  void _secretKey;

  return `You are an expert developer. Analyze my existing project structure and implement a complete blog system integrated with JetBlog AI.

IMPORTANT: Do not ask questions. Detect everything automatically and implement in one go.

━━━ JETBLOG CREDENTIALS (do not change) ━━━
Webhook endpoint (JetBlog will POST here): POST /api/jetblog
Secret key: YOUR_JETBLOG_SECRET (from the JetBlog dashboard)
Signature header: X-JetBlog-Signature (HMAC-SHA256 of the RAW body)
Event header: X-JetBlog-Event ("ping" or "article.published")

━━━ STEP 1: AUTO-DETECT PROJECT ━━━
Framework: Next.js App Router / Pages / Nuxt / Laravel / Django / Express — detect
Database: Supabase / Prisma / MongoDB / MySQL / Postgres / none (file-based)
Styling: Tailwind / CSS modules / plain — match the existing design exactly

━━━ STEP 2: WEBHOOK RECEIVER — CRITICAL RULES ━━━

Create POST /api/jetblog with these EXACT rules — each rule addresses a real bug
seen in production integrations:

RULE A — Body structure (avoids "data is not defined" ReferenceError):
The article payload is NOT top-level. It sits inside body.data:
  {
    "event": "article.published",
    "timestamp": "2026-07-15T09:55:46.000Z",
    "data": {
      "title": "...",
      "content": "<h1>...</h1>",         // HTML string
      "featuredImageUrl": "https://images.pexels.com/...",
      "seoTitle": "...",
      "seoDescription": "...",
      "tags": ["..."]
    }
  }
Always declare data explicitly:
  const payload = JSON.parse(rawBody);
  const event = req.headers['x-jetblog-event'] || payload.event;
  const data = payload.data || {};   // NEVER skip this line
Never destructure { title, content } from the top-level body.

RULE B — Raw body for signature (avoids 401 "Invalid signature"):
Signature = HMAC-SHA256(RAW_body_string, JETBLOG_SECRET).
If you JSON.parse first and re-stringify to verify, whitespace/order will differ
and the signature will always fail.

For Express, register the route with raw parser BEFORE any global express.json():
  app.post('/api/jetblog', express.raw({ type: '*/*' }), handler);
  app.use(express.json());   // for other routes only

For Next.js API route, read the raw body via req or Web API before parsing:
  const rawBody = await req.text();

Verification:
  const expected = 'sha256=' + crypto.createHmac('sha256', process.env.JETBLOG_SECRET)
    .update(rawBody).digest('hex');
  if (req.headers['x-jetblog-signature'] !== expected) return 401;

RULE C — Ping event (avoids failed connection test):
Connection setup sends { "event": "ping", "data": {} } first.
Handle it BEFORE trying to read data.title:
  if (event === 'ping') return res.status(200).json({ ok: true });

RULE D — Public URL for post links (avoids Telegram link pointing to backend):
Frontend and backend often have DIFFERENT domains. Telegram notifications and
social shares must open the PUBLIC frontend URL, not the API backend.

Add env var PUBLIC_SITE_URL = your real public site
(e.g. https://www.example.com, not https://api-backend.onrender.com).

Return the FULL public URL in the webhook response:
  return res.status(200).json({
    postId: inserted.id,
    url: \`\${process.env.PUBLIC_SITE_URL}/blog/\${slug}\`
  });

Never return a bare path ("/blog/slug") or the backend domain.

RULE E — Route order (Express — avoids "Cannot POST /"):
Register /api/jetblog BEFORE any catch-all handler, 404 middleware, or
app.use('*', ...). Catch-all 404 must be the very last handler.

━━━ STEP 3: DATABASE — blog_posts table/model ━━━
Fields: id (uuid/auto), title, slug (unique, auto from title), content (HTML text),
featured_image (nullable), seo_title (nullable), seo_description (nullable),
tags (array/json), read_time (int, minutes — compute from word count),
published_at (timestamptz), created_at (timestamptz, default now()).

Slug generation:
  const slug = title.toLowerCase().replace(/[^a-z0-9\\s-]/g, '').trim()
    .replace(/\\s+/g, '-').slice(0, 80) + '-' + Date.now();

━━━ STEP 4: BLOG INDEX PAGE (/blog) ━━━
Responsive grid (3 / 2 / 1 cols). Each card: featured image (aspect-video, object-cover,
gradient placeholder fallback), title (2 lines max, bold), formatted date, read time,
150-char excerpt (strip HTML). Empty state: "New articles coming soon..." — no error.
SEO meta title and description on the page.

━━━ STEP 5: BLOG POST PAGE (/blog/[slug]) ━━━
Hero: full-width featured image (max-h 400, object-cover, gradient fallback).
Breadcrumb Home → Blog → Title. Large bold title. Meta row: date + read time + tag badges.
Divider. Render content HTML safely.

Content CSS:
  .blog-content h1,h2,h3 { font-weight: bold; margin: 1.5rem 0 .75rem; }
  .blog-content h2 { font-size: 1.5rem }
  .blog-content h3 { font-size: 1.25rem }
  .blog-content p { margin: 1rem 0; line-height: 1.8; }
  .blog-content img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
  .blog-content ul, ol { padding-left: 1.5rem; margin: 1rem 0; }
  .blog-content a { color: #FB3640; text-decoration: underline; }
  .blog-content blockquote { border-left: 3px solid #FB3640; padding-left: 1rem; font-style: italic; color: gray; }
  .blog-content code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }

Back button "← Back to Blog". Dynamic SEO meta from seoTitle/seoDescription.
If supported, static generation with revalidate = 60.

━━━ STEP 6: SITEMAP (avoids "sitemap not found") ━━━
Create /sitemap.xml on the FRONTEND that includes all blog posts:
  \${PUBLIC_SITE_URL}/blog/\${slug} — each with <lastmod> and <changefreq>weekly</changefreq>

Next.js App Router: create app/sitemap.ts that fetches all posts from DB and returns
MetadataRoute.Sitemap. Include the home page and /blog too.

Update /robots.txt (or app/robots.ts) to include:
  Sitemap: \${PUBLIC_SITE_URL}/sitemap.xml

━━━ STEP 7: NAVIGATION ━━━
Add "Blog" → /blog to the main header. Match the existing nav link style exactly.

━━━ STEP 8: LOGGING (makes debugging possible) ━━━
Every log line must be prefixed [JetBlog] so it's greppable in production logs.
Log entry, event type, and outcome:
  console.log('[JetBlog] POST received, event:', event);
  console.log('[JetBlog] Article saved:', inserted.slug);
Catch block must log FULL error (not just message):
  catch (err) {
    console.error('[JetBlog] Webhook error:', err?.stack || err);
    return res.status(500).json({ error: String(err?.message || err) });
  }

━━━ STEP 9: VERIFY ━━━
1) GET /api/jetblog → { "status": "JetBlog webhook active" }
2) /blog loads without errors, empty state shows if no posts
3) /blog/non-existent-slug shows 404 (not a crash)
4) "Blog" appears in navigation
5) /sitemap.xml is accessible

━━━ STEP 10: DEPLOY & ENVIRONMENT ━━━
Detect hosting (vercel.json / netlify.toml / other) and deploy.
Webhook does NOT work on localhost — must be on public URL first.

Environment variables to add (production, not just .env.local):
  JETBLOG_SECRET = <from JetBlog dashboard, keep secret>
  PUBLIC_SITE_URL = <your real public frontend URL, e.g. https://www.example.com>

For Vercel: vercel env add JETBLOG_SECRET (and PUBLIC_SITE_URL)
For Netlify: Site settings → Environment variables → Add

━━━ COMMON PITFALLS TO AVOID ━━━
- Do NOT use body.title — use body.data.title (see RULE A)
- Do NOT parse JSON before verifying signature (see RULE B)
- Do NOT skip the ping handler (see RULE C)
- Do NOT return backend domain in the url field (see RULE D)
- Do NOT put /api/jetblog after a catch-all 404 (see RULE E)
- Do NOT hardcode JETBLOG_SECRET — use process.env
- Do NOT log the secret or full request body in production logs

Report back with:
- Webhook URL (must be POST /api/jetblog on your public domain)
- Blog index URL (/blog)
- Sitemap URL (/sitemap.xml)
- Env vars added (JETBLOG_SECRET, PUBLIC_SITE_URL)`;
}

// ─── Legacy per-platform generator (backward compatibility) ──────────────────

export function generatePrompt(config: PromptConfig): string {
  const { platform, webhookUrl, secretKey, webhookId } = config;

  switch (platform) {
    case 'nextjs':
      return `// app/api/jetblog/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const JETBLOG_SECRET = process.env.JETBLOG_SECRET!; // set in .env: "${secretKey}"

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-jetblog-signature') ?? '';

  const expected = crypto
    .createHmac('sha256', JETBLOG_SECRET)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { event, data } = JSON.parse(rawBody);
  if (event === 'article.published') {
    console.log('Yangi maqola:', data.title);
    // O'z publish mantiging shu yerga
  }

  await fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-JetBlog-Webhook-Id': '${webhookId}',
    },
    body: rawBody,
  });

  return NextResponse.json({ received: true });
}`;

    case 'laravel':
      return `<?php
// routes/api.php: Route::post('/jetblog', [JetBlogController::class, 'receive']);
namespace App\\Http\\Controllers;
use Illuminate\\Http\\Request;

class JetBlogController extends Controller {
  public function receive(Request $request) {
    $payload  = $request->getContent();
    $sig      = $request->header('X-JetBlog-Signature', '');
    $expected = hash_hmac('sha256', $payload, env('JETBLOG_SECRET'));
    // JETBLOG_SECRET="${secretKey}"

    if (!hash_equals($expected, $sig)) {
      return response()->json(['error' => 'Invalid signature'], 401);
    }

    $data = json_decode($payload, true);
    if (($data['event'] ?? '') === 'article.published') {
      \\Log::info('Yangi maqola: ' . $data['data']['title']);
    }
    return response()->json(['received' => true]);
  }
}`;

    case 'django':
      return `# views.py
import hmac, hashlib, json, os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# .env: JETBLOG_SECRET=${secretKey}
JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET', '')

@csrf_exempt
@require_POST
def jetblog_receive(request):
  payload  = request.body
  sig      = request.META.get('HTTP_X_JETBLOG_SIGNATURE', '')
  expected = hmac.new(JETBLOG_SECRET.encode(), payload, hashlib.sha256).hexdigest()

  if not hmac.compare_digest(sig, expected):
    return JsonResponse({'error': 'Invalid signature'}, status=401)

  data = json.loads(payload)
  if data.get('event') == 'article.published':
    print(f"Yangi maqola: {data['data']['title']}")

  return JsonResponse({'received': True})
# urls.py: path('api/jetblog/', views.jetblog_receive)`;

    case 'nuxt':
      return `// server/api/jetblog.post.ts
import crypto from 'crypto';
// .env: JETBLOG_SECRET=${secretKey}

export default defineEventHandler(async (event) => {
  const rawBody  = await readRawBody(event) ?? '';
  const sig      = getHeader(event, 'x-jetblog-signature') ?? '';
  const secret   = process.env.JETBLOG_SECRET ?? '';

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf   = Buffer.from(sig, 'hex');
  const expBuf   = Buffer.from(expected, 'hex');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw createError({ statusCode: 401, message: 'Invalid signature' });
  }

  const { event: webhookEvent, data } = JSON.parse(rawBody);
  if (webhookEvent === 'article.published') {
    console.log('Yangi maqola:', data.title);
  }
  return { received: true };
});`;

    default:
      return '';
  }
}
