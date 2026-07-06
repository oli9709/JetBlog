import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  addTitle: string;
  addSteps: { description: React.ReactNode }[];
  statusTitle: string;
  statuses: { status: string; color: string; desc: string }[];
  seoTitle: string; seoIntro: string;
  seoItems: { label: string; desc: string }[];
  calloutBody: string;
}> = {
  uz: {
    badge: 'AI va kontent',
    title: "Kalit so'zlar",
    description: "JetBlog kalit so'zlar bo'yicha SEO ma'lumotlarini avtomatik oladi va maqola generatsiya uchun tayyorlaydi.",
    addTitle: "Kalit so'z qo'shish",
    addSteps: [
      { description: <><strong className="text-white">Dashboard → Keywords → Add Keyword</strong></> },
      { description: <><InlineCode>wordpress seo 2026</InlineCode> kabi kalit so&apos;z kiriting</> },
      { description: "Tilni tanlang: O'zbek / Rus / English" },
      { description: 'Saytni tanlang (bir nechta sayt bo\'lsa)' },
      { description: <>Saqlang → JetBlog search volume, difficulty va raqobat ma&apos;lumotlarini avtomatik oladi</> },
    ],
    statusTitle: "Kalit so'z holatlari",
    statuses: [
      { status: 'pending', color: 'text-amber-400 border-amber-500/25 bg-amber-500/8', desc: "Yangi qo'shilgan, hali tasdiqlanmagan" },
      { status: 'approved', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8', desc: 'Tasdiqlangan, maqola generatsiya navbatida' },
      { status: 'rejected', color: 'text-red-400 border-red-500/25 bg-red-500/8', desc: 'Rad etilgan, ishlatilmaydi' },
      { status: 'completed', color: 'text-blue-400 border-blue-500/25 bg-blue-500/8', desc: 'Maqola yozildi va nashr qilindi' },
    ],
    seoTitle: "SEO ma'lumotlari",
    seoIntro: "JetBlog har bir kalit so'z uchun quyidagi ma'lumotlarni oladi:",
    seoItems: [
      { label: 'Search Volume', desc: 'Oylik qidiruv soni' },
      { label: 'Difficulty', desc: 'Raqobat darajasi (0–100)' },
      { label: 'Language', desc: 'Tanlangan til: uz / ru / en' },
    ],
    calloutBody: "Difficulty 0–30 bo'lgan kalit so'zlardan boshlang — yangi saytlar uchun eng samarali strategiya.",
  },
  ru: {
    badge: 'AI и контент',
    title: 'Ключевые слова',
    description: 'JetBlog автоматически получает SEO-данные по ключевым словам и готовит их для генерации статей.',
    addTitle: 'Добавление ключевого слова',
    addSteps: [
      { description: <><strong className="text-white">Dashboard → Keywords → Add Keyword</strong></> },
      { description: <>Введите ключевое слово, например <InlineCode>wordpress seo 2026</InlineCode></> },
      { description: 'Выберите язык: Uzbek / Russian / English' },
      { description: 'Выберите сайт (если у вас несколько)' },
      { description: <>Сохраните → JetBlog автоматически получит данные о search volume, difficulty и конкуренции</> },
    ],
    statusTitle: 'Статусы ключевых слов',
    statuses: [
      { status: 'pending', color: 'text-amber-400 border-amber-500/25 bg-amber-500/8', desc: 'Только что добавлено, ещё не подтверждено' },
      { status: 'approved', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8', desc: 'Подтверждено, стоит в очереди на генерацию' },
      { status: 'rejected', color: 'text-red-400 border-red-500/25 bg-red-500/8', desc: 'Отклонено, не используется' },
      { status: 'completed', color: 'text-blue-400 border-blue-500/25 bg-blue-500/8', desc: 'Статья написана и опубликована' },
    ],
    seoTitle: 'SEO-данные',
    seoIntro: 'JetBlog получает следующие данные для каждого ключевого слова:',
    seoItems: [
      { label: 'Search Volume', desc: 'Ежемесячное число запросов' },
      { label: 'Difficulty', desc: 'Уровень конкуренции (0–100)' },
      { label: 'Language', desc: 'Выбранный язык: uz / ru / en' },
    ],
    calloutBody: 'Начинайте с ключевых слов с Difficulty 0–30 — это наиболее эффективная стратегия для новых сайтов.',
  },
  en: {
    badge: 'AI & Content',
    title: 'Keywords',
    description: 'JetBlog automatically fetches SEO data for keywords and prepares them for article generation.',
    addTitle: 'Adding a keyword',
    addSteps: [
      { description: <><strong className="text-white">Dashboard → Keywords → Add Keyword</strong></> },
      { description: <>Enter a keyword, e.g. <InlineCode>wordpress seo 2026</InlineCode></> },
      { description: 'Select language: Uzbek / Russian / English' },
      { description: 'Select the site (if you have more than one)' },
      { description: <>Save → JetBlog automatically fetches search volume, difficulty, and competition data</> },
    ],
    statusTitle: 'Keyword statuses',
    statuses: [
      { status: 'pending', color: 'text-amber-400 border-amber-500/25 bg-amber-500/8', desc: 'Newly added, not yet approved' },
      { status: 'approved', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8', desc: 'Approved, queued for article generation' },
      { status: 'rejected', color: 'text-red-400 border-red-500/25 bg-red-500/8', desc: 'Rejected, not used' },
      { status: 'completed', color: 'text-blue-400 border-blue-500/25 bg-blue-500/8', desc: 'Article written and published' },
    ],
    seoTitle: 'SEO data',
    seoIntro: 'JetBlog fetches the following data for each keyword:',
    seoItems: [
      { label: 'Search Volume', desc: 'Monthly search count' },
      { label: 'Difficulty', desc: 'Competition level (0–100)' },
      { label: 'Language', desc: 'Selected language: uz / ru / en' },
    ],
    calloutBody: 'Start with keywords with Difficulty 0–30 — the most effective strategy for new sites.',
  },
};

export async function KalitSozlarPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.addTitle}</DocsH2>
      <StepList className="mb-8" steps={c.addSteps} />

      <DocsH2>{c.statusTitle}</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {c.statuses.map((item) => (
          <div key={item.status} className={`flex items-center gap-4 p-3 rounded-xl border text-sm ${item.color}`}>
            <span className="font-mono font-bold capitalize w-24 shrink-0">{item.status}</span>
            <span className="opacity-80">{item.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>{c.seoTitle}</DocsH2>
      <DocsPara>{c.seoIntro}</DocsPara>
      <ul className="space-y-2 mb-8">
        {c.seoItems.map((item) => (
          <li key={item.label} className="flex gap-3 text-sm">
            <span className="font-semibold text-white w-32 shrink-0">{item.label}:</span>
            <span className="text-zinc-400">{item.desc}</span>
          </li>
        ))}
      </ul>

      <Callout variant="info" title="Tip">{c.calloutBody}</Callout>
    </div>
  );
}
