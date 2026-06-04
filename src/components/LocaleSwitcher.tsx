'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { type Locale } from '@/i18n/routing';

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[2];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Cookie ga saqlash (1 yil)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;

    // URL da mavjud locale prefiksini yangi locale bilan almashtirish
    const segments = pathname.split('/');
    const locales: string[] = ['uz', 'ru', 'en'];

    if (locales.includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700/60 hover:border-zinc-600 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white text-xs font-semibold transition-all duration-150 select-none"
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 z-50 w-28 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl p-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors text-left ${
                l.code === locale
                  ? 'bg-[#FB3640]/10 text-[#FB3640] font-bold'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && <span className="ml-auto text-[#FB3640]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
