export type AIPlatform = 'nextjs' | 'laravel' | 'django' | 'nuxt';

export interface PromptConfig {
  webhookUrl: string;
  secretKey: string;
  webhookId: string;
  platform: AIPlatform;
}

// ─── Platform metadata ────────────────────────────────────────────────────────
export const PLATFORM_META: Record<AIPlatform, { label: string; icon: string; color: string }> = {
  nextjs:  { label: 'Next.js',  icon: '▲', color: '#000000' },
  laravel: { label: 'Laravel',  icon: '🔴', color: '#FF2D20' },
  django:  { label: 'Django',   icon: '🟢', color: '#0C4B33' },
  nuxt:    { label: 'Nuxt',     icon: '💚', color: '#00DC82' },
};

// ─── Generator ────────────────────────────────────────────────────────────────
export function generatePrompt(config: PromptConfig): string {
  const { platform, webhookUrl, secretKey, webhookId } = config;

  switch (platform) {
    case 'nextjs':
      return `// app/api/jetblog/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const JETBLOG_SECRET = process.env.JETBLOG_SECRET!; // "${secretKey}"

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
    // data.id, data.title, data.content (HTML), data.featuredImageUrl
    console.log('Yangi maqola:', data.title);
    // O'z publish mantiging shu yerga
  }

  // JetBlog ga tasdiqlash so'rovini yuboring
  await fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-JetBlog-Webhook-Id': '${webhookId}',
      'X-JetBlog-Signature': crypto
        .createHmac('sha256', JETBLOG_SECRET)
        .update(JSON.stringify({ event, data }))
        .digest('hex'),
    },
    body: JSON.stringify({ event, data }),
  });

  return NextResponse.json({ received: true });
}`;

    case 'laravel':
      return `<?php
// routes/api.php ichiga qo'shing:
// Route::post('/jetblog/receive', [JetBlogController::class, 'receive']);

// app/Http/Controllers/JetBlogController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;

class JetBlogController extends Controller
{
    private string $secret = '${secretKey}'; // env('JETBLOG_SECRET') ga ko'chiring

    public function receive(Request $request)
    {
        $payload  = $request->getContent();
        $sig      = $request->header('X-JetBlog-Signature', '');
        $expected = hash_hmac('sha256', $payload, $this->secret);

        if (!hash_equals($expected, $sig)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $data  = json_decode($payload, true);
        $event = $data['event'] ?? '';

        if ($event === 'article.published') {
            // $data['data']['title'], $data['data']['content']
            \\Log::info('Yangi maqola: ' . $data['data']['title']);
            // O'z publish mantiging shu yerga
        }

        // JetBlog ga tasdiqlash so'rovini yuboring
        Http::withHeaders([
            'X-JetBlog-Webhook-Id' => '${webhookId}',
            'X-JetBlog-Signature'  => hash_hmac('sha256', $payload, $this->secret),
        ])->post('${webhookUrl}', $data);

        return response()->json(['received' => true]);
    }
}`;

    case 'django':
      return `# views.py
import hmac
import hashlib
import json
import os
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET', '${secretKey}')

@csrf_exempt
@require_POST
def jetblog_receive(request):
    payload = request.body
    sig = request.META.get('HTTP_X_JETBLOG_SIGNATURE', '')

    expected = hmac.new(
        JETBLOG_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        return JsonResponse({'error': 'Invalid signature'}, status=401)

    data = json.loads(payload)
    event = data.get('event', '')

    if event == 'article.published':
        # data['data']['title'], data['data']['content']
        print(f"Yangi maqola: {data['data']['title']}")
        # O'z publish mantiging shu yerga

    # JetBlog ga tasdiqlash so'rovini yuboring
    requests.post(
        '${webhookUrl}',
        json=data,
        headers={
            'X-JetBlog-Webhook-Id': '${webhookId}',
            'X-JetBlog-Signature': hmac.new(
                JETBLOG_SECRET.encode(),
                json.dumps(data).encode(),
                hashlib.sha256
            ).hexdigest(),
        }
    )

    return JsonResponse({'received': True})

# urls.py ichiga qo'shing:
# path('api/jetblog/receive/', views.jetblog_receive, name='jetblog-receive'),`;

    case 'nuxt':
      return `// server/api/jetblog/receive.post.ts
import crypto from 'crypto';

const JETBLOG_SECRET = process.env.JETBLOG_SECRET ?? '${secretKey}';

export default defineEventHandler(async (event) => {
  const rawBody  = await readRawBody(event) ?? '';
  const sig      = getHeader(event, 'x-jetblog-signature') ?? '';

  const expected = crypto
    .createHmac('sha256', JETBLOG_SECRET)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw createError({ statusCode: 401, message: 'Invalid signature' });
  }

  const payload = JSON.parse(rawBody);
  const { event: webhookEvent, data } = payload;

  if (webhookEvent === 'article.published') {
    // data.id, data.title, data.content (HTML), data.featuredImageUrl
    console.log('Yangi maqola:', data.title);
    // O'z publish mantiging shu yerga
  }

  // JetBlog ga tasdiqlash so'rovini yuboring
  await $fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'X-JetBlog-Webhook-Id': '${webhookId}',
      'X-JetBlog-Signature': crypto
        .createHmac('sha256', JETBLOG_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex'),
    },
    body: payload,
  });

  return { received: true };
});`;

    default:
      return '';
  }
}
