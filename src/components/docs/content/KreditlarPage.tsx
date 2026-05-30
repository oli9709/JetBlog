import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';

const PLANS = [
  { name: 'Free', price: '$0', sites: '1', keywords: '10', articles: '2', credits: '2' },
  { name: 'Starter', price: '$19/oy', sites: '3', keywords: '100', articles: '20', credits: '20' },
  { name: 'Pro', price: '$49/oy', sites: '10', keywords: '500', articles: '80', credits: '80' },
  { name: 'Agency', price: '$99/oy', sites: '∞', keywords: '∞', articles: '200', credits: '200' },
];

export function KreditlarPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Boshlash"
        title="Kredit tizimi"
        description="JetBlog kredit asosida ishlaydi. Har bir maqola generatsiyasi 1 kredit sarflaydi."
      />

      <DocsH2>Kredit nima?</DocsH2>
      <DocsPara>
        Kredit — maqola generatsiyasi uchun ishlatiladigan hisob birligi. Har bir AI maqola yaratish 1 ta kredit sarflaydi.
        Kreditlar har oyda yangilanadi, orqaga o&apos;tkazilmaydi.
      </DocsPara>

      <DocsH2>Planlar va kreditlar</DocsH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Plan', 'Narx', 'Saytlar', "Kalit so'zlar/oy", 'Maqolalar/oy'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANS.map((plan, i) => (
              <tr key={plan.name} className={i % 2 === 0 ? 'bg-zinc-900/20' : ''}>
                <td className="py-3 px-4 font-semibold text-white">{plan.name}</td>
                <td className="py-3 px-4 text-zinc-300">{plan.price}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.sites}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.keywords}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.articles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocsH2>Kredit tugaganda nima bo&apos;ladi?</DocsH2>
      <DocsPara>
        Kredit tugaganda maqola generatsiya to&apos;xtatiladi. Siz qo&apos;shimcha kredit sotib olishingiz yoki planningizni upgrade qilishingiz mumkin.
      </DocsPara>
      <ol className="space-y-2 mb-6">
        {[
          "Dashboard → Settings → Billing sahifasiga o'ting",
          "'Add Credits' tugmasini bosing — miqdorni tanlang",
          "Invoice yaratiladi → Admin tasdiqlaydi → Kreditlar qo'shiladi",
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="warning" title="Eslatma">
        Kreditlar oylik yangilanadi va qoldig&apos;i keyingi oyga o&apos;tkazilmaydi. Ularni o&apos;z vaqtida ishlatishni unutmang.
      </Callout>
    </div>
  );
}
