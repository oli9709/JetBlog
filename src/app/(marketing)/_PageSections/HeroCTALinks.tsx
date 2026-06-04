'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

export function HeroCTALinks() {
  const locale = useLocale();

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
      <Link href={`/${locale}/auth/signup`} className="w-full sm:w-auto">
        <ShimmerButton
          background="rgba(251, 54, 64, 1)"
          className="shadow-2xl shadow-[#FB3640]/30 h-14 px-8 text-sm font-bold w-full sm:w-auto"
        >
          <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-base flex items-center gap-2">
            Bepul Boshlash <ArrowRight className="w-4 h-4" />
          </span>
        </ShimmerButton>
      </Link>
      <Link
        href={`/${locale}/pricing`}
        className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-zinc-700/50 bg-zinc-900/50 px-8 text-sm font-bold text-zinc-300 backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 w-full sm:w-auto"
      >
        <span className="relative z-10 flex items-center gap-2">Narxlar bilan tanishish</span>
      </Link>
    </div>
  );
}
