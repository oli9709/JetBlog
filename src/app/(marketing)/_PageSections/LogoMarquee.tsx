'use client';

const items = [
  { name: 'Claude AI',   icon: '🤖' },
  { name: 'DataForSEO',  icon: '📊' },
  { name: 'Telegram',    icon: '💬' },
  { name: 'Next.js',     icon: '⚡' },
  { name: 'WordPress',   icon: '🌐' },
  { name: 'OpenAI',      icon: '🎨' },
  { name: 'Webhook',     icon: '🔗' },
  { name: 'Google GSC',  icon: '🔍' },
  { name: 'Supabase',    icon: '☁️' },
  { name: 'Vercel',      icon: '🚀' },
];

export default function LogoMarquee() {
  return (
    <section className="py-12 md:py-16">
      <div className="flex flex-col items-center space-y-6">
        <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center">
          Zamonaviy texnologiyalar bilan integratsiya qilingan
        </p>

        <div className="relative overflow-hidden w-full">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 w-32 h-full z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #000, transparent)' }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 w-32 h-full z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #000, transparent)' }}
          />

          {/* Track — doubled for seamless loop */}
          <div className="flex gap-4 marquee-track py-3">
            {[...items, ...items].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap
                           bg-white/5 border border-white/10 backdrop-blur-sm
                           rounded-full px-5 py-2.5
                           transition-colors hover:bg-white/10 cursor-default"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium text-white/80">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
