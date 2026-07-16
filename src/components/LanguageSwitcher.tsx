'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const langs = [['uz', "O'zbek"], ['en', 'English']] as const;
  return (
    <div className="flex gap-1 text-sm">
      {langs.map(([code, label]) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className={code === locale ? 'font-bold underline' : 'opacity-70'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
