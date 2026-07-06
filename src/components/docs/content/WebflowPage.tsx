import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  planWarningTitle: string; planWarningBody: React.ReactNode;
  apiTokenTitle: string;
  apiTokenSteps: { title: string; description: React.ReactNode }[];
  connectTitle: string;
  connectSteps: { title: string; description: React.ReactNode }[];
  techTitle: string; techDesc: React.ReactNode;
  publishTitle: string; publishDesc: string;
  publishSteps: { description: React.ReactNode }[];
  testTitle: string;
  err402Title: string; err402Body: React.ReactNode;
  err401Title: string; err401Body: React.ReactNode;
  errImageTitle: string; errImageBody: React.ReactNode;
}> = {
  uz: {
    badge: 'Platformalar',
    title: 'Webflow',
    description: 'Webflow CMS Collection Data API v2 orqali maqolalarni avtomatik nashr qiling.',
    planWarningTitle: 'Plan talabi',
    planWarningBody: <><strong>Free plan</strong> da CMS API mavjud emas. CMS API faqat <strong>Basic ($14/oy)</strong> va undan yuqori planlarda ishlaydi.</>,
    apiTokenTitle: 'API Token olish',
    apiTokenSteps: [
      { title: 'Webflow Dashboard ga kiring', description: <><InlineCode>webflow.com</InlineCode> → loyihangizni oching</> },
      { title: 'Site Settings → Integrations', description: <>Loyiha sozlamalari → <strong className="text-white">Integrations → API Access</strong></> },
      { title: "Token yarating — to'g'ri ruxsatlar bilan", description: <><strong className="text-white">Generate API Token</strong> → ruxsatlar: <InlineCode>sites:read</InlineCode>, <InlineCode>cms:read</InlineCode>, <InlineCode>cms:write</InlineCode></> },
      { title: "Token ni nusxalab oling", description: "Token faqat bir marta ko'rsatiladi — darhol saqlang." },
    ],
    connectTitle: 'JetBlog da ulash',
    connectSteps: [
      { title: "Connections → Sayt qo'shish → Webflow", description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish → Webflow</strong> tanlang</> },
      { title: 'API Token kiriting', description: <>Yuqorida yaratgan tokenni kiriting → <strong className="text-white">Saytlarni yuklash</strong></> },
      { title: 'Sayt va Kolleksiyani tanlang', description: "Saytlar ro'yxatidan keraklisini → keyin blog maqolalari uchun CMS kolleksiyasini tanlang" },
      { title: 'Maydonlarni xaritang', description: "Kontent maydoni (majburiy) — HTML maqola matni uchun RichText maydoni" },
      { title: 'Test Connection → Tayyor!', description: "Kolleksiya tekshiriladi — muvaffaqiyatli bo'lsa sayt saqlanadi." },
    ],
    techTitle: 'Texnik: adapter_config sxemasi',
    techDesc: <><InlineCode>sites.adapter_config</InlineCode> JSONB maydonida shifrlangan holda saqlanadi. <InlineCode>apiToken</InlineCode> AES-256-GCM bilan shifrlangan.</>,
    publishTitle: 'Nashr jarayoni',
    publishDesc: 'JetBlog Webflow Data API v2 orqali maqolani nashr qilganda:',
    publishSteps: [
      { description: <><InlineCode>POST /v2/collections/{'{collectionId}'}/items</InlineCode> — <InlineCode>isDraft: false</InlineCode> bilan (darhol LIVE)</> },
      { description: <><InlineCode>fieldData</InlineCode> da doim <InlineCode>name</InlineCode> va <InlineCode>slug</InlineCode> o&apos;rnatiladi</> },
      { description: "Xaritalangan maydonlar (body, summary, image) fieldData ga qo'shiladi" },
      { description: <>Live URL: <InlineCode>https://&#123;domain&#125;/&#123;collectionSlug&#125;/&#123;itemSlug&#125;</InlineCode></> },
      { description: "Rasm xatosi nashrni to'xtatmaydi (non-fatal)" },
    ],
    testTitle: "API dan foydalanishni tekshirish",
    err402Title: "402 — CMS API mavjud emas",
    err402Body: <><strong>Basic ($14/oy)</strong> rejaga o&apos;ting.</>,
    err401Title: "401/403 — Token noto'g'ri",
    err401Body: <><InlineCode>cms:read</InlineCode> va <InlineCode>cms:write</InlineCode> ruxsatlariga ega ekanligini tekshiring.</>,
    errImageTitle: "Rasm ko'rinmaydi",
    errImageBody: "Webflow Designer da item ni ochib rasmni qayta yuklang. Nashr jarayoni rasm xatosida ham to'xtamaydi.",
  },
  ru: {
    badge: 'Платформы',
    title: 'Webflow',
    description: 'Автоматически публикуйте статьи через Webflow CMS Collection Data API v2.',
    planWarningTitle: 'Требование к плану',
    planWarningBody: <>CMS API недоступен в <strong>Free план</strong>. CMS API работает только в плане <strong>Basic ($14/мес.)</strong> и выше.</>,
    apiTokenTitle: 'Получение API Token',
    apiTokenSteps: [
      { title: 'Войдите в Webflow Dashboard', description: <><InlineCode>webflow.com</InlineCode> → откройте ваш проект</> },
      { title: 'Site Settings → Integrations', description: <>Настройки проекта → <strong className="text-white">Integrations → API Access</strong></> },
      { title: 'Создайте токен с нужными разрешениями', description: <><strong className="text-white">Generate API Token</strong> → разрешения: <InlineCode>sites:read</InlineCode>, <InlineCode>cms:read</InlineCode>, <InlineCode>cms:write</InlineCode></> },
      { title: 'С��опируйте токен', description: "Токен показывается только один раз — сохраните его немедленно." },
    ],
    connectTitle: 'Подключение в JetBlog',
    connectSteps: [
      { title: 'Connections → Добавить сайт → Webflow', description: <>Dashboard → <strong className="text-white">Connections → Добавить сайт → Webflow</strong></> },
      { title: 'Вв��дите API Token', description: <>Введите созданный токен → нажмите <strong className="text-white">Загрузить сайты</strong></> },
      { title: 'Выберите сайт и коллекцию', description: "Выберите нужный сайт из списка, ��атем CMS-коллекцию для статей блога" },
      { title: 'Сопоставьте поля', description: "Поле контента (обязательно) — поле RichText для HTML статьи" },
      { title: 'Test Connection → Готово!', description: "Коллекция проверяетс�� — при успехе сайт сохраняется." },
    ],
    techTitle: 'Технически: схема adapter_config',
    techDesc: <>Хранится в зашифрованном виде в JSONB-поле <InlineCode>sites.adapter_config</InlineCode>. <InlineCode>apiToken</InlineCode> зашифрован AES-256-GCM.</>,
    publishTitle: 'Процесс публикации',
    publishDesc: 'Когда JetBlog публикует статью через Webflow Data API v2:',
    publishSteps: [
      { description: <><InlineCode>POST /v2/collections/{'{collectionId}'}/items</InlineCode> — с <InlineCode>isDraft: false</InlineCode> (сразу LIVE)</> },
      { description: <><InlineCode>fieldData</InlineCode> всегда содержит <InlineCode>name</InlineCode> и <InlineCode>slug</InlineCode></> },
      { description: "Сопоставленные поля (body, summary, image) добавляются в fieldData" },
      { description: <>Live URL: <InlineCode>https://&#123;domain&#125;/&#123;collectionSlug&#125;/&#123;itemSlug&#125;</InlineCode></> },
      { description: "Ошибка изображения не останавливает публикацию (non-fatal)" },
    ],
    testTitle: "Проверка использования API",
    err402Title: "402 — CMS API недоступен",
    err402Body: <>Перейдите на план <strong>Basic ($14/мес.)</strong>.</>,
    err401Title: "401/403 — Неверный токен",
    err401Body: <>Убедитесь, что токен имеет разрешения <InlineCode>cms:read</InlineCode> и <InlineCode>cms:write</InlineCode>.</>,
    errImageTitle: "Изображение не отображается",
    errImageBody: "Откройте item в Webflow Designer и перезагрузите изображение. Публикация не останавливается из-за ошибки изображения.",
  },
  en: {
    badge: 'Platforms',
    title: 'Webflow',
    description: 'Automatically publish articles via the Webflow CMS Collection Data API v2.',
    planWarningTitle: 'Plan requirement',
    planWarningBody: <>The CMS API is not available on the <strong>Free plan</strong>. It works only on the <strong>Basic ($14/mo)</strong> plan and above.</>,
    apiTokenTitle: 'Get an API Token',
    apiTokenSteps: [
      { title: 'Log into Webflow Dashboard', description: <><InlineCode>webflow.com</InlineCode> → open your project</> },
      { title: 'Site Settings → Integrations', description: <>Project settings → <strong className="text-white">Integrations → API Access</strong></> },
      { title: 'Create a token with the right permissions', description: <><strong className="text-white">Generate API Token</strong> → permissions: <InlineCode>sites:read</InlineCode>, <InlineCode>cms:read</InlineCode>, <InlineCode>cms:write</InlineCode></> },
      { title: 'Copy the token', description: "The token is shown only once — save it immediately." },
    ],
    connectTitle: 'Connect in JetBlog',
    connectSteps: [
      { title: 'Connections → Add Site → Webflow', description: <>Dashboard → <strong className="text-white">Connections → Add Site → Webflow</strong></> },
      { title: 'Enter API Token', description: <>Enter the token you created → click <strong className="text-white">Load Sites</strong></> },
      { title: 'Select site and collection', description: "Choose the site from the list, then the CMS collection for blog articles" },
      { title: 'Map fields', description: "Content field (required) — RichText field for article HTML" },
      { title: 'Test Connection → Done!', description: "The collection is verified — if successful, the site is saved." },
    ],
    techTitle: 'Technical: adapter_config schema',
    techDesc: <>Stored encrypted in the <InlineCode>sites.adapter_config</InlineCode> JSONB field. <InlineCode>apiToken</InlineCode> is encrypted with AES-256-GCM.</>,
    publishTitle: 'Publishing process',
    publishDesc: 'When JetBlog publishes an article via Webflow Data API v2:',
    publishSteps: [
      { description: <><InlineCode>POST /v2/collections/{'{collectionId}'}/items</InlineCode> — with <InlineCode>isDraft: false</InlineCode> (immediately LIVE)</> },
      { description: <><InlineCode>fieldData</InlineCode> always includes <InlineCode>name</InlineCode> and <InlineCode>slug</InlineCode></> },
      { description: "Mapped fields (body, summary, image) are added to fieldData" },
      { description: <>Live URL: <InlineCode>https://&#123;domain&#125;/&#123;collectionSlug&#125;/&#123;itemSlug&#125;</InlineCode></> },
      { description: "An image error does not stop publishing (non-fatal)" },
    ],
    testTitle: "Test API usage",
    err402Title: "402 — CMS API not available",
    err402Body: <>Upgrade to <strong>Basic ($14/mo)</strong>.</>,
    err401Title: "401/403 — Invalid token",
    err401Body: <>Make sure the token has <InlineCode>cms:read</InlineCode> and <InlineCode>cms:write</InlineCode> permissions.</>,
    errImageTitle: "Image not displaying",
    errImageBody: "Open the item in Webflow Designer and re-upload the image. Publishing does not stop on image errors.",
  },
};

export async function WebflowPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <Callout variant="warning" title={c.planWarningTitle} className="mb-8">
        {c.planWarningBody}
      </Callout>

      <DocsH2>{c.apiTokenTitle}</DocsH2>
      <StepList className="mb-8" steps={c.apiTokenSteps} />

      <DocsH2>{c.connectTitle}</DocsH2>
      <StepList className="mb-8" steps={c.connectSteps} />

      <DocsH2>{c.techTitle}</DocsH2>
      <DocsPara>{c.techDesc}</DocsPara>
      <CodeBlock
        language="typescript"
        filename="WebflowAdapterConfig"
        code={`type WebflowAdapterConfig = {
  apiToken:       string;   // AES-256-GCM encrypted Webflow Site API Token
  siteId:         string;   // Webflow site ID  (e.g. "64a1b2c3d4e5f6a7b8c9d0e1")
  collectionId:   string;   // CMS Collection ID
  collectionSlug: string;   // collection URL slug (e.g. "blog-posts")
  siteDomain:     string;   // primary domain   (e.g. "example.webflow.io")
  fieldMap: {
    body:     string;         // REQUIRED — RichText field slug for article HTML
    title?:   string;         // optional custom PlainText field for title
    summary?: string;         // optional PlainText field for SEO description
    image?:   string;         // optional Image field for featured image
  };
};`}
        className="mb-8"
      />

      <DocsH2>{c.publishTitle}</DocsH2>
      <DocsPara>{c.publishDesc}</DocsPara>
      <StepList className="mb-8" steps={c.publishSteps} />

      <DocsH2>{c.testTitle}</DocsH2>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# List sites
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.webflow.com/v2/sites

# View collection fields
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.webflow.com/v2/collections/YOUR_COLLECTION_ID

# Test: create CMS item
curl -X POST \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"isDraft":false,"isArchived":false,"fieldData":{"name":"Test Article","slug":"test-article","YOUR_BODY_FIELD":"<p>Hello world!</p>"}}' \\
  https://api.webflow.com/v2/collections/YOUR_COLLECTION_ID/items`}
        className="mb-8"
      />

      <Callout variant="warning" title={c.err402Title} className="mb-4">{c.err402Body}</Callout>
      <Callout variant="info" title={c.err401Title} className="mb-4">{c.err401Body}</Callout>
      <Callout variant="info" title={c.errImageTitle} className="mb-4">{c.errImageBody}</Callout>
    </div>
  );
}
