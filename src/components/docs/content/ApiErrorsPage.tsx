import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

const ERRORS = [
  { code: '400', name: 'Bad Request', desc: "So'rov formati noto'g'ri yoki majburiy maydonlar yetishmayapti", fix: 'Request body ni tekshiring' },
  { code: '401', name: 'Unauthorized', desc: 'JWT token yo\'q yoki muddati o\'tgan', fix: 'Qayta login qiling va yangi token oling' },
  { code: '402', name: 'Payment Required', desc: 'Kredit yetarli emas', fix: 'Settings → Billing → Add Credits' },
  { code: '403', name: 'Forbidden', desc: 'Bu resursga ruxsatingiz yo\'q', fix: 'To\'g\'ri resurs ID ni ishlatayotganingizni tekshiring' },
  { code: '404', name: 'Not Found', desc: 'Resurs topilmadi', fix: 'ID to\'g\'riligini tekshiring' },
  { code: '422', name: 'Unprocessable Entity', desc: 'Ma\'lumotlar noto\'g\'ri (validatsiya xatosi)', fix: 'Barcha maydonlar to\'g\'ri formatda ekanini tekshiring' },
  { code: '429', name: 'Too Many Requests', desc: 'Rate limit oshib ketdi', fix: '60 soniya kuting va qayta urinib ko\'ring' },
  { code: '500', name: 'Internal Server Error', desc: 'Server xatosi', fix: 'Agar takrorlanib tursa, support@jetblog.app ga yozing' },
  { code: '502', name: 'Bad Gateway', desc: 'Tashqi API (WordPress, Ghost) javob bermadi', fix: "Platformangizning ishlayotganini tekshiring" },
];

const ERROR_RESPONSE_CODE = `{
  "error": "Kredit yetarli emas",
  "code": "INSUFFICIENT_CREDITS",
  "details": {
    "required": 1,
    "available": 0
  }
}`;

export function ApiErrorsPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="API ma'lumotnoma"
        title="Xato kodlari"
        description="JetBlog API xato javoblarini standart HTTP status kodlari bilan qaytaradi."
      />

      <DocsH2>Xato javob formati</DocsH2>
      <DocsPara>Barcha xato javoblar JSON formatda:</DocsPara>
      <CodeBlock language="json" filename="error-response.json" code={ERROR_RESPONSE_CODE} className="mb-8" />

      <DocsH2>HTTP status kodlari</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {ERRORS.map((err) => {
          const isClient = parseInt(err.code) < 500;
          return (
            <div key={err.code} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
              <div className="flex items-start gap-3">
                <InlineCode>{err.code}</InlineCode>
                <div className="flex-1">
                  <p className="font-semibold text-white">{err.name}</p>
                  <p className="text-zinc-400 mt-0.5">{err.desc}</p>
                  <p className="text-zinc-600 text-xs mt-1.5">
                    <span className="text-zinc-500">Yechim: </span>{err.fix}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                  isClient
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {isClient ? 'Client' : 'Server'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Callout variant="info" title="Rate limiting">
        JetBlog generatsiya endpointlari uchun foydalanuvchi boshiga 10 so&apos;rov/daqiqa cheklovi mavjud.
        <InlineCode>Retry-After</InlineCode> header da qancha kutish kerakligini ko&apos;rasiz.
      </Callout>
    </div>
  );
}
