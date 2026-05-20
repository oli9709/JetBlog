'use client';

import { Marquee } from '@/components/magicui/marquee';
import { ScrollReveal } from '@/components/ScrollReveal';

const logos = [
  { name: 'WordPress', icon: 'SiWordpress' },
  { name: 'Claude AI', icon: 'SiAnthropic' },
  { name: 'OpenAI', icon: 'SiOpenai' },
  { name: 'DataForSEO', icon: 'TbSeo' },
  { name: 'Telegram', icon: 'SiTelegram' },
  { name: 'Next.js', icon: 'SiNextdotjs' }
];

export default function LogoMarquee() {
  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <ScrollReveal>
        <div className="flex flex-col items-center justify-center space-y-6">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center">
            Zamonaviy texnologiyalar bilan integratsiya qilingan
          </p>
          
          <div className="relative flex h-full w-full max-w-7xl flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
              {logos.map((logo, idx) => (
                <div
                  key={idx}
                  className="mx-4 flex items-center justify-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 px-6 py-4 backdrop-blur-sm transition-all hover:bg-zinc-800/50 hover:border-zinc-700 shadow-md"
                >
                  {/* We are just rendering text since we don't have react-icons installed, 
                      but we simulate a professional badge look */}
                  <span className="text-lg font-bold text-zinc-300">{logo.name}</span>
                </div>
              ))}
            </Marquee>
            
            {/* Gradient edges for smooth fade out */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background dark:from-background"></div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
