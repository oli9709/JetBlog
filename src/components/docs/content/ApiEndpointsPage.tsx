import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';

interface Props { locale?: string }

const METHOD_COLOR: Record<string, string> = {
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/25',
};

interface Endpoint {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  request?: string;
  response200?: string;
  errors?: { code: string; desc: string }[];
}

function buildEndpoints(locale: string): Endpoint[] {
  const t = {
    uz: {
      verifydesc: 'Sayt ulanishini tekshirish va saqlash',
      detectdesc: 'URL ga qarab platformani aniqlash',
      gendesc: "Kalit so'z uchun AI maqola generatsiya qilish",
      publishdesc: 'Maqolani WordPress/Ghost/Webflow ga nashr qilish',
      gscdesc: 'Google Search Console statistikasini olish',
      errorsLabel: 'Xatolar',
      e401: 'Autentifikatsiya xatosi',
      e422_cred: "URL yoki credentials noto'g'ri",
      e500_conn: "Saytga ulanib bo'lmadi",
      e422_url: "URL noto'g'ri format",
      e402: 'Kredit yetarli emas',
      e404_kw: "Kalit so'z topilmadi",
      e429: "Juda ko'p so'rov",
      e404_art: 'Maqola topilmadi',
      e500_plat: 'Platforma xatosi',
      e401_gsc: 'GSC ulanmagan',
    },
    ru: {
      verifydesc: 'Проверка и сохранение подключения сайта',
      detectdesc: 'Определение платформы по URL',
      gendesc: 'Генерация AI-статьи для ключевого слова',
      publishdesc: 'Публикация статьи в WordPress/Ghost/Webflow',
      gscdesc: 'Получение статистики Google Search Console',
      errorsLabel: 'Ошибки',
      e401: 'Ошибка аутентификации',
      e422_cred: 'Неверный URL или учётные данные',
      e500_conn: 'Не удалось подключиться к сайту',
      e422_url: 'Неверный формат URL',
      e402: 'Недостаточно кредитов',
      e404_kw: 'Ключевое слово не найдено',
      e429: 'Слишком много запросов',
      e404_art: 'Статья не найдена',
      e500_plat: 'Ошибка платформы',
      e401_gsc: 'GSC не подключён',
    },
    en: {
      verifydesc: 'Verify and save site connection',
      detectdesc: 'Detect platform type from URL',
      gendesc: 'Generate an AI article for a keyword',
      publishdesc: 'Publish article to WordPress/Ghost/Webflow',
      gscdesc: 'Fetch Google Search Console statistics',
      errorsLabel: 'Errors',
      e401: 'Authentication error',
      e422_cred: 'Invalid URL or credentials',
      e500_conn: 'Could not connect to site',
      e422_url: 'Invalid URL format',
      e402: 'Insufficient credits',
      e404_kw: 'Keyword not found',
      e429: 'Too many requests',
      e404_art: 'Article not found',
      e500_plat: 'Platform error',
      e401_gsc: 'GSC not connected',
    },
  };
  const s = t[locale as keyof typeof t] ?? t.uz;

  return [
    {
      method: 'POST', path: '/api/sites/verify', description: s.verifydesc,
      request: `{
  "url": "https://yoursite.com",
  "wp_username": "admin",
  "wp_password": "xxxx xxxx...",
  "ghost_api_key": "id:secret",
  "platform": "wordpress"
}`,
      response200: `{
  "site": {
    "id": "uuid",
    "url": "https://yoursite.com",
    "platform_type": "wordpress",
    "is_active": true
  }
}`,
      errors: [
        { code: '401', desc: s.e401 },
        { code: '422', desc: s.e422_cred },
        { code: '500', desc: s.e500_conn },
      ],
    },
    {
      method: 'POST', path: '/api/sites/detect', description: s.detectdesc,
      request: `{ "url": "https://example.com" }`,
      response200: `{
  "platform": "ghost",
  "confidence": 0.95,
  "hints": ["ghost-admin detected", "x-powered-by: Ghost"]
}`,
      errors: [{ code: '422', desc: s.e422_url }],
    },
    {
      method: 'POST', path: '/api/generate', description: s.gendesc,
      request: `{ "keywordId": "uuid" }`,
      response200: `{
  "article": {
    "id": "uuid",
    "title": "...",
    "content": "<h1>...</h1>...",
    "featuredImageUrl": "https://...",
    "status": "draft"
  }
}`,
      errors: [
        { code: '402', desc: s.e402 },
        { code: '404', desc: s.e404_kw },
        { code: '429', desc: s.e429 },
      ],
    },
    {
      method: 'POST', path: '/api/wordpress/publish', description: s.publishdesc,
      request: `{ "articleId": "uuid" }`,
      response200: `{
  "postId": "1234",
  "url": "https://yoursite.com/article-slug",
  "platform": "wordpress"
}`,
      errors: [
        { code: '401', desc: s.e401 },
        { code: '404', desc: s.e404_art },
        { code: '500', desc: s.e500_plat },
      ],
    },
    {
      method: 'GET', path: '/api/gsc/stats', description: s.gscdesc,
      response200: `{
  "clicks": 1234,
  "impressions": 45678,
  "ctr": 0.027,
  "position": 12.4,
  "keywords": [{ "keyword": "...", "clicks": 45 }]
}`,
      errors: [{ code: '401', desc: s.e401_gsc }],
    },
  ];
}

