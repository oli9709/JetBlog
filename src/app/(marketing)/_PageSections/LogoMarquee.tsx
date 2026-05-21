'use client';

import { Marquee } from '@/components/magicui/marquee';
import { ScrollReveal } from '@/components/ScrollReveal';

const logos = [
  { name: 'Claude AI', icon: '🤖' },
  { name: 'DataForSEO', icon: '📊' },
  { name: 'Telegram', icon: '💬' },
  { name: 'Next.js', icon: '⚡' },
  { name: 'WordPress', icon: '🌐' },
  { name: 'OpenAI', icon: '🎨' },
  { name: 'Webhook', icon: '🔗' },
  { name: 'Google GSC', icon: '🔍' },
  { name: 'Supabase', icon: '☁️' },
  { name: 'Vercel', icon: '🚀' }
];

export default function LogoMarquee() {
  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <ScrollReveal>
        <div className="flex flex-col items-center justify-center space-y-6">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center">
            Zamonaviy texnologiyalar bilan integratsiya qilingan
          </p>
          
          <div 
            className="relative flex h-full w-full max-w-7xl flex-col items-center justify-center overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
          >
            <Marquee pauseOnHover className="py-4 [--duration:30s]">
              {logos.map((logo, idx) => (
                <div
                  key={idx}
                  className="mx-2 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm transition-all hover:bg-white/10 shadow-md"
                >
                  <span className="text-xl">{logo.icon}</span>
                  <span className="text-sm font-medium text-white/90">{logo.name}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
