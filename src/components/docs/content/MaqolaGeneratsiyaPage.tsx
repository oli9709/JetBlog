import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

export function MaqolaGeneratsiyaPage() {
  return (
    <div>
      <DocsPageHeader
        badge="AI va kontent"
        title="Maqola generatsiya"
        description="Claude AI yordamida SEO optimallashtirilgan maqolalarni avtomatik yarating."
      />

      <DocsH2>Qanday ishlaydi?</DocsH2>
      <DocsPara>
        JetBlog kalit so&apos;z, brand voice sozlamalari, va SEO talablarini tahlil qilib, Claude AI ga to&apos;liq prompt yuboradi.
        Natijada maqola, sarlavha, meta tavsif va muqova rasm (DALL-E 3) avtomatik yaratiladi.
      </DocsPara>

      <DocsH2>Maqola yaratish bosqichlari</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Kalit so\'z tanlash',
            description: <>Dashboard → <strong className="text-white">Content</strong> → generatsiya qilmoqchi bo&apos;lgan kalit so&apos;zni tanlang</>,
          },
          {
            title: 'Generate bosish',
            description: <><strong className="text-white">Generate Article</strong> tugmasini bosing — 1 kredit sarflanadi</>,
          },
          {
            title: 'AI ishlamoqda',
            description: 'Claude maqola yozadi (30-60 soniya). DALL-E 3 muqova rasm yaratadi.',
          },
          {
            title: 'Tahrirlash',
            description: 'TipTap editor da maqolani ko\'rib chiqing, kerak bo\'lsa tahrirlang',
          },
          {
            title: 'Nashr',
            description: <><strong className="text-white">Publish</strong> tugmasini bosing — maqola saytingizga yuboriladi</>,
          },
        ]}
      />

      <DocsH2>Maqola tuzilishi</DocsH2>
      <DocsPara>JetBlog har bir maqolada quyidagilarni avtomatik yaratadi:</DocsPara>
      <ul className="space-y-2 mb-8">
        {[
          'SEO sarlavha (kalit so\'z bilan)',
          'Meta tavsif (155 belgi)',
          'Kirish (introduction) — diqqatni jalb qiluvchi',
          'Asosiy kontent — H2/H3 sarlavhalar bilan tuzilgan',
          'FAQ bo\'limi — long-tail kalit so\'zlar uchun',
          'Xulosa va CTA',
          'Muqova rasm (DALL-E 3)',
        ].map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-[#FB3640] mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <DocsH2>Avtomatik jadval (Autopilot)</DocsH2>
      <DocsPara>
        Connections sahifasida sayt sozlamalarida nashr kunlari va vaqtini belgilang.
        Autopilot yoqilganda JetBlog belgilangan vaqtda avtomatik:
      </DocsPara>
      <ol className="space-y-2 mb-8">
        {[
          'Navbatdagi tasdiqlangan kalit so\'zni oladi',
          'Claude AI bilan maqola yozadi',
          'DALL-E 3 muqova rasm yaratadi',
          'Saytingizga nashr qiladi',
          'Telegram kanalingizga xabar yuboradi',
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="info" title="Tip">
        Brand voice ni to&apos;ldirsangiz, maqolalar saytingiz ohangida yoziladi. <InlineCode>Brand voice</InlineCode> sahifasiga qarang.
      </Callout>
    </div>
  );
}
