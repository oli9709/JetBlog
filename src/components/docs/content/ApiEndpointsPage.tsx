import React from 'react';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';

interface Endpoint {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  request?: string;
  response200?: string;
  errors?: { code: string; desc: string }[];
}

const METHOD_COLOR: Record<string, string> = {
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/sites/verify',
    description: 'Sayt ulanishini tekshirish va saqlash',
    request: `{
  "url": "https://yoursite.com",
  "wp_username": "admin",        // WordPress uchun
  "wp_password": "xxxx xxxx...", // WordPress uchun
  "ghost_api_key": "id:secret",  // Ghost uchun
  "platform": "wordpress"        // wordpress | ghost | webflow | webhook
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
      { code: '401', desc: 'Autentifikatsiya xatosi' },
      { code: '422', desc: "URL yoki credentials noto'g'ri" },
      { code: '500', desc: "Saytga ulanib bo'lmadi" },
    ],
  },
  {
    method: 'POST',
    path: '/api/sites/detect',
    description: "URL ga qarab platformani aniqlash",
    request: `{ "url": "https://example.com" }`,
    response200: `{
  "platform": "ghost",
  "confidence": 0.95,
  "hints": ["ghost-admin detected", "x-powered-by: Ghost"]
}`,
    errors: [
      { code: '422', desc: "URL noto'g'ri format" },
    ],
  },
  {
    method: 'POST',
    path: '/api/generate',
    description: 'Kalit so\'z uchun AI maqola generatsiya qilish',
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
      { code: '402', desc: 'Kredit yetarli emas' },
      { code: '404', desc: "Kalit so'z topilmadi" },
      { code: '429', desc: 'Juda ko\'p so\'rov' },
    ],
  },
  {
    method: 'POST',
    path: '/api/wordpress/publish',
    description: 'Maqolani WordPress/Ghost/Webflow ga nashr qilish',
    request: `{ "articleId": "uuid" }`,
    response200: `{
  "postId": "1234",
  "url": "https://yoursite.com/maqola-slug",
  "platform": "wordpress"
}`,
    errors: [
      { code: '401', desc: 'Autentifikatsiya xatosi' },
      { code: '404', desc: 'Maqola topilmadi' },
      { code: '500', desc: 'Platforma xatosi' },
    ],
  },
  {
    method: 'GET',
    path: '/api/gsc/stats',
    description: 'Google Search Console statistikasini olish',
    response200: `{
  "clicks": 1234,
  "impressions": 45678,
  "ctr": 0.027,
  "position": 12.4,
  "keywords": [{ "keyword": "...", "clicks": 45 }]
}`,
    errors: [
      { code: '401', desc: 'GSC ulanmagan' },
    ],
  },
];

function EndpointCard({ ep }: { ep: Endpoint }) {
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
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Xatolar</p>
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

export function ApiEndpointsPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="API ma'lumotnoma"
        title="Endpointlar"
        description="JetBlog API endpointlari ro'yxati — so'rov va javob formatlari bilan."
      />
      <DocsH2>Barcha endpointlar</DocsH2>
      {ENDPOINTS.map((ep) => (
        <EndpointCard key={ep.path} ep={ep} />
      ))}
    </div>
  );
}
