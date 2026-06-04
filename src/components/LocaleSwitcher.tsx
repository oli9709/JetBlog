'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';
import { type Locale } from '@/i18n/routing';

const LOCALES: { code: Locale; flag: string }[] = [
  { code: 'uz', flag: '🇺🇿' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'en', flag: '🇬🇧' },
];

const LOCALE_LIST = ['uz', 'ru', 'en'];

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Cookie (1 yil)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;

    // URL dagi locale segmentini almashtirish
    const segments = pathname.split('/');
    if (LOCALE_LIST.includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    // window.location — to'liq reload, messages yangilanadi
    window.location.href = segments.join('/') || `/${newLocale}`;
  };

  return (
    <div className="flex gap-0.5 items-center">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          title={l.code.toUpperCase()}
          className={cn(
            'px-2 py-1 rounded text-xs font-semibold transition-colors',
            locale === l.code
              ? 'bg-[#FB3640] text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          )}
        >
          {l.flag} {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