const LABELS: Record<string, { badge: string; title: string; description: string; allTitle: string; errorsLabel: string }> = {
  uz: {
    badge: "API ma'lumotnoma",
    title: 'Endpointlar',
    description: "JetBlog API endpointlari ro'yxati — so'rov va javob formatlari bilan.",
    allTitle: 'Barcha endpointlar',
    errorsLabel: 'Xatolar',
  },
  ru: {
    badge: 'Справочник API',
    title: 'Эндпоинты',
    description: 'Список эндпоинтов JetBlog API с форматами запроса и ответа.',
    allTitle: 'Все эндпоинты',
    errorsLabel: 'Ошибки',
  },
  en: {
    badge: 'API Reference',
    title: 'Endpoints',
    description: 'List of JetBlog API endpoints with request and response formats.',
    allTitle: 'All endpoints',
    errorsLabel: 'Errors',
  },
};

function EndpointCard({ ep, errorsLabel }: { ep: Endpoint; errorsLabel: string }) {
  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 bg-zinc-900/50 border-b border-zinc-800">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${METHOD_COLOR[ep.method]}`}>
          {ep.method}
        </span>
        <code className="text-sm font-mono text-white">{ep.path}</code>
        <span className="text-sm text-zinc-500 ml-auto">{ep.description}</span>
      </div>
      <div className="p-5 space-y-5">
        {ep.request && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Request body</p>
            <CodeBlock language="json" code={ep.request} />
          </div>
        )}
        {ep.response200 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Response 200</p>
            <CodeBlock language="json" code={ep.response200} />
          </div>
        )}
        {ep.errors && ep.errors.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">{errorsLabel}</p>
            <div className="flex flex-col gap-2">
              {ep.errors.map((e) => (
                <div key={e.code} className="flex items-center gap-3 text-sm">
                  <InlineCode>{e.code}</InlineCode>
                  <span className="text-zinc-400">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function ApiEndpointsPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const l = LABELS[locale] ?? LABELS.uz;
  const endpoints = buildEndpoints(locale);
  return (
    <div>
      <DocsPageHeader badge={l.badge} title={l.title} description={l.description} />
      <DocsH2>{l.allTitle}</DocsH2>
      {endpoints.map((ep) => (
        <EndpointCard key={ep.path} ep={ep} errorsLabel={l.errorsLabel} />
      ))}
    </div>
  );
}
