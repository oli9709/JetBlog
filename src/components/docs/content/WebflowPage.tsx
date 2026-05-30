import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

export function WebflowPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Platformalar"
        title="Webflow"
        description="Webflow CMS Collection API orqali maqolalarni nashr qiling. Webflow Starter plan ($14/oy) talab qilinadi."
      />

      <Callout variant="warning" title="Plan talabi" className="mb-8">
        Webflow <strong>Free plan</strong> da CMS API mavjud emas. CMS API faqat <strong>Starter ($14/oy)</strong> va undan yuqori planlarda ishlaydi.
      </Callout>

      <DocsH2>API Token olish</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Webflow Dashboard ga kiring',
            description: <><InlineCode>webflow.com</InlineCode> → loyihangizni oching</>,
          },
          {
            title: 'Project Settings',
            description: <>Yuqori o&apos;ngdagi &quot;...&quot; menu → <strong className="text-white">Project Settings</strong></>,
          },
          {
            title: 'Integrations bo\'limiga o\'ting',
            description: <><strong className="text-white">Integrations → API Access</strong> bo&apos;limini toping</>,
          },
          {
            title: 'Token yarating',
            description: <><strong className="text-white">Generate API Token</strong> tugmasini bosing → nusxalab oling</>,
          },
        ]}
      />

      <DocsH2>Collection ID topish</DocsH2>
      <DocsPara>Collection ID — maqolalar saqlanadigan CMS kolleksiyangizning identifikatori.</DocsPara>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Webflow Designer → <strong className="text-white">CMS</strong> bo&apos;limiga o&apos;ting</>,
          },
          {
            description: 'Maqolalar uchun mo\'ljallangan kolleksiyangizni oching (masalan: "Blog Posts")',
          },
          {
            description: <>Brauzer URL siga qarang: <InlineCode>webflow.com/dashboard/sites/[site-id]/cms/collections/<strong>[collection-id]</strong></InlineCode></>,
          },
          {
            description: 'URL dagi so\'nggi qism — bu sizning Collection ID ingiz',
          },
        ]}
      />

      <DocsH2>API orqali tekshirish</DocsH2>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Kolleksiyani tekshirish
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://api.webflow.com/collections/YOUR_COLLECTION_ID \\
  -X GET`}
        className="mb-8"
      />

      <DocsH2>JetBlog da ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish</strong> → <strong className="text-white">Webflow</strong> tanlang</>,
          },
          {
            description: <><strong className="text-white">Site URL</strong>: <InlineCode>https://yoursite.webflow.io</InlineCode> yoki custom domain</>,
          },
          {
            description: <><strong className="text-white">API Token</strong>: Yuqorida nusxalagan token</>,
          },
          {
            description: <><strong className="text-white">Collection ID</strong>: Maqolalar kolleksiyasining ID si</>,
          },
          {
            description: <><strong className="text-white">Test connection</strong> → Muvaffaqiyatli!</>,
          },
        ]}
      />

      <Callout variant="info" title="Muhim maydonlar">
        JetBlog maqolani nashr qilganda <InlineCode>name</InlineCode> (sarlavha), <InlineCode>slug</InlineCode>, va <InlineCode>post-body</InlineCode> (kontent) maydonlarini to&apos;ldiradi.
        Kolleksiyangizda shu maydonlar bo&apos;lishi kerak.
      </Callout>
    </div>
  );
}
