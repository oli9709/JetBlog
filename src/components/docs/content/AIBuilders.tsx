'use client';

import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';

const NEXTJS_CODE = `// app/api/jetblog/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const JETBLOG_SECRET = process.env.JETBLOG_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig     = req.headers.get('x-jetblog-signature') ?? '';

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

  return NextResponse.json({ received: true });
}`;

const LARAVEL_CODE = `<?php
// app/Http/Controllers/JetBlogController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class JetBlogController extends Controller
{
    public function receive(Request $request)
    {
        $payload  = $request->getContent();
        $sig      = $request->header('X-JetBlog-Signature', '');
        $expected = hash_hmac('sha256', $payload, env('JETBLOG_SECRET'));

        if (!hash_equals($expected, $sig)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $data  = json_decode($payload, true);
        $event = $data['event'] ?? '';

        if ($event === 'article.published') {
            \\Log::info('Yangi maqola: ' . $data['data']['title']);
        }

        return response()->json(['received' => true]);
    }
}`;

const DJANGO_CODE = `# views.py
import hmac, hashlib, json, os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET', '')

@csrf_exempt
@require_POST
def jetblog_receive(request):
    payload  = request.body
    sig      = request.META.get('HTTP_X_JETBLOG_SIGNATURE', '')
    expected = hmac.new(
        JETBLOG_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        return JsonResponse({'error': 'Invalid signature'}, status=401)

    data  = json.loads(payload)
    event = data.get('event', '')

    if event == 'article.published':
        print(f"Yangi maqola: {data['data']['title']}")

    return JsonResponse({'received': True})`;

const NUXT_CODE = `// server/api/jetblog/receive.post.ts
import crypto from 'crypto';

const JETBLOG_SECRET = process.env.JETBLOG_SECRET ?? '';

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

  const { event: webhookEvent, data } = JSON.parse(rawBody);

  if (webhookEvent === 'article.published') {
    console.log('Yangi maqola:', data.title);
  }

  return { received: true };
});`;

const PAYLOAD_CODE = `{
  "event": "article.published",
  "timestamp": "2026-06-06T09:00:00Z",
  "data": {
    "id": "uuid-string",
    "title": "Maqola sarlavhasi",
    "keyword": "wordpress seo 2026",
    "content": "<h1>...</h1><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "publishedAt": "2026-06-06T09:00:00Z"
  }
}`;

const ENV_CODE = `# .env yoki .env.local
JETBLOG_SECRET=your_secret_key_here`;

export function AIBuilders() {
  return (
    <div>
      <DocsPageHeader
        badge="Integratsiyalar"
        title="AI Builder Prompts"
        description="WordPress kerak emas — o'z Next.js, Laravel, Django yoki Nuxt serveringizga to'g'ridan-to'g'ri ulaning. JetBlog maqola nashr etganda serveringiz avtomatik xabardor bo'ladi."
      />

      <DocsH2>Bu qanday ishlaydi?</DocsH2>
      <DocsPara>
        JetBlog maqola generatsiya qilib nashr etganda,{' '}
        <InlineCode>article.published</InlineCode> eventini webhook orqali serveringizga yuboradi.
        Siz server tomonida bu so&apos;rovni qabul qilib, o&apos;z mantigin&#287;izni (ma&apos;lumotlar bazasiga saqlash,
        email yuborish, cache tozalash va h.k.) ishga tushirasiz.
      </DocsPara>

      <DocsH2>Sozlash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Dashboard → Connections → AI Builder',
            description: 'Connections sahifasida "AI Builder" tabini oching',
          },
          {
            title: 'Platformani tanlang',
            description: 'Next.js, Laravel, Django yoki Nuxt — avtomatik kod generatsiya bo\'ladi',
          },
          {
            title: 'Kodni serveringizga joylashtiring',
            description: <>Generatsiya qilingan kodni nusxalab loyihangizga qo&apos;shing. Secret keyni <InlineCode>.env</InlineCode> ga o&apos;tkazing.</>,
          },
          {
            title: 'Serveringizni deploy qiling',
            description: 'Endpoint internetda ochiq bo\'lishi kerak (localhost ishlamaydi)',
          },
          {
            title: 'Test so\'rov yuboring',
            description: '"Test so\'rov yuborish" tugmasini bosing — serveringizda 200 javobini ko\'rsangiz tayyor!',
          },
        ]}
      />

      <DocsH2>Payload formati</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>Kod misollar</DocsH2>
      <PlatformTabs
        className="mb-8"
        tabs={[
          {
            id: 'nextjs',
            label: 'Next.js',
            content: <CodeBlock language="typescript" filename="app/api/jetblog/route.ts" code={NEXTJS_CODE} />,
          },
          {
            id: 'laravel',
            label: 'Laravel',
            content: <CodeBlock language="php" filename="JetBlogController.php" code={LARAVEL_CODE} />,
          },
          {
            id: 'django',
            label: 'Django',
            content: <CodeBlock language="python" filename="views.py" code={DJANGO_CODE} />,
          },
          {
            id: 'nuxt',
            label: 'Nuxt',
            content: <CodeBlock language="typescript" filename="server/api/jetblog/receive.post.ts" code={NUXT_CODE} />,
          },
        ]}
      />

      <DocsH2>Muhit o&apos;zgaruvchisi</DocsH2>
      <CodeBlock language="bash" filename=".env" code={ENV_CODE} className="mb-6" />

      <Callout variant="danger" title="Xavfsizlik">
        Secret keyni hech qachon kod ichiga yozmang. Har doim{' '}
        <InlineCode>JETBLOG_SECRET</InlineCode> muhit o&apos;zgaruvchisi orqali bering.
        Secret keyni GitHub ga push qilmang!
      </Callout>

      <Callout variant="info" title="Imzo tekshirish" className="mt-4">
        JetBlog har bir so&apos;rovga <InlineCode>X-JetBlog-Signature</InlineCode> va{' '}
        <InlineCode>X-JetBlog-Webhook-Id</InlineCode> headerlarini qo&apos;shadi.
        Timing-safe comparison ishlatib, so&apos;rov haqiqatan JetBlog dan kelganini tasdiqlang.
      </Callout>
    </div>
  );
}
