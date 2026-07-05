'use client';

import { useTranslations } from 'next-intl';

const items = [
  { emoji: '🤖', name: 'Claude AI' },
  { emoji: '📊', name: 'DataForSEO' },
  { emoji: '💬', name: 'Telegram' },
  { emoji: '⚡', name: 'Next.js' },
  { emoji: '🌐', name: 'WordPress' },
  { emoji: '🎨', name: 'OpenAI' },
  { emoji: '🔗', name: 'Webhook' },
  { emoji: '🔍', name: 'Google GSC' },
  { emoji: '☁️', name: 'Supabase' },
  { emoji: '🚀', name: 'Vercel' },
];

export default function LogoMarquee() {
  const t = useTranslations('Landing');
  return (
    <section className="py-12 md:py-16">
      <div className="flex flex-col items-center space-y-6">
        <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center">
          {t('techBadge')}
        </p>

        <div className="relative overflow-hidden w-full py-6">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 w-40 h-full z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #000000, transparent)' }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 w-40 h-full z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #000000, transparent)' }}
          />

          <div className="flex gap-4 marquee-track">
            {[...items, ...items].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2.5
                           px-5 py-3 rounded-xl
                           bg-white/5 border border-white/10
                           backdrop-blur-sm cursor-pointer
                           whitespace-nowrap
                           transition-all duration-300 ease-out
                           hover:scale-110 hover:border-red-500/50
                           hover:bg-red-950/30"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow =
                    '0 0 30px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
