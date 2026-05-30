import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

const EVENTS = [
  { event: 'article.published', desc: 'Maqola muvaffaqiyatli nashr qilinganda' },
  { event: 'article.failed', desc: 'Maqola nashr qilishda xatolik yuz berganda' },
  { event: 'article.generated', desc: 'AI maqola yozib tugatganda (nashrdan oldin)' },
];

const PAYLOAD_CODE = `{
  "event": "article.published",
  "timestamp": "2026-05-31T09:00:00Z",
  "site_url": "https://yoursite.com",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "WordPress SEO 2026: To'liq qo'llanma",
    "keyword": "wordpress seo 2026",
    "content": "<h1>...</h1><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "wordCount": 1842,
    "publishedAt": "2026-05-31T09:00:00Z",
    "postUrl": "https://yoursite.com/wordpress-seo-2026"
  }
}`;

export function WebhooksIntPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Integratsiyalar"
        title="Webhooks"
        description="JetBlog voqealari uchun webhook URL larini sozlang va tashqi tizimlar bilan integratsiya qiling."
      />

      <DocsH2>Webhook sozlash</DocsH2>
      <ol className="space-y-3 mb-8">
        {[
          <>Dashboard → <strong className="text-white">Connections → Sayt</strong> → <strong className="text-white">Webhook URL</strong> maydoniga URL kiriting</>,
          <>Secret key kiriting (yoki auto-generate) — imzo tekshirishda kerak bo&apos;ladi</>,
          <>Qaysi hodisalarni qabul qilishni tanlang</>,
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <DocsH2>Hodisalar (Events)</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {EVENTS.map((e) => (
          <div key={e.event} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm">
            <InlineCode>{e.event}</InlineCode>
            <span className="text-zinc-400">{e.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>Payload</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>Imzo tekshirish</DocsH2>
      <DocsPara>
        Har bir webhook so&apos;rovida <InlineCode>X-JetBlog-Signature</InlineCode> header mavjud.
        Bu HMAC-SHA256 imzosi bo&apos;lib, payload va secret key dan hisoblanadi.
      </DocsPara>
      <Callout variant="info">
        To&apos;liq imzo tekshirish misollari <strong>Custom / Webhook</strong> sahifasida Node.js, PHP va Python da keltirilgan.
      </Callout>
    </div>
  );
}
