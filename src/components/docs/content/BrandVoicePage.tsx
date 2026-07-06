import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  whyTitle: string; whyDesc: string;
  setupTitle: string;
  setupSteps: React.ReactNode[];
  fields: { field: string; desc: string }[];
  tonesTitle: string;
  tones: { name: string; desc: string }[];
  calloutTitle: string; calloutBody: string;
}> = {
  uz: {
    badge: 'AI va kontent',
    title: 'Brand voice',
    description: "JetBlog maqolalarini saytingiz ohangiga moslashtiring. Brand voice sozlamalarsiz maqolalar neytral ohangda yoziladi.",
    whyTitle: 'Nima uchun kerak?',
    whyDesc: "Brand voice — AI maqolalarga sizning saytingiz 'ovozi'ni beradi. Bir xil kalit so'z bo'lsa ham, professional sayt va blog uchun maqola uslubi farq qilishi kerak.",
    setupTitle: 'Sozlash',
    setupSteps: [
      <><strong className="text-white">Dashboard → Brand Voice</strong> sahifasiga o&apos;ting</>,
      'Saytingizni tanlang',
      'Quyidagi maydonlarni to\'ldiring:',
    ],
    fields: [
      { field: 'Ohang (Tone)', desc: 'Maqola uslubi — quyida variantlar' },
      { field: 'Auditoriya', desc: 'Kim uchun yozilmoqda (masalan: "texnologiyaga qiziquvchi yoshlar")' },
      { field: 'Voice description', desc: 'Qisqa tavsif (masalan: "SEO bo\'yicha tajribali mutaxassis kabi yozing")' },
      { field: 'Qoidalar', desc: 'Muayyan ko\'rsatmalar (masalan: "Emoji ishlatma", "Har doim H2 sarlavha qo\'y")' },
    ],
    tonesTitle: 'Ohang variantlari',
    tones: [
      { name: 'Professional', desc: 'Rasmiy, ishonchli, faktlarga asoslangan' },
      { name: 'Friendly', desc: "Iliq, yaqin, o'quvchi bilan gaplashuvchi" },
      { name: 'Educational', desc: "O'rgatuvchi, tushuntiruvchi, bosqichma-bosqich" },
      { name: 'Persuasive', desc: 'Ishontiruvchi, harakatga undovchi' },
      { name: 'Casual', desc: 'Erkin, oddiy, kundalik til' },
      { name: 'Authoritative', desc: "Mutaxassis, qat'iy, ishonch uyg'otuvchi" },
    ],
    calloutTitle: 'Sayt skaneri',
    calloutBody: 'Brand Voice sahifasida "Saytimni skanerlash" tugmasi bor — JetBlog saytingizni tahlil qilib, ohang va auditoriyani avtomatik aniqlaydi.',
  },
  ru: {
    badge: 'AI и контент',
    title: 'Brand voice',
    description: 'Подстройте статьи JetBlog под тон вашего сайта. Без настройки brand voice статьи пишутся в нейтральном тоне.',
    whyTitle: 'Зачем это нужно?',
    whyDesc: "Brand voice — это «голос» вашего сайта для AI-статей. Даже при одинаковом ключевом слове стиль статьи для профессионального сайта и блога должен быть разным.",
    setupTitle: 'Настройка',
    setupSteps: [
      <><strong className="text-white">Dashboard → Brand Voice</strong></>,
      'Выберите сайт',
      'Заполните следующие поля:',
    ],
    fields: [
      { field: 'Тон (Tone)', desc: 'Стиль статьи — варианты ниже' },
      { field: 'Аудитория', desc: 'Для кого пишется (например: «молодёжь, увлечённая технологиями»)' },
      { field: 'Voice description', desc: 'Краткое описание (например: «Пиши как опытный SEO-специалист»)' },
      { field: 'Правила', desc: 'Конкретные инструкции (например: «Не используй эмодзи», «Всегда ставь H2-заголовок»)' },
    ],
    tonesTitle: 'Варианты тона',
    tones: [
      { name: 'Professional', desc: 'Официальный, надёжный, основанный на фактах' },
      { name: 'Friendly', desc: 'Тёплый, близкий, разговорный' },
      { name: 'Educational', desc: 'Обучающий, объясняющий, пошаговый' },
      { name: 'Persuasive', desc: 'Убедительный, призывающий к действию' },
      { name: 'Casual', desc: 'Свободный, простой, повседневный' },
      { name: 'Authoritative', desc: 'Экспертный, уверенный, внушающий доверие' },
    ],
    calloutTitle: 'Сканер сайта',
    calloutBody: 'На странице Brand Voice есть кнопка «Сканировать мой сайт» — JetBlog проанализирует сайт и автоматически определит тон и аудиторию.',
  },
  en: {
    badge: 'AI & Content',
    title: 'Brand voice',
    description: "Adapt JetBlog articles to your site's tone. Without brand voice settings, articles are written in a neutral tone.",
    whyTitle: 'Why is it needed?',
    whyDesc: "Brand voice gives AI articles the 'voice' of your site. Even with the same keyword, the style of an article for a professional site and a blog should differ.",
    setupTitle: 'Setup',
    setupSteps: [
      <><strong className="text-white">Dashboard → Brand Voice</strong></>,
      'Select your site',
      'Fill in the following fields:',
    ],
    fields: [
      { field: 'Tone', desc: 'Article style — options listed below' },
      { field: 'Audience', desc: 'Who it\'s written for (e.g. "tech-savvy young people")' },
      { field: 'Voice description', desc: 'Short description (e.g. "Write like an experienced SEO expert")' },
      { field: 'Rules', desc: 'Specific instructions (e.g. "No emojis", "Always add H2 headings")' },
    ],
    tonesTitle: 'Tone options',
    tones: [
      { name: 'Professional', desc: 'Formal, trustworthy, fact-based' },
      { name: 'Friendly', desc: 'Warm, approachable, conversational' },
      { name: 'Educational', desc: 'Teaching, explanatory, step-by-step' },
      { name: 'Persuasive', desc: 'Convincing, action-driving' },
      { name: 'Casual', desc: 'Relaxed, simple, everyday language' },
      { name: 'Authoritative', desc: 'Expert, assertive, confidence-inspiring' },
    ],
    calloutTitle: 'Site scanner',
    calloutBody: 'The Brand Voice page has a "Scan my site" button — JetBlog analyses your site and automatically detects tone and audience.',
  },
};

export async function BrandVoicePage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.whyTitle}</DocsH2>
      <DocsPara>{c.whyDesc}</DocsPara>

      <DocsH2>{c.setupTitle}</DocsH2>
      <ol className="space-y-2 mb-8">
        {c.setupSteps.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-4 mb-8 ml-8">
        {c.fields.map((item) => (
          <div key={item.field} className="flex gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
            <span className="font-semibold text-white shrink-0 w-36">{item.field}:</span>
            <span className="text-zinc-400">{item.desc}</span>
          </div>
        ))}
      </div>

      <DocsH2>{c.tonesTitle}</DocsH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {c.tones.map((tone) => (
          <div key={tone.name} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <p className="text-sm font-semibold text-white mb-1">{tone.name}</p>
            <p className="text-xs text-zinc-500">{tone.desc}</p>
          </div>
        ))}
      </div>

      <Callout variant="info" title={c.calloutTitle}>{c.calloutBody}</Callout>
    </div>
  );
}
