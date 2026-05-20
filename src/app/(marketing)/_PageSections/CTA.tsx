import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function CTA() {
  return (
    <div className="relative overflow-hidden py-24 sm:py-32">
      
      {/* Glow effect background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 blur-[120px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full -z-10 animate-pulse" />

      <ScrollReveal>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="relative p-8 md:p-16 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl space-y-8 overflow-hidden">
            
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-4 h-4 animate-pulse" /> Autopilot Rejimi
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                SEO-ni avtomatlashtirishga tayyormisiz?
              </h2>
              
              <div className="h-10">
                <TypingAnimation 
                  className="text-lg md:text-xl font-medium text-emerald-400"
                  duration={50}
                >
                  "Toshkentda eng yaxshi stomatolog..." - avtomatik yozilmoqda.
                </TypingAnimation>
              </div>

              <p className="mx-auto max-w-xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Hozir ulaning va 1 daqiqa ichida birinchi kalit so'zlaringiz uchun avtomatlashtirilgan AI maqolalaringizni WordPress-ga yuklang. Saytingiz organik trafik bo'yicha yuqorilasin!
              </p>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <ShimmerButton className="shadow-2xl h-14 px-8 w-full sm:w-auto">
                    <span className="whitespace-pre-wrap text-center text-sm font-bold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-base flex items-center gap-2">
                      Bepul Autopilotni Boshlash <ArrowRight className="w-4 h-4" />
                    </span>
                  </ShimmerButton>
                </Link>
                <Link
                  href="/pricing"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-zinc-700/50 bg-zinc-900/50 px-8 text-sm font-bold text-zinc-300 backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 w-full sm:w-auto"
                >
                  <span className="relative z-10">Tarif Rejalar</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
