'use client';

import React from 'react';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';
import { InlineCode } from '../CodeBlock';

export function QuickStartPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="Boshlash"
        title="5 daqiqada sozlash"
        description="JetBlog ni o'rnatib, birinchi maqolangizni yaratishga endi bor-yo'g'i 5 daqiqa kerak."
      />

      <DocsH2>1-qadam: Ro&apos;yxatdan o&apos;ting</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: "jetblog.app ga o'ting",
            description: <><InlineCode>jetblog.app/auth/signup</InlineCode> sahifasiga o&apos;ting va email bilan ro&apos;yxatdan o&apos;ting.</>,
          },
          {
            title: 'Email tasdiqlang',
            description: 'Emailingizga tasdiqlash havolasi yuboriladi. Havolani bosing — siz dashboardga o\'tkazilasiz.',
          },
          {
            title: "Bepul plan bilan boshlang",
            description: 'Free plan — 2 ta maqola/oy, 1 ta sayt. Kerak bo\'lsa istalgan vaqt upgrade qilasiz.',
          },
        ]}
      />

      <DocsH2>2-qadam: Platformani ulang</DocsH2>
      <p className="text-sm text-zinc-400 mb-4">
        Dashboard → <strong className="text-white">Connections</strong> → <strong className="text-white">Sayt qo&apos;shish</strong> tugmasini bosing va platformangizni tanlang:
      </p>

      <PlatformTabs
        className="mb-8"
        tabs={[
          {
            id: 'wordpress',
            label: 'WordPress',
            content: (
              <StepList steps={[
                { description: <>WordPress admin paneliga kiring: <InlineCode>yoursite.com/wp-admin</InlineCode></> },
                { description: <><strong className="text-white">Users → Profile</strong> → <strong className="text-white">Application Passwords</strong> bo&apos;limiga o&apos;ting</> },
                { description: 'Nom kiriting (masalan: JetBlog) → "Add New Application Password" → Nusxalab oling' },
                { description: <>JetBlog da: Site URL, WP Username, va Application Password kiriting → <strong className="text-white">Test connection</strong></> },
              ]} />
            ),
          },
          {
            id: 'ghost',
            label: 'Ghost',
            content: (
              <StepList steps={[
                { description: <>Ghost Admin paneliga kiring: <InlineCode>yoursite.com/ghost</InlineCode></> },
                { description: <><strong className="text-white">Settings → Integrations → Add custom integration</strong></> },
                { description: 'Nom bering (JetBlog) → Admin API Key ni nusxalab oling' },
                { description: <>JetBlog da: Ghost URL va Admin API Key kiriting → <strong className="text-white">Test connection</strong></> },
              ]} />
            ),
          },
          {
            id: 'webflow',
            label: 'Webflow',
            content: (
              <StepList steps={[
                { description: <>Webflow Dashboard → <strong className="text-white">Project Settings → Integrations</strong></> },
                { description: 'API Access bo\'limida token yarating → Nusxalab oling' },
                { description: <>CMS → Collections → maqolalar kolleksiyasini oching → URL dagi ID ni oling</> },
                { description: <>JetBlog da: Site URL, API Token, Collection ID kiriting → <strong className="text-white">Test connection</strong></> },
              ]} />
            ),
          },
          {
            id: 'webhook',
            label: 'Webhook',
            content: (
              <StepList steps={[
                { description: 'Serveringizda webhook endpoint yarating (Node.js, PHP, yoki Python misollari Webhook sahifasida)' },
                { description: <><InlineCode>https://yourserver.com/webhook</InlineCode> endpoint URL ni kiriting</> },
                { description: 'Secret key kiriting yoki auto-generate tugmasini bosing' },
                { description: <><strong className="text-white">Test connection</strong> — JetBlog test so&apos;rov yuboradi</> },
              ]} />
            ),
          },
        ]}
      />

      <DocsH2>3-qadam: Kalit so&apos;z qo&apos;shing</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Keywords</strong> sahifasiga o&apos;ting</>,
          },
          {
            description: <><strong className="text-white">Add Keyword</strong> tugmasini bosing</>,
          },
          {
            description: <>Kalit so&apos;z kiriting (masalan: <InlineCode>wordpress seo 2026</InlineCode>) va tilni tanlang</>,
          },
          {
            description: 'JetBlog search volume, difficulty ma\'lumotlarini avtomatik oladi va kalit so\'z ro\'yxatga qo\'shiladi',
          },
        ]}
      />

      <DocsH2>4-qadam: Birinchi maqolani generatsiya qiling</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Content</strong> sahifasiga o&apos;ting</>,
          },
          {
            description: 'Maqola generatsiya qilmoqchi bo\'lgan kalit so\'zni tanlang',
          },
          {
            description: <><strong className="text-white">Generate Article</strong> tugmasini bosing — bu 30-60 soniya olishi mumkin</>,
          },
          {
            description: 'Claude AI maqola yozadi, DALL-E 3 muqova rasm yaratadi',
          },
          {
            description: 'TipTap editorida ko\'rib chiqing va tahrirlang',
          },
          {
            description: <><strong className="text-white">Publish</strong> tugmasini bosing — maqola saytingizda paydo bo&apos;ladi!</>,
          },
        ]}
      />

      <Callout variant="success" title="Tabriklaymiz!">
        Birinchi maqolangiz nashr qilindi. Endi Autopilot ni yoqing — JetBlog belgilangan jadvalda avtomatik maqola yozib nashr qiladi.
      </Callout>
    </div>
  );
}
