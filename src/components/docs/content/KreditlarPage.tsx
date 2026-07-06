'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  creditTitle: string; creditDesc: string;
  plansTitle: string;
  tableHeaders: string[];
  pricePerMonth: string;
  outTitle: string; outDesc: string;
  outSteps: string[];
  calloutTitle: string; calloutBody: string;
}> = {
  uz: {
    badge: 'Boshlash',
    title: 'Kredit tizimi',
    description: "JetBlog kredit asosida ishlaydi. Har bir maqola generatsiyasi 1 kredit sarflaydi.",
    creditTitle: 'Kredit nima?',
    creditDesc: "Kredit — maqola generatsiyasi uchun ishlatiladigan hisob birligi. Har bir AI maqola yaratish 1 ta kredit sarflaydi. Kreditlar har oyda yangilanadi, orqaga o'tkazilmaydi.",
    plansTitle: 'Planlar va kreditlar',
    tableHeaders: ['Plan', 'Narx', 'Saytlar', "Kalit so'zlar/oy", 'Maqolalar/oy'],
    pricePerMonth: '/oy',
    outTitle: "Kredit tugaganda nima bo'ladi?",
    outDesc: "Kredit tugaganda maqola generatsiya to'xtatiladi. Siz qo'shimcha kredit sotib olishingiz yoki planningizni upgrade qilishingiz mumkin.",
    outSteps: [
      "Dashboard → Settings → Billing sahifasiga o'ting",
      "'Add Credits' tugmasini bosing — miqdorni tanlang",
      "Invoice yaratiladi → Admin tasdiqlaydi → Kreditlar qo'shiladi",
    ],
    calloutTitle: 'Eslatma',
    calloutBody: "Kreditlar oylik yangilanadi va qoldig'i keyingi oyga o'tkazilmaydi. Ularni o'z vaqtida ishlatishni unutmang.",
  },
  ru: {
    badge: 'Начало',
    title: 'Система кредитов',
    description: 'JetBlog работает на основе кредитов. Каждая генерация статьи расходует 1 кредит.',
    creditTitle: 'Что такое кредит?',
    creditDesc: 'Кредит — расчётная единица для генерации статей. Создание одной AI-статьи стоит 1 кредит. Кредиты обновляются каждый месяц и не переносятся.',
    plansTitle: 'Планы и кредиты',
    tableHeaders: ['План', 'Цена', 'Сайты', 'Ключевые слова/мес.', 'Статей/мес.'],
    pricePerMonth: '/мес.',
    outTitle: 'Что происходит при исчерпании кредитов?',
    outDesc: 'При исчерпании кредитов генерация статей останавливается. Вы можете докупить кредиты или обновить план.',
    outSteps: [
      'Перейдите в Dashboard → Settings → Billing',
      "Нажмите 'Add Credits' и выберите количество",
      'Создаётся инвойс → Администратор подтверждает → Кредиты добавляются',
    ],
    calloutTitle: 'Важно',
    calloutBody: 'Кредиты обновляются ежемесячно и остаток не переносится на следующий ��есяц. Используйте их своевременно.',
  },
  en: {
    badge: 'Getting Started',
    title: 'Credit system',
    description: 'JetBlog works on a credit basis. Each article generation uses 1 credit.',
    creditTitle: 'What is a credit?',
    creditDesc: 'A credit is the unit used for article generation. Creating one AI article costs 1 credit. Credits refresh monthly and do not roll over.',
    plansTitle: 'Plans and credits',
    tableHeaders: ['Plan', 'Price', 'Sites', 'Keywords/month', 'Articles/month'],
    pricePerMonth: '/mo',
    outTitle: 'What happens when credits run out?',
    outDesc: 'When credits run out, article generation stops. You can buy additional credits or upgrade your plan.',
    outSteps: [
      'Go to Dashboard → Settings → Billing',
      "Click 'Add Credits' and select the amount",
      'An invoice is created → Admin approves → Credits are added',
    ],
    calloutTitle: 'Note',
    calloutBody: 'Credits refresh monthly and unused credits do not roll over. Make sure to use them before the month ends.',
  },
};

const PLANS = [
  { name: 'Free', price: '$0', sites: '1', keywords: '10', articles: '2' },
  { name: 'Starter', price: '$9', sites: '1', keywords: '100', articles: '30' },
  { name: 'Pro', price: '$29', sites: '3', keywords: '500', articles: '80' },
  { name: 'Agency', price: '$79', sites: '10', keywords: '∞', articles: '250' },
];

export function KreditlarPage({ locale: _locale }: Props) {
  const locale = useLocale() as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.creditTitle}</DocsH2>
      <DocsPara>{c.creditDesc}</DocsPara>

      <DocsH2>{c.plansTitle}</DocsH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              {c.tableHeaders.map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANS.map((plan, i) => (
              <tr key={plan.name} className={i % 2 === 0 ? 'bg-zinc-900/20' : ''}>
                <td className="py-3 px-4 font-semibold text-white">{plan.name}</td>
                <td className="py-3 px-4 text-zinc-300">{plan.price}{plan.name !== 'Free' ? c.pricePerMonth : ''}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.sites}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.keywords}</td>
                <td className="py-3 px-4 text-zinc-400">{plan.articles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocsH2>{c.outTitle}</DocsH2>
      <DocsPara>{c.outDesc}</DocsPara>
      <ol className="space-y-2 mb-6">
        {c.outSteps.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="warning" title={c.calloutTitle}>
        {c.calloutBody}
      </Callout>
    </div>
  );
}
