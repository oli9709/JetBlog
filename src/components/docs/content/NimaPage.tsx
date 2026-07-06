import React from 'react';
import { Zap, Globe, Brain, BarChart2, Bell } from 'lucide-react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';
import { getLocale } from 'next-intl/server';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string;
  title: string;
  description: string;
  featuresTitle: string;
  features: { title: string; desc: string }[];
  howTitle: string;
  howIntro: string;
  steps: string[];
  calloutTitle: string;
  calloutBody: string;
}> = {
  uz: {
    badge: 'Hujjatlar',
    title: 'JetBlog nima?',
    description: 'JetBlog — WordPress, Ghost va boshqa platformalar uchun AI yordamida SEO maqolalarini avtomatik yaratuvchi va nashr qiluvchi SaaS xizmati.',
    featuresTitle: 'Asosiy imkoniyatlar',
    features: [
      { title: 'Claude AI maqola yozadi', desc: 'Har bir maqola brand voice va SEO talablariga moslashtirilgan holda yoziladi.' },
      { title: "Ko'p platforma", desc: 'WordPress, Ghost, Webflow yoki istalgan platformaga webhook orqali nashr qilish.' },
      { title: "Kalit so'z tahlili", desc: "Search volume, difficulty va raqobat ma'lumotlari avtomatik yuklanadi." },
      { title: 'Autopilot', desc: 'Belgilangan vaqtda avtomatik nashr — siz hech narsa qilmasangiz ham ishlaydi.' },
      { title: 'Telegram xabarnoma', desc: 'Har bir nashr qilingan maqola haqida Telegram kanalingizga xabar keladi.' },
    ],
    howTitle: 'Qanday ishlaydi?',
    howIntro: 'JetBlog uchta asosiy bosqichda ishlaydi:',
    steps: [
      "Saytingizni uling — WordPress, Ghost, Webflow yoki Webhook orqali.",
      "Kalit so'zlarni qo'shing — JetBlog SEO ma'lumotlarini avtomatik oladi.",
      "Autopilotni yoqing — belgilangan jadvalda AI maqola yozib, saytingizga nashr qiladi.",
    ],
    calloutTitle: 'Boshlash uchun',
    calloutBody: "5 daqiqada sozlash bo'limiga o'ting — birinchi maqolangizni juda tez yaratishingiz mumkin.",
  },
  ru: {
    badge: 'Документация',
    title: 'Что такое JetBlog?',
    description: 'JetBlog — SaaS-сервис для автоматического создания и публикации SEO-статей с помощью AI для WordPress, Ghost и других платформ.',
    featuresTitle: 'Ключевые возможности',
    features: [
      { title: 'Claude AI пишет статьи', desc: 'Каждая статья пишется с учётом brand voice и требований SEO.' },
      { title: 'Мультиплатформенность', desc: 'Публикация на WordPress, Ghost, Webflow или любую платформу через webhook.' },
      { title: 'Анализ ключевых слов', desc: 'Объём поиска, сложность и данные о конкуренции загружаются автоматически.' },
      { title: 'Автопилот', desc: 'Автоматическая публикация по расписанию — работает даже без вашего участия.' },
      { title: 'Уведомления в Telegram', desc: 'После публикации каждой статьи в ваш Telegram-канал приходит сообщение.' },
    ],
    howTitle: 'Как это работает?',
    howIntro: 'JetBlog работает в три основных шага:',
    steps: [
      'Подключите сайт — через WordPress, Ghost, Webflow или Webhook.',
      'Добавьте ключевые слова — JetBlog автоматически получает SEO-данные.',
      'Включите автопилот — по расписанию AI пишет статью и публикует на ваш сайт.',
    ],
    calloutTitle: 'Начало работы',
    calloutBody: 'Перейдите в раздел «Настройка за 5 минут» — и создайте свою первую статью очень быстро.',
  },
  en: {
    badge: 'Documentation',
    title: 'What is JetBlog?',
    description: 'JetBlog is a SaaS service that automatically creates and publishes SEO articles using AI for WordPress, Ghost, and other platforms.',
    featuresTitle: 'Key features',
    features: [
      { title: 'Claude AI writes articles', desc: 'Every article is written tailored to your brand voice and SEO requirements.' },
      { title: 'Multi-platform', desc: 'Publish to WordPress, Ghost, Webflow, or any platform via webhook.' },
      { title: 'Keyword analysis', desc: 'Search volume, difficulty, and competition data are loaded automatically.' },
      { title: 'Autopilot', desc: 'Automatic publishing on schedule — works even without your involvement.' },
      { title: 'Telegram notifications', desc: 'A message is sent to your Telegram channel after each article is published.' },
    ],
    howTitle: 'How does it work?',
    howIntro: 'JetBlog works in three main steps:',
    steps: [
      'Connect your site — via WordPress, Ghost, Webflow, or Webhook.',
      'Add keywords — JetBlog automatically fetches SEO data.',
      'Enable autopilot — on schedule, AI writes an article and publishes it to your site.',
    ],
    calloutTitle: 'Getting started',
    calloutBody: 'Go to the "Setup in 5 minutes" section — and create your first article very quickly.',
  },
};

const ICONS = [
  <Brain className="w-5 h-5" key="brain" />,
  <Globe className="w-5 h-5" key="globe" />,
  <BarChart2 className="w-5 h-5" key="bar" />,
  <Zap className="w-5 h-5" key="zap" />,
  <Bell className="w-5 h-5" key="bell" />,
];

export async function NimaPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.featuresTitle}</DocsH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {c.features.map((f, idx) => (
          <div key={f.title} className="flex gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="w-9 h-9 rounded-lg bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FB3640] flex items-center justify-center shrink-0">
              {ICONS[idx]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
              <p className="text-xs text-zinc-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <DocsH2>{c.howTitle}</DocsH2>
      <DocsPara>{c.howIntro}</DocsPara>
      <ol className="space-y-3 mb-6">
        {c.steps.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="info" title={c.calloutTitle}>
        {c.calloutBody}
      </Callout>
    </div>
  );
}
