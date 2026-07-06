import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

const AUTH_CODE = `// Supabase sessiyadan token olish
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// API ga so'rov yuborish
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({ keywordId: 'uuid' })
})`;

export function ApiAuthPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="API ma'lumotnoma"
        title="Autentifikatsiya"
        description="JetBlog API Supabase JWT token orqali autentifikatsiya qiladi."
      />

      <DocsH2>Token olish</DocsH2>
      <DocsPara>
        JetBlog API endpointlari Supabase Auth sessiyasidan olingan JWT tokenni talab qiladi.
        Token <InlineCode>Authorization: Bearer {'{token}'}</InlineCode> header orqali yuboriladi.
      </DocsPara>

      <CodeBlock language="javascript" filename="auth-example.js" code={AUTH_CODE} className="mb-8" />

      <DocsH2>Token muddati</DocsH2>
      <DocsPara>
        Supabase JWT tokenlari 1 soat davomida amal qiladi. <InlineCode>supabase.auth.getSession()</InlineCode> avtomatik yangilaydi.
      </DocsPara>

      <DocsH2>Xato javoblari</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {[
          { code: '401', desc: 'Token yo\'q yoki muddati o\'tgan', solution: 'Qayta login qiling' },
          { code: '403', desc: 'Ruxsat yo\'q (boshqa foydalanuvchi resursi)', solution: 'To\'g\'ri resurs ID ni ishlatayotganingizni tekshiring' },
        ].map((item) => (
          <div key={item.code} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm">
            <InlineCode>{item.code}</InlineCode>
            <div>
              <p className="text-zinc-300 font-medium">{item.desc}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout variant="info">
        API faqat autentifikatsiya qilingan foydalanuvchilar uchun. Tashqi client uchun API key hozircha mavjud emas.
      </Callout>
    </div>
  );
}
