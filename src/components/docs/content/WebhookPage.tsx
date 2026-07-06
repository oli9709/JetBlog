'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';

interface Props { locale?: string }

// Code blocks are technical and kept in English (language-neutral)
const NODE_CODE = `const express = require('express')
const crypto = require('crypto')
const app = express()

// Capture raw bytes — HMAC is computed over raw body (not re-stringified)
app.use(express.raw({ type: 'application/json' }))

app.post('/jetblog-webhook', (req, res) => {
  const sig     = (req.headers['x-jetblog-signature'] ?? '').toString()
  const rawBody = req.body  // Buffer

  // 1. Strip sha256= prefix
  const sigHex  = sig.replace(/^sha256=/, '')

  // 2. Compute HMAC over raw bytes
  const expected = crypto
    .createHmac('sha256', process.env.JETBLOG_SECRET)
    .update(rawBody)
    .digest('hex')

  // 3. Timing-safe comparison
  let valid = false
  try {
    const a = Buffer.from(sigHex,   'hex')
    const b = Buffer.from(expected, 'hex')
    valid = a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch { valid = false }

  if (!valid) return res.status(401).json({ error: 'Invalid signature' })

  const body = JSON.parse(rawBody)
  const { event, data } = body

  if (event === 'article.published') {
    // data.title, data.content (HTML), data.featuredImageUrl, data.seoTitle, data.tags
    console.log('New article:', data.title)
  }

  res.json({ received: true })
})

app.listen(3000)`;

const PHP_CODE = `<?php
$secret  = getenv('JETBLOG_SECRET');
$rawBody = file_get_contents('php://input');
$sig     = $_SERVER['HTTP_X_JETBLOG_SIGNATURE'] ?? '';

$sigHex   = preg_replace('/^sha256=/', '', $sig);
$expected = hash_hmac('sha256', $rawBody, $secret);

if (!hash_equals($expected, $sigHex)) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid signature']));
}

$body = json_decode($rawBody, true);

if ($body['event'] === 'article.published') {
    $title   = $body['data']['title'];
    $content = $body['data']['content'];  // HTML
    // Your logic here...
}

header('Content-Type: application/json');
echo json_encode(['received' => true]);`;

const PYTHON_CODE = `import hmac
import hashlib
import os
from flask import Flask, request, jsonify

app = Flask(__name__)
JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET', '')

@app.route('/jetblog-webhook', methods=['POST'])
def webhook():
    sig      = request.headers.get('X-JetBlog-Signature', '')
    raw_body = request.get_data()

    sig_hex  = sig.replace('sha256=', '', 1)

    expected = hmac.new(
        JETBLOG_SECRET.encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig_hex, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    body = request.json
    if body.get('event') == 'article.published':
        print(f"New article: {body['data']['title']}")

    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=3000)`;

