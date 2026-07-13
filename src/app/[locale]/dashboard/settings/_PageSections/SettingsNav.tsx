'use client';
import { Link } from '@/i18n/navigation';

import { cn } from '@/lib/utils/helpers';
import { usePathname } from '@/i18n/navigation';
import { NavItem } from '@/lib/types/types';
import { useTranslations } from 'next-intl';

interface SettingsNavProps {
  items: NavItem[];
}

export function SettingsNav({ items }: SettingsNavProps) {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();

  const titleMap: Record<string, string> = {
    'Profil': t('navProfile'),
    "To'lov": t('navBilling'),
    "Webhook'lar": t('navWebhooks'),
    'Obuna': t('navSubscription'),
  };

  return (
    <nav className="flex items-center space-x-6 mb-8">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.link}
          className={cn(
            'text-sm font-medium transition-colors',
            item.link !== pathname
              ? 'hover:text-primary hover:underline underline-offset-8 decoration-2 decoration-[#FB3640]'
              : 'text-primary underline underline-offset-8 decoration-2 decoration-[#FB3640]'
          )}
        >
          {titleMap[item.title] ?? item.title}
        </Link>
      ))}
    </nav>
  );
}
