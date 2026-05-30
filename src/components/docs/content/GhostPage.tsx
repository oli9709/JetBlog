import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

export function GhostPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Platformalar"
        title="Ghost CMS"
        description="Ghost Admin API orqali JetBlog ga ulang. Ghost 5.x va undan yuqori talab qilinadi."
      />

      <DocsH2>Admin API Key olish</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Ghost Admin ga kiring',
            description: <><InlineCode>yoursite.com/ghost</InlineCode> ga o&apos;ting</>,
          },
          {
            title: 'Settings ga o\'ting',
            description: <>Chap pastdagi tishli g&apos;ildirak icon → <strong className="text-white">Settings</strong></>,
          },
          {
            title: 'Integrations',
            description: <><strong className="text-white">Integrations → Add custom integration</strong> tugmasini bosing</>,
          },
          {
            title: 'JetBlog integratsiyasi',
            description: <>Nom kiriting: <InlineCode>JetBlog</InlineCode> → <strong className="text-white">Create</strong></>,
          },
          {
            title: 'Admin API Key',
            description: <><strong className="text-white">Admin API Key</strong> ni nusxalab oling. Format: <InlineCode>64hex:64hex</InlineCode></>,
          },
        ]}
      />

      <DocsH2>JetBlog da ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish</strong> → <strong className="text-white">Ghost</strong> tanlang</>,
          },
          {
            description: <><strong className="text-white">Ghost URL</strong>: <InlineCode>https://yoursite.com</InlineCode></>,
          },
          {
            description: <><strong className="text-white">Admin API Key</strong>: Yuqorida nusxalagan kalit (id:secret formatida)</>,
          },
          {
            description: <><strong className="text-white">Test connection</strong> → Muvaffaqiyatli ulandi!</>,
          },
        ]}
      />

      <DocsH2>Ulanishni tekshirish (curl)</DocsH2>
      <DocsPara>Admin API Key formatini tekshirish:</DocsPara>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Admin API Key formati: [id]:[secret]
# Misol: 64a7d123abc...:def456789...

curl -H "Authorization: Ghost [JWT_TOKEN]" \\
  https://yoursite.com/ghost/api/admin/posts/ \\
  -X GET`}
        className="mb-4"
      />
      <Callout variant="info" className="mb-8">
        JWT token yaratish uchun Ghost Admin API ning rasmiy kutubxonasidan foydalaning. JetBlog buni avtomatik bajaradi.
      </Callout>

      <DocsH2>Admin API Key formati</DocsH2>
      <DocsPara>Ghost Admin API Key ikkita qismdan iborat, ikki nuqta (<InlineCode>:</InlineCode>) bilan ajratilgan:</DocsPara>
      <CodeBlock
        language="text"
        code={`# Admin API Key formati:
# {64-belgilik-id}:{64-belgilik-secret}

Misol:
64a7c05e3f2b1d890abc1234:def567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12`}
        className="mb-8"
      />

      <Callout variant="warning" title="Muhim">
        Content API Key emas, <strong>Admin API Key</strong> kerak. Content API faqat o&apos;qish uchun, nashr qilish imkoni yo&apos;q.
      </Callout>
    </div>
  );
}
