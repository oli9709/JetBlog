'use client';

import React, { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Globe, Ghost, Layers, Webhook, BookOpen, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PlatformType } from '@/components/connections/PlatformSelector';
import confetti from 'canvas-confetti';

interface PlatformMeta {
  icon: React.ReactNode;
  title: string;
  description: (endpointUrl?: string) => string;
}

const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  wordpress: {
    icon: <Globe className="w-8 h-8" />,
    title: 'WordPress ulandi!',
    description: () =>
      "WordPress saytingiz ulandi! Endi maqolalar to'g'ridan-to'g'ri WordPress ga publish bo'ladi.",
  },
  ghost: {
    icon: <Ghost className="w-8 h-8" />,
    title: 'Ghost ulandi!',
    description: () =>
      "Ghost blogingiz ulandi! Maqolalar Ghost Admin API orqali avtomatik e'lon qilinadi.",
  },
  webflow: {
    icon: <Layers className="w-8 h-8" />,
    title: 'Webflow ulandi!',
    description: () =>
      "Webflow saytingiz ulandi! Maqolalar CMS Collection ga avtomatik qo'shiladi.",
  },
  webhook: {
    icon: <Webhook className="w-8 h-8" />,
    title: 'Saytingiz ulandi!',
    description: (endpointUrl) =>
      `Saytingiz ulandi! Har yangi maqola webhook orqali ${endpointUrl ?? 'endpoint'} ga yuboriladi.`,
  },
};

interface StepSuccessProps {
  platform: PlatformType;
  endpointUrl?: string;
  keyword?: string;
}

export function StepSuccess({ platform, endpointUrl, keyword }: StepSuccessProps) {
  const meta = PLATFORM_META[platform];

  useEffect(() => {
    const t = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#FB3640', '#ff6b6b', '#fff', '#ffd700'],
      });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto py-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#FB3640]/10 border border-[#FB3640]/25 flex items-center justify-center text-[#FB3640]">
          {meta.icon}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#000F08] flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
        {meta.title} 🎉
      </h2>
      <p className="text-zinc-400 text-sm leading-relaxed mb-4">
        {meta.description(endpointUrl)}
      </p>

      {keyword && (
        <div className="px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-300 mb-6 w-full">
          <span className="text-zinc-500">Birinchi maqola kalit so&apos;zi: </span>
          <span className="font-semibold text-white">&quot;{keyword}&quot;</span>
        </div>
      )}

      {/* What's next */}
      <div className="w-full mb-8">
        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Keyingi qadamlar</p>
        <ul className="space-y-2 text-left">
          {[
            "Kalit so'zlarni tasdiqlang → Keywords sahifasi",
            'Brand voice sozlang → maqolalar siznikiga o\'xshab yoziladi',
            'Autopilot yoqing → har kuni avtomatik nashr',
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-500">
              <span className="text-[#FB3640] shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/dashboard/main"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-300',
            'bg-gradient-to-r from-[#FB3640] to-rose-500',
            'hover:shadow-[0_0_24px_rgba(251,54,64,0.3)] hover:scale-[1.02] active:scale-95'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard ga o&apos;tish →
        </Link>
        <Link
          href="/docs/quick-start"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
            'border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Docs ga o&apos;tish
        </Link>
      </div>
    </div>
  );
}
