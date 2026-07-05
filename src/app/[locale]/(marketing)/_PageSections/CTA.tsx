import { Link } from '@/i18n/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ScrollReveal } from '@/components/ScrollReveal';
import { getTranslations } from 'next-intl/server';

export default async function CTA() {
  const t = await getTranslations('Landing');

  return (
    <div className="relative overflow-hidden py-24 sm:py-32">

      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 blur-[120px] bg-gradient-to-r from-[#FB3640] via-[#FF6B6B] to-[#FB3640]/50 rounded-full -z-10 animate-pulse" />

      <ScrollReveal>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="relative p-8 md:p-16 rounded-3xl border border-[#FB3640]/20 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-[#FB3640]/5 space-y-8 overflow-hidden">

            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FB3640]/8 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-[#FB3640]/30 bg-[#FB3640]/10 text-[#FF8A8F] text-xs font-bold uppercase shadow-[0_0_15px_rgba(251,54,64,0.2)]">
                <Sparkles className="w-4 h-4 animate-pulse text-[#FB3640]" /> {t('ctaMode')}
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t('ctaHeading')}
              </h2>

              <div className="h-10">
                <TypingAnimation
                  className="text-lg md:text-xl font-medium text-emerald-400"
                  duration={50}
                >
                  {t('ctaTyping')}
                </TypingAnimation>
              </div>

              <p className="mx-auto max-w-xl text-sm md:text-base text-zinc-400 leading-relaxed">
                {t('ctaBody')}
              </p>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <ShimmerButton
                    background="rgba(251, 54, 64, 1)"
                    className="shadow-2xl shadow-[#FB3640]/30 h-14 px-8 w-full sm:w-auto"
                  >
                    <span className="whitespace-pre-wrap text-center text-sm font-bold leading-none tracking-tight text-white lg:text-base flex items-center gap-2">
                      {t('ctaStartAutopilot')} <ArrowRight className="w-4 h-4" />
                    </span>
                  </ShimmerButton>
                </Link>
                <Link
                  href="/pricing"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-zinc-700/50 bg-zinc-900/50 px-8 text-sm font-bold text-zinc-300 backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 w-full sm:w-auto"
                >
                  <span className="relative z-10">{t('ctaPlans')}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
