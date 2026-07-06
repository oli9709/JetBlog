import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  connectTitle: string;
  connectSteps: { description: React.ReactNode }[];
  whyTitle: string; whyIntro: string;
  benefits: string[];
  calloutTitle: string; calloutBody: string;
}> = {
  uz: {
    badge: 'Integratsiyalar',
    title: 'Google Search Console',
    description: "GSC integratsiyasi orqali saytingizning real qidiruv ma'lumotlarini ko'ring va kalit so'zlarni import qiling.",
    connectTitle: 'Ulash',
    connectSteps: [
      { description: <><strong className="text-white">Dashboard → Brand Voice</strong> yoki <strong className="text-white">Keywords → Connect GSC</strong> tugmasini bosing</> },
      { description: "Google hisobingizga kiring va JetBlog ga ruxsat bering" },
      { description: "GSC da ro'yxatdan o'tgan saytingizni tanlang" },
      { description: "JetBlog so'nggi 90 kunlik qidiruv ma'lumotlarini oladi" },
    ],
    whyTitle: 'Nima uchun kerak?',
    whyIntro: 'GSC integratsiyasi quyidagi imkoniyatlarni beradi:',
    benefits: [
      "Saytingizga traffic keltirayotgan kalit so'zlarni ko'rish",
      'Qaysi sahifalar yaxshi reytingda ekanini bilish',
      'Click-through rate (CTR) tahlili',
      "Maqola generatsiya uchun real ma'lumotlarga asoslangan kalit so'zlar",
    ],
    calloutTitle: 'Talab',
    calloutBody: 'Google Search Console da saytingiz tekshirilgan (verified) bo\'lishi kerak. Agar yo\'q bo\'lsa, search.google.com/search-console da saytingizni qo\'shing.',
  },
  ru: {
    badge: 'Интеграции',
    title: 'Google Search Console',
    description: 'Просматривайте реальные данные поиска вашего сайта и импортируйте ключевые слова через интеграцию GSC.',
    connectTitle: 'Подключение',
    connectSteps: [
      { description: <><strong className="text-white">Dashboard → Brand Voice</strong> или <strong className="text-white">Keywords → Connect GSC</strong></> },
      { description: 'Войдите в аккаунт Google и выдайте JetBlog разрешение' },
      { description: 'Выберите сайт, зарегистрированный в GSC' },
      { description: 'JetBlog получит поисковые данные за последние 90 дней' },
    ],
    whyTitle: 'Зачем это нужно?',
    whyIntro: 'Интеграция GSC открывает следующие возможности:',
    benefits: [
      'Просмотр ключевых слов, приводящих трафик на сайт',
      'Знание того, какие страницы занимают хорошие позиции',
      'Анализ click-through rate (CTR)',
      'Ключевые слова на основе реальных данных для генерации статей',
    ],
    calloutTitle: 'Требование',
    calloutBody: 'Ваш сайт должен быть подтверждён (verified) в Google Search Console. Если нет — добавьте сайт на search.google.com/search-console.',
  },
  en: {
    badge: 'Integrations',
    title: 'Google Search Console',
    description: "View your site's real search data and import keywords via GSC integration.",
    connectTitle: 'Connecting',
    connectSteps: [
      { description: <><strong className="text-white">Dashboard → Brand Voice</strong> or <strong className="text-white">Keywords → Connect GSC</strong></> },
      { description: 'Sign in to your Google account and grant JetBlog permission' },
      { description: 'Select your site registered in GSC' },
      { description: 'JetBlog will fetch the last 90 days of search data' },
    ],
    whyTitle: 'Why is it useful?',
    whyIntro: 'GSC integration provides the following capabilities:',
    benefits: [
      'See which keywords bring traffic to your site',
      'Know which pages rank well',
      'Click-through rate (CTR) analysis',
      'Real-data-driven keywords for article generation',
    ],
    calloutTitle: 'Requirement',
    calloutBody: 'Your site must be verified in Google Search Console. If not, add your site at search.google.com/search-console.',
  },
};

export async function GscPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.connectTitle}</DocsH2>
      <StepList className="mb-8" steps={c.connectSteps} />

      <DocsH2>{c.whyTitle}</DocsH2>
      <DocsPara>{c.whyIntro}</DocsPara>
      <ul className="space-y-2 mb-8">
        {c.benefits.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-[#FB3640] mt-0.5 shrink-0">→</span>
            {item}
          </li>
        ))}
      </ul>

      <Callout variant="warning" title={c.calloutTitle}>{c.calloutBody}</Callout>
    </div>
  );
}
