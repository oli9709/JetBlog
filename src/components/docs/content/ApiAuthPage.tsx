import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const AUTH_CODE = `// Get token from Supabase session
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// Send API request
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({ keywordId: 'uuid' })
})`;

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  tokenTitle: string; tokenDesc: string;
  expiryTitle: string; expiryDesc: string;
  errorsTitle: string;
  errors: { code: string; desc: string; solution: string }[];
  callout: string;
}> = {
  uz: {
    badge: "API ma'lumotnoma",
    title: 'Autentifikatsiya',
    description: 'JetBlog API Supabase JWT token orqali autentifikatsiya qiladi.',
    tokenTitle: 'Token olish',
    tokenDesc: "JetBlog API endpointlari Supabase Auth sessiyasidan olingan JWT tokenni talab qiladi. Token Authorization: Bearer {token} header orqali yuboriladi.",
    expiryTitle: 'Token muddati',
    expiryDesc: "Supabase JWT tokenlari 1 soat davomida amal qiladi. supabase.auth.getSession() avtomatik yangilaydi.",
    errorsTitle: 'Xato javoblari',
    errors: [
      { code: '401', desc: "Token yo'q yoki muddati o'tgan", solution: 'Qayta login qiling' },
      { code: '403', desc: "Ruxsat yo'q (boshqa foydalanuvchi resursi)", solution: "To'g'ri resurs ID ni ishlatayotganingizni tekshiring" },
    ],
    callout: 'API faqat autentifikatsiya qilingan foydalanuvchilar uchun. Tashqi client uchun API key hozircha mavjud emas.',
  },
  ru: {
    badge: 'Справочник API',
    title: 'Аутентификация',
    description: 'JetBlog API аутентифицирует запросы через Supabase JWT токен.',
    tokenTitle: 'Получение токена',
    tokenDesc: 'Эндпоинты JetBlog API требуют JWT токен из сессии Supabase Auth. Токен передаётся через заголовок Authorization: Bearer {token}.',
    expiryTitle: 'Срок действия токена',
    expiryDesc: 'JWT токены Supabase действуют 1 час. supabase.auth.getSession() автоматически обновляет их.',
    errorsTitle: 'Ошибки',
    errors: [
      { code: '401', desc: 'Токен отсутствует или истёк', solution: 'Войдите снова' },
      { code: '403', desc: 'Нет доступа (ресурс другого пользователя)', solution: 'Убедитесь, что используете правильный ID ресурса' },
    ],
    callout: 'API доступен только для аутентифицированных пользователей. Внешние API-ключи пока не поддерживаются.',
  },
  en: {
    badge: 'API Reference',
    title: 'Authentication',
    description: 'JetBlog API authenticates requests via a Supabase JWT token.',
    tokenTitle: 'Getting a token',
    tokenDesc: 'JetBlog API endpoints require a JWT token from a Supabase Auth session. The token is sent via the Authorization: Bearer {token} header.',
    expiryTitle: 'Token expiry',
    expiryDesc: 'Supabase JWT tokens are valid for 1 hour. supabase.auth.getSession() refreshes them automatically.',
    errorsTitle: 'Error responses',
    errors: [
      { code: '401', desc: 'Token missing or expired', solution: 'Log in again' },
      { code: '403', desc: 'No permission (another user\'s resource)', solution: 'Verify you are using the correct resource ID' },
    ],
    callout: 'The API is available for authenticated users only. External API keys are not yet supported.',
  },
};

export function ApiAuthPage({ locale = 'uz' }: Props) {
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.tokenTitle}</DocsH2>
      <DocsPara>
        {c.tokenDesc.replace('{token}', '').split('Authorization: Bearer ')[0]}
        <InlineCode>Authorization: Bearer {'{token}'}</InlineCode>
        {c.tokenDesc.split('Authorization: Bearer {token}')[1] ?? ''}
      </DocsPara>

      <CodeBlock language="javascript" filename="auth-example.js" code={AUTH_CODE} className="mb-8" />

      <DocsH2>{c.expiryTitle}</DocsH2>
      <DocsPara>
        {c.expiryDesc.split('supabase.auth.getSession()')[0]}
        <InlineCode>supabase.auth.getSession()</InlineCode>
        {c.expiryDesc.split('supabase.auth.getSession()')[1] ?? ''}
      </DocsPara>

      <DocsH2>{c.errorsTitle}</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {c.errors.map((item) => (
          <div key={item.code} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm">
            <InlineCode>{item.code}</InlineCode>
            <div>
              <p className="text-zinc-300 font-medium">{item.desc}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout variant="info">{c.callout}</Callout>
    </div>
  );
}
