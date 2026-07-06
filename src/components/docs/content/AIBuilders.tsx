'use client';

import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';
import { useLocale } from 'next-intl';

interface Props { locale?: string }

// Code blocks are technical and kept in English
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
    console.log('New article:', data.title);
    // Add your publish logic here
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
            \\Log::info('New article: ' . $data['data']['title']);
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
        print(f"New article: {data['data']['title']}")

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
    console.log('New article:', data.title);
  }
  return { received: true };
});`;

const PAYLOAD_CODE = `{
  "event": "article.published",
  "timestamp": "2026-06-06T09:00:00Z",
  "data": {
    "id": "uuid-string",
    "title": "Article title",
    "keyword": "wordpress seo 2026",
    "content": "<h1>...</h1><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "publishedAt": "2026-06-06T09:00:00Z"
  }
}`;

const ENV_CODE = `# .env or .env.local
JETBLOG_SECRET=your_secret_key_here`;

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  howTitle: string; howDesc: string;
  setupTitle: string;
  setupSteps: { title: string; description: React.ReactNode }[];
  payloadTitle: string;
  examplesTitle: string;
  envTitle: string;
  securityTitle: string; securityBody: string;
  signatureTitle: string; signatureBody: string;
}> = {
  uz: {
    badge: 'Integratsiyalar',
    title: 'AI Builder Prompts',
    description: "WordPress kerak emas — o'z Next.js, Laravel, Django yoki Nuxt serveringizga to'g'ridan-to'g'ri ulaning. JetBlog maqola nashr etganda serveringiz avtomatik xabardor bo'ladi.",
    howTitle: 'Bu qanday ishlaydi?',
    howDesc: "JetBlog maqola generatsiya qilib nashr etganda, article.published eventini webhook orqali serveringizga yuboradi. Siz server tomonida bu so'rovni qabul qilib, o'z mantiqingizni ishga tushirasiz.",
    setupTitle: 'Sozlash',
    setupSteps: [
      { title: 'Dashboard → Connections → AI Builder', description: "Connections sahifasida \"AI Builder\" tabini oching" },
      { title: 'Platformani tanlang', description: "Next.js, Laravel, Django yoki Nuxt — avtomatik kod generatsiya bo'ladi" },
      { title: 'Kodni serveringizga joylashtiring', description: <>Generatsiya qilingan kodni nusxalab loyihangizga qo&apos;shing. Secret keyni <InlineCode>.env</InlineCode> ga o&apos;tkazing.</> },
      { title: 'Serveringizni deploy qiling', description: "Endpoint internetda ochiq bo'lishi kerak (localhost ishlamaydi)" },
      { title: "Test so'rov yuboring", description: "\"Test so'rov yuborish\" tugmasini bosing — serveringizda 200 javobini ko'rsangiz tayyor!" },
    ],
    payloadTitle: 'Payload formati',
    examplesTitle: 'Kod misollar',
    envTitle: "Muhit o'zgaruvchisi",
    securityTitle: 'Xavfsizlik',
    securityBody: "Secret keyni hech qachon kod ichiga yozmang. Har doim JETBLOG_SECRET muhit o'zgaruvchisi orqali bering. Secret keyni GitHub ga push qilmang!",
    signatureTitle: 'Imzo tekshirish',
    signatureBody: "JetBlog har bir so'rovga X-JetBlog-Signature va X-JetBlog-Webhook-Id headerlarini qo'shadi. Timing-safe comparison ishlatib, so'rov haqiqatan JetBlog dan kelganini tasdiqlang.",
  },
  ru: {
    badge: 'Интеграции',
    title: 'AI Builder Prompts',
    description: 'WordPress не нужен — подключите свой сервер на Next.js, Laravel, Django или Nuxt напрямую. Когда JetBlog публикует статью, ваш сервер автоматически получает уведомление.',
    howTitle: 'Как это работает?',
    howDesc: 'Когда JetBlog генерирует и публикует статью, он отправляет событие article.published через webhook на ваш сервер. Вы принимаете запрос и запускаете свою логику.',
    setupTitle: 'Настройка',
    setupSteps: [
      { title: 'Dashboard → Connections → AI Builder', description: 'Откройте вкладку "AI Builder" на странице Connections' },
      { title: 'Выберите платформу', description: 'Next.js, Laravel, Django или Nuxt — код сгенерируется автоматически' },
      { title: 'Разместите код на сервере', description: <>Скопируйте сгенерированный код и добавьте в проект. Secret key перенесите в <InlineCode>.env</InlineCode>.</> },
      { title: 'Задеплойте сервер', description: 'Эндпоинт должен быть доступен из интернета (localhost не подойдёт)' },
      { title: 'Отправьте тестовый запрос', description: 'Нажмите "Отправить тестовый запрос" — если сервер вернул 200, всё готово!' },
    ],
    payloadTitle: 'Формат payload',
    examplesTitle: 'Примеры кода',
    envTitle: 'Переменная окружения',
    securityTitle: 'Безопасность',
    securityBody: 'Никогда не пишите secret key прямо в коде. Всегда передавайте через переменную окружения JETBLOG_SECRET. Не пушьте secret key в GitHub!',
    signatureTitle: 'Проверка подписи',
    signatureBody: 'JetBlog добавляет к каждому запросу заголовки X-JetBlog-Signature и X-JetBlog-Webhook-Id. Используйте timing-safe comparison, чтобы убедиться, что запрос действительно от JetBlog.',
  },
  en: {
    badge: 'Integrations',
    title: 'AI Builder Prompts',
    description: 'No WordPress needed — connect your own Next.js, Laravel, Django, or Nuxt server directly. When JetBlog publishes an article, your server is automatically notified.',
    howTitle: 'How does it work?',
    howDesc: 'When JetBlog generates and publishes an article, it sends the article.published event via webhook to your server. You receive the request and run your own logic.',
    setupTitle: 'Setup',
    setupSteps: [
      { title: 'Dashboard → Connections → AI Builder', description: 'Open the "AI Builder" tab on the Connections page' },
      { title: 'Select your platform', description: 'Next.js, Laravel, Django or Nuxt — code is auto-generated' },
      { title: 'Place the code on your server', description: <>Copy the generated code and add it to your project. Move the secret key to <InlineCode>.env</InlineCode>.</> },
      { title: 'Deploy your server', description: 'The endpoint must be accessible from the internet (localhost won\'t work)' },
      { title: 'Send a test request', description: 'Click "Send test request" — if your server returns 200, you\'re all set!' },
    ],
    payloadTitle: 'Payload format',
    examplesTitle: 'Code examples',
    envTitle: 'Environment variable',
    securityTitle: 'Security',
    securityBody: 'Never write the secret key directly in code. Always pass it via the JETBLOG_SECRET environment variable. Do not push the secret key to GitHub!',
    signatureTitle: 'Signature verification',
    signatureBody: 'JetBlog adds X-JetBlog-Signature and X-JetBlog-Webhook-Id headers to every request. Use timing-safe comparison to confirm the request genuinely came from JetBlog.',
  },
};

export function AIBuilders({ locale: _localeProp }: Props) {
  const locale = useLocale() as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.howTitle}</DocsH2>
      <DocsPara>
        {c.howDesc.split('article.published')[0]}
        <InlineCode>article.published</InlineCode>
        {c.howDesc.split('article.published')[1] ?? ''}
      </DocsPara>

      <DocsH2>{c.setupTitle}</DocsH2>
      <StepList className="mb-8" steps={c.setupSteps} />

      <DocsH2>{c.payloadTitle}</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>{c.examplesTitle}</DocsH2>
      <PlatformTabs
        className="mb-8"
        tabs={[
          { id: 'nextjs', label: 'Next.js', content: <CodeBlock language="typescript" filename="app/api/jetblog/route.ts" code={NEXTJS_CODE} /> },
          { id: 'laravel', label: 'Laravel', content: <CodeBlock language="php" filename="JetBlogController.php" code={LARAVEL_CODE} /> },
          { id: 'django', label: 'Django', content: <CodeBlock language="python" filename="views.py" code={DJANGO_CODE} /> },
          { id: 'nuxt', label: 'Nuxt', content: <CodeBlock language="typescript" filename="server/api/jetblog/receive.post.ts" code={NUXT_CODE} /> },
        ]}
      />

      <DocsH2>{c.envTitle}</DocsH2>
      <CodeBlock language="bash" filename=".env" code={ENV_CODE} className="mb-6" />

      <Callout variant="danger" title={c.securityTitle}>
        {c.securityBody.split('JETBLOG_SECRET')[0]}
        <InlineCode>JETBLOG_SECRET</InlineCode>
        {c.securityBody.split('JETBLOG_SECRET')[1] ?? ''}
      </Callout>

      <Callout variant="info" title={c.signatureTitle} className="mt-4">
        {c.signatureBody.split('X-JetBlog-Signature')[0]}
        <InlineCode>X-JetBlog-Signature</InlineCode>
        {c.signatureBody.split('X-JetBlog-Signature')[1]?.split('X-JetBlog-Webhook-Id')[0] ?? ''}
        <InlineCode>X-JetBlog-Webhook-Id</InlineCode>
        {c.signatureBody.split('X-JetBlog-Webhook-Id')[1] ?? ''}
      </Callout>
    </div>
  );
}
