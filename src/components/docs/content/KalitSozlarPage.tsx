import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

export function KalitSozlarPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="AI va kontent"
        title="Kalit so'zlar"
        description="JetBlog kalit so'zlar bo'yicha SEO ma'lumotlarini avtomatik oladi va maqola generatsiya uchun tayyorlaydi."
      />

      <DocsH2>Kalit so&apos;z qo&apos;shish</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Keywords</strong> → <strong className="text-white">Add Keyword</strong></>,
          },
          {
            description: <>Kalit so&apos;z kiriting (masalan: <InlineCode>wordpress seo 2026</InlineCode>)</>,
          },
          {
            description: 'Tilni tanlang: O\'zbek / Rus / English',
          },
          {
            description: 'Saytni tanlang (bir nechta sayt bo\'lsa)',
          },
          {
            description: <>Save → JetBlog search volume, difficulty, va raqobat ma&apos;lumotlarini avtomatik oladi</>,
          },
        ]}
      />

      <DocsH2>Kalit so&apos;z holatlari</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {[
          { status: 'pending', color: 'text-amber-400 border-amber-500/25 bg-amber-500/8', desc: 'Yangi qo\'shilgan, hali tasdiqlanmagan' },
          { status: 'approved', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8', desc: 'Tasdiqlangan, maqola generatsiya navbatida' },
          { status: 'rejected', color: 'text-red-400 border-red-500/25 bg-red-500/8', desc: 'Rad etilgan, ishlatilmaydi' },
          { status: 'completed', color: 'text-blue-400 border-blue-500/25 bg-blue-500/8', desc: 'Maqola yozildi va nashr qilindi' },
        ].map((item) => (
          <div key={item.status} className={`flex items-center gap-4 p-3 rounded-xl border text-sm ${item.color}`}>
            <span className="font-mono font-bold capitalize w-24 shrink-0">{item.status}</span>
            <span className="opacity-80">{item.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>SEO ma&apos;lumotlari</DocsH2>
      <DocsPara>
        JetBlog har bir kalit so&apos;z uchun quyidagi ma&apos;lumotlarni oladi:
      </DocsPara>
      <ul className="space-y-2 mb-8">
        {[
          { label: 'Search Volume', desc: 'Oylik qidiruv soni' },
          { label: 'Difficulty', desc: 'Raqobat darajasi (0-100)' },
          { label: 'Language', desc: "Tanlangan til: uz / ru / en" },
        ].map((item) => (
          <li key={item.label} className="flex gap-3 text-sm">
            <span className="font-semibold text-white w-32 shrink-0">{item.label}:</span>
            <span className="text-zinc-400">{item.desc}</span>
          </li>
        ))}
      </ul>

      <Callout variant="info" title="Tip">
        Difficulty 0-30 bo&apos;lgan kalit so&apos;zlardan boshlang — yangi saytlar uchun eng samarali strategiya.
      </Callout>
    </div>
  );
}
