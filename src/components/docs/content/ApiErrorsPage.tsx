import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const ERROR_RESPONSE_CODE = `{
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS",
  "details": {
    "required": 1,
    "available": 0
  }
}`;

interface ErrorRow { code: string; name: string; desc: string; fix: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  formatTitle: string; formatDesc: string;
  codesTitle: string;
  errors: ErrorRow[];
  clientLabel: string; serverLabel: string; solutionLabel: string;
  calloutTitle: string; calloutBody: string;
}> = {
  uz: {
    badge: "API ma'lumotnoma",
    title: 'Xato kodlari',
    description: "JetBlog API xato javoblarini standart HTTP status kodlari bilan qaytaradi.",
    formatTitle: 'Xato javob formati',
    formatDesc: 'Barcha xato javoblar JSON formatda:',
    codesTitle: 'HTTP status kodlari',
    solutionLabel: 'Yechim',
    clientLabel: 'Client',
    serverLabel: 'Server',
    errors: [
      { code: '400', name: 'Bad Request', desc: "So'rov formati noto'g'ri yoki majburiy maydonlar yetishmayapti", fix: 'Request body ni tekshiring' },
      { code: '401', name: 'Unauthorized', desc: "JWT token yo'q yoki muddati o'tgan", fix: 'Qayta login qiling va yangi token oling' },
      { code: '402', name: 'Payment Required', desc: 'Kredit yetarli emas', fix: 'Settings → Billing → Add Credits' },
      { code: '403', name: 'Forbidden', desc: "Bu resursga ruxsatingiz yo'q", fix: "To'g'ri resurs ID ni ishlatayotganingizni tekshiring" },
      { code: '404', name: 'Not Found', desc: 'Resurs topilmadi', fix: "ID to'g'riligini tekshiring" },
      { code: '422', name: 'Unprocessable Entity', desc: "Ma'lumotlar noto'g'ri (validatsiya xatosi)", fix: "Barcha maydonlar to'g'ri formatda ekanini tekshiring" },
      { code: '429', name: 'Too Many Requests', desc: 'Rate limit oshib ketdi', fix: "60 soniya kuting va qayta urinib ko'ring" },
      { code: '500', name: 'Internal Server Error', desc: 'Server xatosi', fix: 'Agar takrorlanib tursa, support@jetblog.app ga yozing' },
      { code: '502', name: 'Bad Gateway', desc: 'Tashqi API (WordPress, Ghost) javob bermadi', fix: "Platformangizning ishlayotganini tekshiring" },
    ],
    calloutTitle: 'Rate limiting',
    calloutBody: "JetBlog generatsiya endpointlari uchun foydalanuvchi boshiga 10 so'rov/daqiqa cheklovi mavjud. Retry-After headerda qancha kutish kerakligini ko'rasiz.",
  },
  ru: {
    badge: 'Справочник API',
    title: 'Коды ошибок',
    description: 'JetBlog API возвращает ошибки со стандартными HTTP-статус кодами.',
    formatTitle: 'Формат ответа с ошибкой',
    formatDesc: 'Все ответы с ошибками возвращаются в формате JSON:',
    codesTitle: 'HTTP-статус коды',
    solutionLabel: 'Решение',
    clientLabel: 'Client',
    serverLabel: 'Server',
    errors: [
      { code: '400', name: 'Bad Request', desc: 'Неверный формат запроса или отсутствуют обязательные поля', fix: 'Проверьте тело запроса' },
      { code: '401', name: 'Unauthorized', desc: 'JWT токен отсутствует или истёк', fix: 'Войдите снова и получите новый токен' },
      { code: '402', name: 'Payment Required', desc: 'Недостаточно кредитов', fix: 'Settings → Billing → Add Credits' },
      { code: '403', name: 'Forbidden', desc: 'Нет доступа к этому ресурсу', fix: 'Убедитесь, что используете правильный ID ресурса' },
      { code: '404', name: 'Not Found', desc: 'Ресурс не найден', fix: 'Проверьте правильность ID' },
      { code: '422', name: 'Unprocessable Entity', desc: 'Данные некорректны (ошибка валидации)', fix: 'Убедитесь, что все поля в правильном формате' },
      { code: '429', name: 'Too Many Requests', desc: 'Превышен лимит запросов', fix: 'Подождите 60 секунд и попробуйте снова' },
      { code: '500', name: 'Internal Server Error', desc: 'Ошибка сервера', fix: 'Если повторяется — напишите на support@jetblog.app' },
      { code: '502', name: 'Bad Gateway', desc: 'Внешний API (WordPress, Ghost) не ответил', fix: 'Проверьте, работает ли ваша платформа' },
    ],
    calloutTitle: 'Rate limiting',
    calloutBody: 'Для эндпоинтов генерации действует ограничение 10 запросов/мин на пользователя. В заголовке Retry-After указано, сколько нужно подождать.',
  },
  en: {
    badge: 'API Reference',
    title: 'Error codes',
    description: 'JetBlog API returns errors with standard HTTP status codes.',
    formatTitle: 'Error response format',
    formatDesc: 'All error responses are returned in JSON:',
    codesTitle: 'HTTP status codes',
    solutionLabel: 'Fix',
    clientLabel: 'Client',
    serverLabel: 'Server',
    errors: [
      { code: '400', name: 'Bad Request', desc: 'Malformed request or missing required fields', fix: 'Check the request body' },
      { code: '401', name: 'Unauthorized', desc: 'JWT token missing or expired', fix: 'Log in again and get a new token' },
      { code: '402', name: 'Payment Required', desc: 'Insufficient credits', fix: 'Settings → Billing → Add Credits' },
      { code: '403', name: 'Forbidden', desc: 'No permission to access this resource', fix: 'Verify you are using the correct resource ID' },
      { code: '404', name: 'Not Found', desc: 'Resource not found', fix: 'Check that the ID is correct' },
      { code: '422', name: 'Unprocessable Entity', desc: 'Invalid data (validation error)', fix: 'Make sure all fields are in the correct format' },
      { code: '429', name: 'Too Many Requests', desc: 'Rate limit exceeded', fix: 'Wait 60 seconds and try again' },
      { code: '500', name: 'Internal Server Error', desc: 'Server error', fix: 'If it recurs, email support@jetblog.app' },
      { code: '502', name: 'Bad Gateway', desc: 'External API (WordPress, Ghost) did not respond', fix: 'Check that your platform is running' },
    ],
    calloutTitle: 'Rate limiting',
    calloutBody: 'Generation endpoints are limited to 10 requests/min per user. The Retry-After header shows how long to wait.',
  },
};

export async function ApiErrorsPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.formatTitle}</DocsH2>
      <DocsPara>{c.formatDesc}</DocsPara>
      <CodeBlock language="json" filename="error-response.json" code={ERROR_RESPONSE_CODE} className="mb-8" />

      <DocsH2>{c.codesTitle}</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {c.errors.map((err) => {
          const isClient = parseInt(err.code) < 500;
          return (
            <div key={err.code} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
              <div className="flex items-start gap-3">
                <InlineCode>{err.code}</InlineCode>
                <div className="flex-1">
                  <p className="font-semibold text-white">{err.name}</p>
                  <p className="text-zinc-400 mt-0.5">{err.desc}</p>
                  <p className="text-zinc-600 text-xs mt-1.5">
                    <span className="text-zinc-500">{c.solutionLabel}: </span>{err.fix}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                  isClient
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {isClient ? c.clientLabel : c.serverLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Callout variant="info" title={c.calloutTitle}>
        {c.calloutBody.split('Retry-After')[0]}
        <InlineCode>Retry-After</InlineCode>
        {c.calloutBody.split('Retry-After')[1] ?? ''}
      </Callout>
    </div>
  );
}
