'use client';

import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';

const NODE_CODE = `const express = require('express')
const crypto = require('crypto')
const app = express()
app.use(express.json())

app.post('/jetblog-webhook', (req, res) => {
  const sig = req.headers['x-jetblog-signature']
  const expected = crypto
    .createHmac('sha256', process.env.JETBLOG_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (sig !== expected) return res.status(401).json({ error: 'Invalid signature' })

  const { event, data } = req.body
  if (event === 'article.published') {
    // data.title, data.content (HTML), data.featuredImageUrl
    console.log('Yangi maqola:', data.title)
  }
  res.json({ received: true })
})

app.listen(3000)`;

const PHP_CODE = `<?php
$secret = getenv('JETBLOG_SECRET');
$payload = file_get_contents('php://input');
$sig = $_SERVER['HTTP_X_JETBLOG_SIGNATURE'] ?? '';
$expected = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expected, $sig)) {
    http_response_code(401);
    exit('Invalid signature');
}

$data = json_decode($payload, true);
if ($data['event'] === 'article.published') {
    $title = $data['data']['title'];
    $content = $data['data']['content'];
    // O'z mantiging...
}
echo json_encode(['received' => true]);`;

const PYTHON_CODE = `import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)
JETBLOG_SECRET = os.environ.get('JETBLOG_SECRET')

@app.route('/jetblog-webhook', methods=['POST'])
def webhook():
    sig = request.headers.get('X-JetBlog-Signature', '')
    payload = request.get_data()
    expected = hmac.new(
        JETBLOG_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.json
    if data.get('event') == 'article.published':
        print(f"Yangi maqola: {data['data']['title']}")

    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=3000)`;

const PAYLOAD_CODE = `{
  "event": "article.published",
  "timestamp": "2026-05-31T09:00:00Z",
  "site_url": "https://yoursite.com",
  "data": {
    "id": "uuid-string",
    "title": "Maqola sarlavhasi",
    "keyword": "wordpress seo 2026",
    "content": "<h1>...</h1><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "publishedAt": "2026-05-31T09:00:00Z"
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
        JetBlog har bir so&apos;rovga <InlineCode>X-JetBlog-Signature</InlineCode> header qo&apos;shadi.
        Bu so&apos;rov haqiqatan JetBlog dan kelganini tasdiqlaydi.
      </DocsPara>

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
