import Link from 'next/link';
import { ArrowRight, Zap, Shield, Bot, Globe, Key, FileText, Check } from 'lucide-react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-12 pb-20 md:pb-28">

      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30 blur-[120px] bg-gradient-to-br from-[#FB3640] via-[#FF6B6B] to-[#FB3640]/30 -z-10 rounded-full mix-blend-screen" />
      <div className="particles-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 7.3) % 100}%`,
              animationDelay: `${(i * 1.1) % 15}s`,
              animationDuration: `${10 + (i * 0.7) % 10}s`,
            }}
          />
        ))}
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center gap-6 text-center max-w-4xl mx-auto">

          <ScrollReveal delay="200" className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] md:leading-[1.05]">
              Har kuni yangi maqola.{' '}
            </h1>
            <div className="h-[48px] md:h-[80px] flex items-center justify-center">
              <TypingAnimation
                className="text-4xl md:text-7xl font-extrabold bg-gradient-to-r from-[#FB3640] to-[#FF8A8F] bg-clip-text text-transparent"
                duration={100}
              >
                Siz yozmaysiz — biz yozamiz.
              </TypingAnimation>
            </div>
          </ScrollReveal>

          <ScrollReveal delay="300">
            <p className="max-w-[42rem] text-zinc-400 text-base md:text-xl leading-relaxed mt-4">
              Kalit so&apos;z bering — maqolani biz yozamiz.<br />
              Rasm, SEO, nashr — hammasi avtomatik.<br />
              WordPress, Ghost, Webflow — istalgan saytga.
            </p>
          </ScrollReveal>

          <ScrollReveal delay="400" className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
              <Link href="/auth/signup" className="w-full sm:w-auto">
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
                href="/pricing"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-zinc-700/50 bg-zinc-900/50 px-8 text-sm font-bold text-zinc-300 backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Narxlar bilan tanishish
                </span>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard Mockup */}
        <ScrollReveal delay="500">
          <div className="mt-16 md:mt-24 p-2 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl shadow-[0_0_50px_rgba(251,54,64,0.1)] max-w-5xl mx-auto overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/90 overflow-hidden shadow-inner relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Window bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs text-zinc-500 font-medium font-mono ml-2">jetblog.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Autopilot Faol
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 min-h-[420px]">
                {/* Sidebar */}
                <div className="border-r border-zinc-900 p-4 space-y-6 hidden md:block bg-zinc-950/20 relative z-10">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Bot className="w-5 h-5 text-[#FB3640]" />
                    <span className="text-sm font-bold text-white tracking-tight">JetBlog.app</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FB3640]/10 text-[#FF8A8F] text-xs font-bold border border-[#FB3640]/20">
                      <Globe className="w-4 h-4" /> Ulanishlar
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-400 text-xs font-semibold cursor-default">
                      <Key className="w-4 h-4" /> Kalit so&apos;zlar
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-400 text-xs font-semibold cursor-default">
                      <FileText className="w-4 h-4" /> Kontent
                    </div>
                  </div>
                </div>

                {/* Main */}
                <div className="col-span-3 p-6 space-y-6 relative z-10">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
                    <div>
                      <h3 className="text-md font-bold text-white">WordPress Ulanishlari</h3>
                      <p className="text-xs text-zinc-500">Faol bloglar va avtomat nashr jadvallari</p>
                    </div>
                    <span className="text-xs font-bold text-[#FB3640] bg-[#FB3640]/10 border border-[#FB3640]/20 px-3 py-1 rounded-xl cursor-default hover:bg-[#FB3640]/20 transition-colors">
                      + Sayt Qo&apos;shish
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4 hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs group-hover:scale-110 transition-transform">WP</div>
                          <div>
                            <h4 className="text-xs font-bold text-white">mytechblog.uz</h4>
                            <span className="text-[10px] text-zinc-500">WordPress REST API v2</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Faol
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">Haftalik reja:</span>
                          <span className="text-zinc-300 font-bold">Du, Chor</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">Nashr vaqti:</span>
                          <span className="text-zinc-300 font-bold">09:00 UTC</span>
                        </div>
                      </div>
                    </div>

                    <div className="group p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4 hover:border-[#FB3640]/50 hover:bg-zinc-900/60 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20 flex items-center justify-center text-[#FF8A8F] font-bold text-xs group-hover:scale-110 transition-transform">GH</div>
                          <div>
                            <h4 className="text-xs font-bold text-white">marketingdna.com</h4>
                            <span className="text-[10px] text-zinc-500">Ghost CMS Admin API</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Faol
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">Haftalik reja:</span>
                          <span className="text-zinc-300 font-bold">Pay, Shan</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">Nashr vaqti:</span>
                          <span className="text-zinc-300 font-bold">14:00 UTC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-900/80">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FB3640]">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">100% Avtomatik</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">Claude 3.5 Sonnet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">Xavfsiz Integratsiya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
