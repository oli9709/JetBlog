import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const PAYLOAD_CODE = `{
  "event": "article.published",
  "timestamp": "2026-05-31T09:00:00Z",
  "site_url": "https://yoursite.com",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "WordPress SEO 2026: Complete Guide",
    "keyword": "wordpress seo 2026",
    "content": "<h1>...</h1><p>...</p>",
    "featuredImageUrl": "https://cdn.example.com/image.jpg",
    "wordCount": 1842,
    "publishedAt": "2026-05-31T09:00:00Z",
    "postUrl": "https://yoursite.com/wordpress-seo-2026"
  }
}`;

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  setupTitle: string;
  setupSteps: React.ReactNode[];
  eventsTitle: string;
  events: { event: string; desc: string }[];
  payloadTitle: string;
  sigTitle: string; sigDesc: string;
  calloutBody: string;
}> = {
  uz: {
    badge: 'Integratsiyalar',
    title: 'Webhooks',
    description: "JetBlog voqealari uchun webhook URL larini sozlang va tashqi tizimlar bilan integratsiya qiling.",
    setupTitle: 'Webhook sozlash',
    setupSteps: [
      <><strong className="text-white">Dashboard → Connections → Sayt → Webhook URL</strong> maydoniga URL kiriting</>,
      <>Secret key kiriting (yoki auto-generate) — imzo tekshirishda kerak bo&apos;ladi</>,
      <>Qaysi hodisalarni qabul qilishni tanlang</>,
    ],
    eventsTitle: 'Hodisalar (Events)',
    events: [
      { event: 'article.published', desc: 'Maqola muvaffaqiyatli nashr qilinganda' },
      { event: 'article.failed', desc: 'Maqola nashr qilishda xatolik yuz berganda' },
      { event: 'article.generated', desc: 'AI maqola yozib tugatganda (nashrdan oldin)' },
    ],
    payloadTitle: 'Payload',
    sigTitle: 'Imzo tekshirish',
    sigDesc: "Har bir webhook so'rovida X-JetBlog-Signature header mavjud. Bu HMAC-SHA256 imzosi bo'lib, payload va secret key dan hisoblanadi.",
    calloutBody: "To'liq imzo tekshirish misollari Custom / Webhook sahifasida Node.js, PHP va Python da keltirilgan.",
  },
  ru: {
    badge: 'Интеграции',
    title: 'Webhooks',
    description: 'Настройте webhook-URL для событий JetBlog и интегрируйтесь с внешними системами.',
    setupTitle: 'Настройка webhook',
    setupSteps: [
      <><strong className="text-white">Dashboard → Connections → Сайт → поле Webhook URL</strong> — введите URL</>,
      <>Введите secret key (или сгенерируйте автоматически) — нужен для проверки подписи</>,
      <>Выберите, какие события получать</>,
    ],
    eventsTitle: 'События (Events)',
    events: [
      { event: 'article.published', desc: 'Статья успешно опубликована' },
      { event: 'article.failed', desc: 'Ошибка при публикации статьи' },
      { event: 'article.generated', desc: 'AI завершил написание статьи (до публикации)' },
    ],
    payloadTitle: 'Payload',
    sigTitle: 'Проверка подписи',
    sigDesc: 'Каждый webhook-запрос содержит заголовок X-JetBlog-Signature. Это HMAC-SHA256 подпись, вычисленная из payload и secret key.',
    calloutBody: 'Полные примеры проверки подписи на Node.js, PHP и Python находятся на странице Custom / Webhook.',
  },
  en: {
    badge: 'Integrations',
    title: 'Webhooks',
    description: 'Configure webhook URLs for JetBlog events and integrate with external systems.',
    setupTitle: 'Webhook setup',
    setupSteps: [
      <><strong className="text-white">Dashboard → Connections → Site → Webhook URL</strong> field — enter your URL</>,
      <>Enter a secret key (or auto-generate) — needed for signature verification</>,
      <>Choose which events to receive</>,
    ],
    eventsTitle: 'Events',
    events: [
      { event: 'article.published', desc: 'Article successfully published' },
      { event: 'article.failed', desc: 'Error occurred while publishing article' },
      { event: 'article.generated', desc: 'AI finished writing the article (before publishing)' },
    ],
    payloadTitle: 'Payload',
    sigTitle: 'Signature verification',
    sigDesc: 'Every webhook request includes an X-JetBlog-Signature header. This is an HMAC-SHA256 signature computed from the payload and the secret key.',
    calloutBody: 'Full signature verification examples in Node.js, PHP, and Python are on the Custom / Webhook page.',
  },
};

export async function WebhooksIntPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.setupTitle}</DocsH2>
      <ol className="space-y-3 mb-8">
        {c.setupSteps.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <DocsH2>{c.eventsTitle}</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {c.events.map((e) => (
          <div key={e.event} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm">
            <InlineCode>{e.event}</InlineCode>
            <span className="text-zinc-400">{e.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>{c.payloadTitle}</DocsH2>
      <CodeBlock language="json" filename="webhook-payload.json" code={PAYLOAD_CODE} className="mb-8" />

      <DocsH2>{c.sigTitle}</DocsH2>
      <DocsPara>
        {c.sigDesc.split('X-JetBlog-Signature')[0]}
        <InlineCode>X-JetBlog-Signature</InlineCode>
        {c.sigDesc.split('X-JetBlog-Signature')[1] ?? ''}
      </DocsPara>
      <Callout variant="info">{c.calloutBody}</Callout>
    </div>
  );
}
