'use client';

import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';

// ─── Canonical contract ────────────────────────────────────────────────────────
// Header  : X-JetBlog-Signature  value "sha256=<hex>"
// Header  : X-JetBlog-Event      value e.g. "article.published" | "ping"
// Body    : { event, data, timestamp }
// Signing : HMAC-SHA256 over the EXACT raw request body bytes (NOT re-stringified)
// ──────────────────────────────────────────────────────────────────────────────

// Node.js — express.raw() to capture the exact bytes JetBlog signed
const NODE_CODE = `const express = require('express')
const crypto = require('crypto')
const app = express()

// Raw bytes ni saqlash — HMAC raw body ustida hisoblanadi (JSON.parse/stringify qilinmaydi)
app.use(express.raw({ type: 'application/json' }))

app.post('/jetblog-webhook', (req, res) => {
  const sig     = (req.headers['x-jetblog-signature'] ?? '').toString()
  const rawBody = req.body  // Buffer

  // 1. sha256= prefiksini olib tashlash
  const sigHex  = sig.replace(/^sha256=/, '')

  // 2. HMAC raw bytes ustida hisoblash
  const expected = crypto
    .createHmac('sha256', process.env.JETBLOG_SECRET)
    .update(rawBody)
    .digest('hex')

  // 3. Timing-safe taqqoslash
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
    console.log('Yangi maqola:', data.title)
  }

  res.json({ received: true })
})

app.listen(3000)`;

// PHP — php://input raw bytes (timing-safe hash_equals, sha256= stripped)
const PHP_CODE = `<?php
$secret  = getenv('JETBLOG_SECRET');
$rawBody = file_get_contents('php://input');  // raw bytes — JSON decode qilinmaydi
$sig     = $_SERVER['HTTP_X_JETBLOG_SIGNATURE'] ?? '';

// sha256= prefiksini olib tashlash
$sigHex   = preg_replace('/^sha256=/', '', $sig);
$expected = hash_hmac('sha256', $rawBody, $secret);

// hash_equals timing-safe taqqoslash
if (!hash_equals($expected, $sigHex)) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid signature']));
}

$body = json_decode($rawBody, true);

if ($body['event'] === 'article.published') {
    $title   = $body['data']['title'];
    $content = $body['data']['content'];  // HTML
    // O'z mantiging...
}

header('Content-Type: application/json');
echo json_encode(['received' => true]);`;

// Python / Flask — request.get_data() raw bytes, sha256= stripped, compare_digest
const PYTHON_CODE = `import hmac
import hashlib
import os
from flask import Flask, request, jsonify

app = Flask(__name__)
JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET', '')

@app.route('/jetblog-webhook', methods=['POST'])
def webhook():
    sig      = request.headers.get('X-JetBlog-Signature', '')
    raw_body = request.get_data()  # raw bytes — decode qilinmaydi

    # sha256= prefiksini olib tashlash
    sig_hex  = sig.replace('sha256=', '', 1)

    expected = hmac.new(
        JETBLOG_SECRET.encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    # hmac.compare_digest timing-safe taqqoslash
    if not hmac.compare_digest(sig_hex, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    body = request.json
    if body.get('event') == 'article.published':
        print(f"Yangi maqola: {body['data']['title']}")

    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=3000)`;

// Actual payload shape sent by WebhookAdapter
const PAYLOAD_CODE = `// Test so'rov (ping)
{
  "event": "ping",
  "data": {},
  "timestamp": "2026-05-31T09:00:00.000Z"
}

// Haqiqiy nashr (article.published)
{
  "event": "article.published",
  "timestamp": "2026-05-31T09:00:00.000Z",
  "data": {
    "title": "Maqola sarlavhasi",
    "content": "<h2>...</h2><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "seoTitle": "SEO sarlavha (≤60 belgi)",
    "seoDescription": "Meta tavsif (150-160 belgi)",
    "tags": ["wordpress", "seo"]
  }
}`;

export function WebhookPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Platformalar"
        title="Custom / Webhook"
        description="Istalgan platforma yoki serveringizga webhook orqali maqolalarni yetkazing. HMAC-SHA256 imzosi bilan xavfsiz."
      />

      <DocsH2>Sozlash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Endpoint yarating',
            description: 'Serveringizda POST so\'rovlarni qabul qiladigan endpoint yarating (quyida misollar)',
          },
          {
            title: 'JetBlog da ulang',
            description: <>Dashboard → Connections → Sayt qo&apos;shish → <strong className="text-white">Custom (Webhook)</strong></>,
          },
          {
            title: 'Endpoint URL kiriting',
            description: <><InlineCode>https://yourserver.com/jetblog-webhook</InlineCode></>,
          },
          {
            title: 'Secret key',
            description: 'Auto-generate tugmasini bosing yoki o\'zingiz kiriting — bu imzo tekshirishda ishlatiladi',
          },
          {
            title: 'Test',
            description: 'JetBlog test so\'rov yuboradi — serveringizda 200 javobini ko\'rsangiz tayyor!',
          },
        ]}
      />

      <DocsH2>Payload formati</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>Imzo tekshirish</DocsH2>
      <DocsPara>
        JetBlog har bir so&apos;rovga <InlineCode>X-JetBlog-Signature: sha256=&lt;hex&gt;</InlineCode> va{' '}
        <InlineCode>X-JetBlog-Event</InlineCode> headerlarini qo&apos;shadi.
        Imzo so&apos;rovning <strong>aynan raw body baytlari</strong> ustida HMAC-SHA256 orqali hisoblanadi —
        JSON.parse/stringify qilinmaydi. Shu sababli receiver da ham raw body ishlatilishi shart.
      </DocsPara>

      <Callout variant="warning" className="mb-6" title="Muhim: raw body ishlatilishi shart">
        Node.js da <InlineCode>express.json()</InlineCode> body ni parse qilib qayta stringify qiladi —
        HMAC mos kelmaydi. O&apos;rniga <InlineCode>express.raw(&#123; type: &apos;application/json&apos; &#125;)</InlineCode> ishlating.
        PHP va Python da raw body avtomatik o&apos;qiladi.
      </Callout>

      <PlatformTabs
        className="mb-8"
        tabs={[
          {
            id: 'node',
            label: 'Node.js',
            content: <CodeBlock language="javascript" filename="webhook.js" code={NODE_CODE} />,
          },
          {
            id: 'php',
            label: 'PHP',
            content: <CodeBlock language="php" filename="webhook.php" code={PHP_CODE} />,
          },
          {
            id: 'python',
            label: 'Python',
            content: <CodeBlock language="python" filename="webhook.py" code={PYTHON_CODE} />,
          },
        ]}
      />

      <Callout variant="danger" title="Xavfsizlik">
        Secret key ni hech qachon kod ichiga yozmang. <InlineCode>JETBLOG_SECRET</InlineCode> muhit o&apos;zgaruvchisi (<InlineCode>.env</InlineCode>) orqali bering.
      </Callout>
    </div>
  );
}
