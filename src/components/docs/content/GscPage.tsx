import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';

export function GscPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="Integratsiyalar"
        title="Google Search Console"
        description="GSC integratsiyasi orqali saytingizning real qidiruv ma'lumotlarini ko'ring va kalit so'zlarni import qiling."
      />

      <DocsH2>Ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Brand Voice</strong> yoki <strong className="text-white">Keywords</strong> → <strong className="text-white">Connect GSC</strong> tugmasini bosing</>,
          },
          {
            description: 'Google hisobingizga kiring va JetBlog ga ruxsat bering',
          },
          {
            description: 'GSC da ro\'yxatdan o\'tgan saytingizni tanlang',
          },
          {
            description: 'JetBlog so\'nggi 90 kunlik qidiruv ma\'lumotlarini oladi',
          },
        ]}
      />

      <DocsH2>Nima uchun kerak?</DocsH2>
      <DocsPara>GSC integratsiyasi quyidagi imkoniyatlarni beradi:</DocsPara>
      <ul className="space-y-2 mb-8">
        {[
          'Saytingizga traffic keltirayotgan kalit so\'zlarni ko\'rish',
          'Qaysi sahifalar yaxshi reytingda ekanini bilish',
          'Click-through rate (CTR) tahlili',
          'Maqola generatsiya uchun real ma\'lumotlarga asoslangan kalit so\'zlar',
        ].map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-[#FB3640] mt-0.5 shrink-0">→</span>
            {item}
          </li>
        ))}
      </ul>

      <Callout variant="warning" title="Talab">
        Google Search Console da saytingiz tekshirilgan (verified) bo&apos;lishi kerak.
        Agar yo&apos;q bo&apos;lsa, <strong>search.google.com/search-console</strong> da saytingizni qo&apos;shing.
      </Callout>
    </div>
  );
}
