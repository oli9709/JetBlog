import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  apiKeyTitle: string;
  apiKeySteps: { title: string; description: React.ReactNode }[];
  connectTitle: string;
  connectSteps: { description: React.ReactNode }[];
  testTitle: string; testDesc: string;
  formatTitle: string; formatDesc: React.ReactNode;
  warningTitle: string; warningBody: React.ReactNode;
  jwtNote: string;
}> = {
  uz: {
    badge: 'Platformalar',
    title: 'Ghost CMS',
    description: 'Ghost Admin API orqali JetBlog ga ulang. Ghost 5.x va undan yuqori talab qilinadi.',
    apiKeyTitle: 'Admin API Key olish',
    apiKeySteps: [
      { title: 'Ghost Admin ga kiring', description: <><InlineCode>yoursite.com/ghost</InlineCode> ga o&apos;ting</> },
      { title: "Settings ga o'ting", description: <>Chap pastdagi tishli g&apos;ildirak icon → <strong className="text-white">Settings</strong></> },
      { title: 'Integrations', description: <><strong className="text-white">Integrations → Add custom integration</strong> tugmasini bosing</> },
      { title: 'JetBlog integratsiyasi', description: <>Nom kiriting: <InlineCode>JetBlog</InlineCode> → <strong className="text-white">Create</strong></> },
      { title: 'Admin API Key', description: <><strong className="text-white">Admin API Key</strong> ni nusxalab oling. Format: <InlineCode>64hex:64hex</InlineCode></> },
    ],
    connectTitle: 'JetBlog da ulash',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish</strong> → <strong className="text-white">Ghost</strong> tanlang</> },
      { description: <><strong className="text-white">Ghost URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">Admin API Key</strong>: Yuqorida nusxalagan kalit (id:secret formatida)</> },
      { description: <><strong className="text-white">Test connection</strong> → Muvaffaqiyatli ulandi!</> },
    ],
    testTitle: 'Ulanishni tekshirish (curl)',
    testDesc: 'Admin API Key formatini tekshirish:',
    formatTitle: 'Admin API Key formati',
    formatDesc: <>Ghost Admin API Key ikkita qismdan iborat, ikki nuqta (<InlineCode>:</InlineCode>) bilan ajratilgan:</>,
    warningTitle: 'Muhim',
    warningBody: <><strong>Admin API Key</strong> kerak — Content API emas. Content API faqat o&apos;qish uchun, nashr qilish imkoni yo&apos;q.</>,
    jwtNote: 'JWT token yaratish uchun Ghost Admin API ning rasmiy kutubxonasidan foydalaning. JetBlog buni avtomatik bajaradi.',
  },
  ru: {
    badge: 'Платформы',
    title: 'Ghost CMS',
    description: 'Подключите JetBlog через Ghost Admin API. Требуется Ghost 5.x или выше.',
    apiKeyTitle: 'Получение Admin API Key',
    apiKeySteps: [
      { title: 'Войдите в Ghost Admin', description: <><InlineCode>yoursite.com/ghost</InlineCode></> },
      { title: 'Перей��ите в Settings', description: <>Значок шестерёнки внизу слева → <strong className="text-white">Settings</strong></> },
      { title: 'Integrations', description: <><strong className="text-white">Integrations → Add custom integration</strong></> },
      { title: 'Интеграция JetBlog', description: <>Введите название: <InlineCode>JetBlog</InlineCode> → <strong className="text-white">Create</strong></> },
      { title: 'Admin API Key', description: <>Скопируйте <strong className="text-white">Admin API Key</strong>. Формат: <InlineCode>64hex:64hex</InlineCode></> },
    ],
    connectTitle: 'Подключение в JetBlog',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Добавить сайт</strong> → выберите <strong className="text-white">Ghost</strong></> },
      { description: <><strong className="text-white">Ghost URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">Admin API Key</strong>: ключ, скопированный выше (формат id:secret)</> },
      { description: <><strong className="text-white">Test connection</strong> → Успешно подключено!</> },
    ],
    testTitle: 'Проверка подключения (curl)',
    testDesc: 'Проверка формата Admin API Key:',
    formatTitle: 'Формат Admin API Key',
    formatDesc: <>Ghost Admin API Key состоит из двух частей, разделённых двоеточием (<InlineCode>:</InlineCode>):</>,
    warningTitle: 'Важно',
    warningBody: <>Нужен <strong>Admin API Key</strong>, а не Content API Key. Content API доступен только для чтения — публикация недоступна.</>,
    jwtNote: 'JWT-токен создаётся с помощью официальной библиотеки Ghost Admin API. JetBlog делает это автоматически.',
  },
  en: {
    badge: 'Platforms',
    title: 'Ghost CMS',
    description: 'Connect JetBlog via the Ghost Admin API. Requires Ghost 5.x or higher.',
    apiKeyTitle: 'Get the Admin API Key',
    apiKeySteps: [
      { title: 'Log into Ghost Admin', description: <><InlineCode>yoursite.com/ghost</InlineCode></> },
      { title: 'Go to Settings', description: <>Gear icon at bottom-left → <strong className="text-white">Settings</strong></> },
      { title: 'Integrations', description: <><strong className="text-white">Integrations → Add custom integration</strong></> },
      { title: 'JetBlog integration', description: <>Enter a name: <InlineCode>JetBlog</InlineCode> → <strong className="text-white">Create</strong></> },
      { title: 'Admin API Key', description: <>Copy the <strong className="text-white">Admin API Key</strong>. Format: <InlineCode>64hex:64hex</InlineCode></> },
    ],
    connectTitle: 'Connect in JetBlog',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Add Site</strong> → select <strong className="text-white">Ghost</strong></> },
      { description: <><strong className="text-white">Ghost URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">Admin API Key</strong>: the key copied above (id:secret format)</> },
      { description: <><strong className="text-white">Test connection</strong> → Successfully connected!</> },
    ],
    testTitle: 'Test connection (curl)',
    testDesc: 'Check the Admin API Key format:',
    formatTitle: 'Admin API Key format',
    formatDesc: <>The Ghost Admin API Key consists of two parts separated by a colon (<InlineCode>:</InlineCode>):</>,
    warningTitle: 'Important',
    warningBody: <>You need the <strong>Admin API Key</strong>, not the Content API Key. Content API is read-only — publishing is not available.</>,
    jwtNote: 'JWT tokens are created using the official Ghost Admin API library. JetBlog does this automatically.',
  },
};

export async function GhostPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.apiKeyTitle}</DocsH2>
      <StepList className="mb-8" steps={c.apiKeySteps} />

      <DocsH2>{c.connectTitle}</DocsH2>
      <StepList className="mb-8" steps={c.connectSteps} />

      <DocsH2>{c.testTitle}</DocsH2>
      <DocsPara>{c.testDesc}</DocsPara>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Admin API Key format: [id]:[secret]\n# Example: 64a7d123abc...:def456789...\n\ncurl -H "Authorization: Ghost [JWT_TOKEN]" \\\n  https://yoursite.com/ghost/api/admin/posts/ \\\n  -X GET`}
        className="mb-4"
      />
      <Callout variant="info" className="mb-8">{c.jwtNote}</Callout>

      <DocsH2>{c.formatTitle}</DocsH2>
      <DocsPara>{c.formatDesc}</DocsPara>
      <CodeBlock
        language="text"
        code={`# Admin API Key format:\n# {64-char-id}:{64-char-secret}\n\nExample:\n64a7c05e3f2b1d890abc1234:def567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12`}
        className="mb-8"
      />

      <Callout variant="warning" title={c.warningTitle}>
        {c.warningBody}
      </Callout>
    </div>
  );
}
