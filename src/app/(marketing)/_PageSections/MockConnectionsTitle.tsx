'use client';

import { useLocale } from 'next-intl';

const TITLES: Record<string, string> = {
  uz: 'WordPress Ulanishlari',
  ru: 'WordPress подключения',
  en: 'WordPress Connections',
};

const SUBTITLES: Record<string, string> = {
  uz: 'Faol bloglar va avtomat nashr qilish jadvallari',
  ru: 'Активные блоги и расписания автопубликации',
  en: 'Active blogs and automated publishing schedules',
};

const ADD_SITE: Record<string, string> = {
  uz: '+ Sayt Qo\'shish',
  ru: '+ Добавить сайт',
  en: '+ Add Site',
};

export function MockConnectionsTitle() {
  const locale = useLocale();
  return (
    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
      <div>
        <h3 className="text-md font-bold text-white">
          {TITLES[locale] ?? TITLES.en}
        </h3>
        <p className="text-xs text-zinc-500">
          {SUBTITLES[locale] ?? SUBTITLES.en}
        </p>
      </div>
      <span className="text-xs font-bold text-[#FB3640] bg-[#FB3640]/10 border border-[#FB3640]/20 px-3 py-1 rounded-xl cursor-default hover:bg-[#FB3640]/20 transition-colors">
        {ADD_SITE[locale] ?? ADD_SITE.en}
      </span>
    </div>
  );
}
