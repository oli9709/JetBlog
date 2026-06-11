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
  webhookUrl: string,
  secretKey: string
): string {
  return `You are an expert developer. Analyze my existing project structure and implement a complete blog system integrated with JetBlog AI.

IMPORTANT: Do not ask any questions. Detect everything automatically from the codebase and implement in one go.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JETBLOG CREDENTIALS (do not change)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Webhook endpoint (JetBlog will POST here):
POST /api/jetblog

Secret key: YOUR_JETBLOG_SECRET (see credentials below)
Signature header: X-JetBlog-Signature (HMAC-SHA256)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: AUTO-DETECT PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First, scan the project and detect:

Framework:
- Next.js App Router → /app/api/jetblog/route.ts
- Next.js Pages Router → /pages/api/jetblog.ts
- Nuxt.js → /server/api/jetblog.post.ts
- Laravel → /app/Http/Controllers/JetBlogController.php
- Django → blog/views.py
- Express/Node → routes/jetblog.js
- Other → detect and implement accordingly

Database:
- Supabase → create blog_posts table via migration
- Prisma → add BlogPost model to schema.prisma
- MongoDB → create BlogPost mongoose model
- MySQL/PostgreSQL → create migration file
- No database → use /public/posts/ JSON files

Styling:
- Tailwind CSS → use Tailwind classes
- CSS Modules → use .module.css files
- Styled Components → use styled components
- Plain CSS → use stylesheet
- Match EXACTLY the existing design system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: WEBHOOK RECEIVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create webhook endpoint that:

1. Accepts POST /api/jetblog
2. Verifies HMAC-SHA256 signature:
   - Get raw request body as text
   - Compute: HMAC-SHA256(body, YOUR_JETBLOG_SECRET)
   - Compare with X-JetBlog-Signature header
   - Return 401 if mismatch
3. On event "article.published":
   - Save to database with these fields:
     title: data.title
     content: data.content       (HTML string)
     featuredImage: data.featuredImageUrl
     slug: auto-generate from title
     seoTitle: data.seoTitle
     seoDescription: data.seoDescription
     tags: data.tags             (array)
     readTime: calculate from word count
     publishedAt: current timestamp
4. Return { received: true }
5. Also handle GET → return { status: "JetBlog webhook active" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: DATABASE / STORAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on detected database, create:

blog_posts table/model/collection with:
- id (auto-generated primary key)
- title (string, required)
- slug (string, unique, auto-generated)
- content (text/longtext, HTML)
- featured_image (string, nullable, URL)
- seo_title (string, nullable)
- seo_description (text, nullable)
- tags (json/array, default empty)
- read_time (integer, minutes)
- published_at (timestamp)
- created_at (timestamp, auto)

If no database exists in project:
Create /lib/posts.ts with file-based storage:
- Save each post as /public/posts/[slug].json
- /public/posts/index.json keeps list of all posts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: BLOG INDEX PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create /blog page:

Layout:
- Page title: "Blog" (or translated if site uses another language)
- Responsive grid: 3 cols desktop, 2 cols tablet, 1 col mobile
- Match existing page layout (header/footer)

Each post card must show:
- Featured image (aspect-video, object-cover)
  Fallback: gradient placeholder if no image
- Title (2 lines max, font-bold)
- Published date (formatted: "12 May 2025")
- Read time ("5 daqiqa" or "5 min")
- Excerpt: first 150 characters, strip HTML tags
- Hover: subtle scale or border effect

Empty state (no posts yet):
- Icon + "Tez kunda yangi maqolalar..." text
- Do not show error

SEO: Add meta title and description to page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: BLOG POST PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create /blog/[slug] page:

Layout:
- Hero: full-width featured image (max-height 400px, object-cover)
  Show gradient placeholder if no image
- Breadcrumb: Home → Blog → [Title]
- Title: large (text-3xl or text-4xl), bold
- Meta row: date + read time + tags (as badges)
- Horizontal divider
- Content: render HTML safely

Content CSS (add to global or scoped styles):
  .blog-content h1,h2,h3 { font-weight: bold; margin: 1.5rem 0 0.75rem; }
  .blog-content h2 { font-size: 1.5rem }
  .blog-content h3 { font-size: 1.25rem }
  .blog-content p { margin: 1rem 0; line-height: 1.8; }
  .blog-content img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
  .blog-content ul, ol { padding-left: 1.5rem; margin: 1rem 0; }
  .blog-content a { color: #FB3640; text-decoration: underline; }
  .blog-content blockquote { border-left: 3px solid #FB3640; padding-left: 1rem; font-style: italic; color: gray; }
  .blog-content code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }

- "← Blog ga qaytish" back button
- Dynamic SEO meta (use seoTitle, seoDescription)
- If framework supports: static generation with revalidation every 60 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6: NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the main navigation/header component.
Add "Blog" link pointing to /blog.
Place it naturally among existing nav items.
Match existing nav link style exactly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7: VERIFY EVERYTHING WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After implementation:

1. Check GET /api/jetblog returns:
   { "status": "JetBlog webhook active" }

2. Check /blog page loads without errors

3. Check /blog/test-slug shows 404 gracefully (not a crash)

4. Confirm "Blog" appears in navigation

Tell me when done and show me:
- The webhook endpoint URL
- The /blog page URL
- Any environment variables I need to add

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8: DEPLOY TO PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After implementation, deploy the project
so JetBlog can test the webhook.

Detect hosting platform automatically:
- vercel.json exists → run: vercel --prod
- netlify.toml exists → run: netlify deploy --prod
- package.json has "build" script → build first
- Other → use existing deploy method

After deploy, the webhook URL will be:
https://YOUR-DOMAIN.com/api/jetblog

IMPORTANT:
- Webhook does NOT work on localhost
- Must be deployed to public URL first
- Add JETBLOG_SECRET to your hosting
  environment variables (not just .env.local)

For Vercel:
  vercel env add JETBLOG_SECRET

For Netlify:
  Site settings → Environment variables → Add

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLE NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add to your .env.local file:
JETBLOG_SECRET=YOUR_JETBLOG_SECRET

Then in your webhook file use:
const SECRET = process.env.JETBLOG_SECRET!
(never hardcode the secret key)`;
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
