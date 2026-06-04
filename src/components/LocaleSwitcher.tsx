'use client';

import { usePathname } from 'next/navigation';

const LOCALES = [
  { code: 'uz', flag: '🇺🇿', label: 'UZ' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
];

const LOCALE_CODES = ['uz', 'ru', 'en'];

export function LocaleSwitcher() {
  const pathname = usePathname();

  // /uz/pricing → 'uz' | /pricing → 'uz' (default)
  const currentLocale =
    LOCALE_CODES.find(
      (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    ) ?? 'uz';

  const handleSwitch = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const hasLocale = LOCALE_CODES.some(
      (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    );

    // /uz/pricing → /en/pricing  |  /pricing → /en/pricing
    const newPath = hasLocale
      ? `/${newLocale}${pathname.slice(3)}`
      : `/${newLocale}${pathname}`;

    window.location.href = newPath;
  };

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          className={[
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all',
            currentLocale === code
              ? 'bg-[#FB3640] text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/10',
          ].join(' ')}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
