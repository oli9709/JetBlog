import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';

const TONES = [
  { name: 'Professional', desc: 'Rasmiy, ishonchli, faktlarga asoslangan' },
  { name: 'Friendly', desc: 'Iliq, yaqin, o\'quvchi bilan gaplashuvchi' },
  { name: 'Educational', desc: 'O\'rgatuvchi, tushuntiruvchi, bosqichma-bosqich' },
  { name: 'Persuasive', desc: 'Ishontiruvchi, harakatga undovchi' },
  { name: 'Casual', desc: 'Erkin, oddiy, kundalik til' },
  { name: 'Authoritative', desc: 'Mutaxassis, qat\'iy, ishonch uyg\'otuvchi' },
];

export function BrandVoicePage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="AI va kontent"
        title="Brand voice"
        description="JetBlog maqolalarini saytingiz ohangiga moslashtiring. Brand voice sozlamalarisiz maqolalar neytral ohangda yoziladi."
      />

      <DocsH2>Nima uchun kerak?</DocsH2>
      <DocsPara>
        Brand voice — AI maqolalarga sizning saytingiz &apos;ovozi&apos; ni beradi.
        Bir xil kalit so&apos;z bo&apos;lsa ham, professional sayt va blog uchun maqola uslubi farq qilishi kerak.
      </DocsPara>

      <DocsH2>Sozlash</DocsH2>
      <ol className="space-y-2 mb-8">
        {[
          <>Dashboard → <strong className="text-white">Brand Voice</strong> sahifasiga o&apos;ting</>,
          'Saytingizni tanlang',
          <>Quyidagi maydonlarni to&apos;ldiring:</>,
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-4 mb-8 ml-8">
        {[
          { field: 'Ohang (Tone)', desc: 'Maqola uslubi — quyida variantlar' },
          { field: 'Auditoriya', desc: 'Kim uchun yozilmoqda (masalan: "texnologiyaga qiziquvchi yoshlar")' },
          { field: 'Voice description', desc: 'Qisqa tavsif (masalan: "Seo bo\'yicha tajribali mutaxassis kabi yozing")' },
          { field: 'Qoidalar', desc: 'Muayyan ko\'rsatmalar (masalan: "Emoji ishlatma", "Har doim H2 sarlavha qo\'y")' },
        ].map((item) => (
          <div key={item.field} className="flex gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
            <span className="font-semibold text-white shrink-0 w-32">{item.field}:</span>
            <span className="text-zinc-400">{item.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>Ohang variantlari</DocsH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {TONES.map((tone) => (
          <div key={tone.name} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <p className="text-sm font-semibold text-white mb-1">{tone.name}</p>
            <p className="text-xs text-zinc-500">{tone.desc}</p>
          </div>
        ))}
      </div>

      <Callout variant="info" title="Sayt skaneri">
        Brand Voice sahifasida &quot;Saytimni skanerlash&quot; tugmasi bor — JetBlog saytingizni tahlil qilib,
        ohang va auditoriyani avtomatik aniqlaydi.
      </Callout>
    </div>
  );
}