const PAYLOAD_CODE = `// Test request (ping)
{
  "event": "ping",
  "data": {},
  "timestamp": "2026-05-31T09:00:00.000Z"
}

// Article published
{
  "event": "article.published",
  "timestamp": "2026-05-31T09:00:00.000Z",
  "data": {
    "title": "Article title",
    "content": "<h2>...</h2><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "seoTitle": "SEO title (≤60 chars)",
    "seoDescription": "Meta description (150-160 chars)",
    "tags": ["wordpress", "seo"]
  }
}`;

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  setupTitle: string;
  setupSteps: { title: string; description: React.ReactNode }[];
  payloadTitle: string;
  signatureTitle: string; signatureDesc: React.ReactNode;
  warningTitle: string; warningBody: React.ReactNode;
  securityTitle: string; securityBody: React.ReactNode;
}> = {
  uz: {
    badge: 'Platformalar',
    title: 'Custom / Webhook',
    description: "Istalgan platforma yoki serveringizga webhook orqali maqolalarni yetkazing. HMAC-SHA256 imzosi bilan xavfsiz.",
    setupTitle: 'Sozlash',
    setupSteps: [
      { title: 'Endpoint yarating', description: "Serveringizda POST so'rovlarni qabul qiladigan endpoint yarating (quyida misollar)" },
      { title: 'JetBlog da ulang', description: <>Dashboard → Connections → Sayt qo&apos;shish → <strong className="text-white">Custom (Webhook)</strong></> },
      { title: 'Endpoint URL kiriting', description: <><InlineCode>https://yourserver.com/jetblog-webhook</InlineCode></> },
      { title: 'Secret key', description: "Auto-generate tugmasini bosing yoki o'zingiz kiriting — bu imzo tekshirishda ishlatiladi" },
      { title: 'Test', description: "JetBlog test so'rov yuboradi — serveringizda 200 javobini ko'rsangiz tayyor!" },
    ],
    payloadTitle: 'Payload formati',
    signatureTitle: 'Imzo tekshirish',
    signatureDesc: <>JetBlog har bir so&apos;rovga <InlineCode>X-JetBlog-Signature: sha256=&lt;hex&gt;</InlineCode> va <InlineCode>X-JetBlog-Event</InlineCode> headerlarini qo&apos;shadi. Imzo so&apos;rovning <strong>aynan raw body baytlari</strong> ustida HMAC-SHA256 orqali hisoblanadi.</>,
    warningTitle: 'Muhim: raw body ishlatilishi shart',
    warningBody: <><InlineCode>express.json()</InlineCode> o&apos;rniga <InlineCode>express.raw(&#123; type: &apos;application/json&apos; &#125;)</InlineCode> ishlating. PHP va Python da raw body avtomatik o&apos;qiladi.</>,
    securityTitle: 'Xavfsizlik',
    securityBody: <>Secret key ni hech qachon kod ichiga yozmang. <InlineCode>JETBLOG_SECRET</InlineCode> muhit o&apos;zgaruvchisi orqali bering.</>,
  },
  ru: {
    badge: 'Платформы',
    title: 'Custom / Webhook',
    description: "Доставляйте статьи на любую платформу или сервер через webhook. Защище��о подписью HMAC-SHA256.",
    setupTitle: 'Настройка',
    setupSteps: [
      { title: 'Создайт�� endpoint', description: "Создайте на се��вере endpoint, принимающий POST-запросы (примеры ниже)" },
      { title: 'Подключите в JetBlog', description: <>Dashboard → Connections → Добавить сайт → <strong className="text-white">Custom (Webhook)</strong></> },
      { title: 'Введите URL endpoint', description: <><InlineCode>https://yourserver.com/jetblog-webhook</InlineCode></> },
      { title: 'Secret key', description: "Нажмите Auto-generate или введите свой — используется для проверки подписи" },
      { title: 'Тест', description: "JetBlog отправит тестовый запрос — если серв��р вернул 200, всё готово!" },
    ],
    payloadTitle: 'Формат payload',
    signatureTitle: 'Проверка подписи',
    signatureDesc: <>JetBlog добавляет в каждый запрос заголовки <InlineCode>X-JetBlog-Signature: sha256=&lt;hex&gt;</InlineCode> и <InlineCode>X-JetBlog-Event</InlineCode>. Подпись вычисляется HMAC-SHA256 по <strong>точным байтам raw body</strong>.</>,
    warningTitle: 'Важно: необходимо использовать raw body',
    warningBody: <>Вместо <InlineCode>express.json()</InlineCode> используйте <InlineCode>express.raw(&#123; type: &apos;application/json&apos; &#125;)</InlineCode>. В PHP и Python raw body читается автоматически.</>,
    securityTitle: 'Безопасность',
    securityBody: <>Никогда не вписывайте secret key прямо в код. Передавайте через переменную окружения <InlineCode>JETBLOG_SECRET</InlineCode>.</>,
  },
  en: {
    badge: 'Platforms',
    title: 'Custom / Webhook',
    description: "Deliver articles to any platform or server via webhook. Secured with HMAC-SHA256 signature.",
    setupTitle: 'Setup',
    setupSteps: [
      { title: 'Create an endpoint', description: "Create an endpoint on your server that accepts POST requests (examples below)" },
      { title: 'Connect in JetBlog', description: <>Dashboard → Connections → Add Site → <strong className="text-white">Custom (Webhook)</strong></> },
      { title: 'Enter endpoint URL', description: <><InlineCode>https://yourserver.com/jetblog-webhook</InlineCode></> },
      { title: 'Secret key', description: "Click Auto-generate or enter your own — used for signature verification" },
      { title: 'Test', description: "JetBlog sends a test request — if your server returns 200, you're ready!" },
    ],
    payloadTitle: 'Payload format',
    signatureTitle: 'Signature verification',
    signatureDesc: <>JetBlog adds <InlineCode>X-JetBlog-Signature: sha256=&lt;hex&gt;</InlineCode> and <InlineCode>X-JetBlog-Event</InlineCode> headers to every request. The signature is computed with HMAC-SHA256 over the <strong>exact raw body bytes</strong>.</>,
    warningTitle: 'Important: raw body must be used',
    warningBody: <>Use <InlineCode>express.raw(&#123; type: &apos;application/json&apos; &#125;)</InlineCode> instead of <InlineCode>express.json()</InlineCode>. In PHP and Python raw body is read automatically.</>,
    securityTitle: 'Security',
    securityBody: <>Never hard-code the secret key. Pass it via the <InlineCode>JETBLOG_SECRET</InlineCode> environment variable.</>,
  },
};

export function WebhookPage({ locale: _locale }: Props) {
  const locale = useLocale() as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.setupTitle}</DocsH2>
      <StepList className="mb-8" steps={c.setupSteps} />

      <DocsH2>{c.payloadTitle}</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>{c.signatureTitle}</DocsH2>
      <DocsPara>{c.signatureDesc}</DocsPara>

      <Callout variant="warning" className="mb-6" title={c.warningTitle}>
        {c.warningBody}
      </Callout>

      <PlatformTabs
        className="mb-8"
        tabs={[
          { id: 'node', label: 'Node.js', content: <CodeBlock language="javascript" filename="webhook.js" code={NODE_CODE} /> },
          { id: 'php', label: 'PHP', content: <CodeBlock language="php" filename="webhook.php" code={PHP_CODE} /> },
          { id: 'python', label: 'Python', content: <CodeBlock language="python" filename="webhook.py" code={PYTHON_CODE} /> },
        ]}
      />

      <Callout variant="danger" title={c.securityTitle}>
        {c.securityBody}
      </Callout>
    </div>
  );
}
