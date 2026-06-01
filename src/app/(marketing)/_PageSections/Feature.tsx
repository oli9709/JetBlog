'use client';

import React, { useRef } from 'react';
import { Globe, Bot, Image as ImageIcon, Key, Cpu, Zap, Share2 } from 'lucide-react';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Feature() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
      
      {/* Title */}
      <ScrollReveal>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest text-[#FB3640] uppercase">Qanday Ishlaydi?</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Maqola yozishning <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#FB3640] to-[#FF8A8F] bg-clip-text text-transparent">Yangi Davri</span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Siz shunchaki kalit so'zni berasiz. Qolgan barcha bosqichlarni tizim o'zi mustaqil bajaradi va maqolani to'g'ridan-to'g'ri saytingizga yuklaydi.
          </p>
        </div>
      </ScrollReveal>

      {/* Animated Pipeline */}
      <ScrollReveal delay="200">
        <div 
          className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/50 p-10 shadow-2xl backdrop-blur-md"
          ref={containerRef}
        >
          <div className="flex h-full w-full flex-col items-stretch justify-between gap-10 max-w-4xl mx-auto relative z-10">
            
            {/* Top Row */}
            <div className="flex flex-row items-center justify-between">
              <div ref={div1Ref} className="z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-[#FB3640]/30 bg-zinc-900 shadow-[0_0_20px_rgba(251,54,64,0.2)]">
                <Key className="text-[#FB3640] h-6 w-6" />
                <span className="text-[9px] font-bold mt-1 text-zinc-400">SEO</span>
              </div>
              
              <div ref={div2Ref} className="z-10 flex h-24 w-24 flex-col items-center justify-center rounded-3xl border-2 border-[#FB3640]/50 bg-zinc-900 shadow-[0_0_30px_rgba(251,54,64,0.4)]">
                <Bot className="text-[#FB3640] h-10 w-10 animate-pulse" />
                <span className="text-[10px] font-extrabold mt-2 text-white">Claude 3.5</span>
              </div>
              
              <div ref={div3Ref} className="z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-cyan-500/30 bg-zinc-900 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <ImageIcon className="text-cyan-400 h-6 w-6" />
                <span className="text-[9px] font-bold mt-1 text-zinc-400">DALL-E</span>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-row items-center justify-between">
              <div ref={div4Ref} className="z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/30 bg-zinc-900 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Globe className="text-emerald-400 h-6 w-6" />
                <span className="text-[9px] font-bold mt-1 text-zinc-400">Wordpress</span>
              </div>
              
              <div ref={div5Ref} className="z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-rose-500/30 bg-zinc-900 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <Zap className="text-rose-400 h-6 w-6" />
                <span className="text-[9px] font-bold mt-1 text-zinc-400">Index</span>
              </div>
              
              <div ref={div6Ref} className="z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-sky-500/30 bg-zinc-900 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                <Share2 className="text-sky-400 h-6 w-6" />
                <span className="text-[9px] font-bold mt-1 text-zinc-400">Telegram</span>
              </div>
            </div>
          </div>

          {/* Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div2Ref}
            curvature={-50}
            endYOffset={-10}
            pathColor="#3f3f46"
            gradientStartColor="#FB3640"
            gradientStopColor="#FF6B6B"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div2Ref}
            curvature={50}
            endYOffset={-10}
            reverse
            pathColor="#3f3f46"
            gradientStartColor="#06b6d4"
            gradientStopColor="#FB3640"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div4Ref}
            curvature={-50}
            startYOffset={10}
            pathColor="#3f3f46"
            gradientStartColor="#FB3640"
            gradientStopColor="#10b981"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div4Ref}
            toRef={div5Ref}
            pathColor="#3f3f46"
            gradientStartColor="#10b981"
            gradientStopColor="#f43f5e"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div6Ref}
            pathColor="#3f3f46"
            gradientStartColor="#f43f5e"
            gradientStopColor="#0ea5e9"
          />
        </div>
      </ScrollReveal>

      {/* Stats with Number Ticker */}
      <ScrollReveal delay="400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex">
              <NumberTicker value={500} />+
            </div>
            <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Nashr Qilingan Maqolalar</span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex">
              <NumberTicker value={2} />
            </div>
            <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Daqiqada tayyor bo'ladi</span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex">
              <NumberTicker value={98} />%
            </div>
            <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Mijozlar Mamnuniyati</span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
