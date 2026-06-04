'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils/helpers';

export function HeaderAuthButton({ hasSession }: { hasSession: boolean }) {
  const locale = useLocale();

  if (hasSession) {
    return (
      <Link
        href={`/${locale}/dashboard/main`}
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'sm' }),
          'px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all'
        )}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/auth/login`}
      className={cn(
        buttonVariants({ variant: 'secondary', size: 'sm' }),
        'px-6 bg-[#FB3640] hover:bg-[#FF6B6B] text-white font-semibold rounded-full transition-all shadow-md shadow-[#FB3640]/20'
      )}
    >
      Kirish
    </Link>
  );
}
