'use client';

import { useEffect, useState } from 'react';
import { Bot, Key, Calendar, ImageIcon, Send } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ScrollReveal } from '@/components/ScrollReveal';

// ── Terminal animation ──────────────────────────────────────────────────────
const LINES = [
  { text: "$ jetblog generate --keyword 'toshkentda stomatolog'", color: '#00FF88' },
  { text: '✓ Kalit so\'z tahlil qilindi: 3,768 qidiruv/oy',      color: '#00FF88' },
  { text: '✓ Claude AI maqola yozmoqda...',                        color: '#00FF88' },
  { text: '✓ DALL-E 3 rasm yaratmoqda...',                         color: '#00FF88' },
  { text: '✓ WordPress ga yuklanmoqda...',                          color: '#00FF88' },
  { text: '🚀 Maqola nashr qilindi! wp_post_id: 1247',             color: '#00FF88' },
];

function TerminalMockup() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Line-by-line reveal with loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (visibleLines < LINES.length) {
      timeout = setTimeout(() => setVisibleLines(v => v + 1), 800);
    } else {
      // Pause 2s then restart
      timeout = setTimeout(() => setVisibleLines(0), 2000);
    }
    return () => clearTimeout(timeout);
  }, [visibleLines]);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* macOS-style title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-zinc-900/60">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">jetblog — zsh</span>
      </div>

      {/* Terminal body */}
      <div className="flex-1 p-5 font-mono text-xs leading-relaxed bg-[#000F08] overflow-hidden">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex items-start gap-0 mb-1 animate-fadeIn">
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        {/* Blinking cursor */}
        <span
          className="inline-block w-2 h-4 align-middle"
          style={{
            backgroundColor: '#00FF88',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s'
          }}
        />
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-zinc-900/40">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Avtomatik ishlamoqda
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-white/60">
          <NumberTicker value={1247} className="text-white font-mono" />
          <span className="text-zinc-500 ml-1">maqola nashr qilindi</span>
        </div>
      </div>
    </div>
  );
}

// ── Small feature cards ─────────────────────────────────────────────────────
const smallFeatures = [
  {
    Icon: Key,
    name: "Kalit So'zlar",
    description: "DataForSEO orqali qidiruv hajmi va raqobat darajasini tahlil qiling.",
  },
  {
    Icon: Calendar,
    name: "Smart Scheduler",
    description: "Haftaning qaysi kunlari va soatlarida nashr jadvali.",
  },
  {
    Icon: ImageIcon,
    name: "DALL-E 3 Cover Art",
    description: "Har bir maqola uchun premium muqova rasmlarini avtomatik yaratish.",
  },
  {
    Icon: Send,
    name: "Telegram Kanallari",
    description: "Yangi maqolani avtomatik rasm va havola bilan Telegramga yuboring.",
  },
];

// ── Main component ──────────────────────────────────────────────────────────
export default function FeatureList() {
  return (
    <section className="space-y-12 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">

      <ScrollReveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Saytingiz o'sishi uchun{' '}
            <span className="bg-gradient-to-r from-[#FB3640] to-[#FF8A8F] bg-clip-text text-transparent">
              Cheksiz Imkoniyatlar
            </span>
          </h2>
          <p className="max-w-2xl text-zinc-400 text-base md:text-lg leading-relaxed">
            Sizning WordPress saytingiz uchun to'liq yopiq tsiklli avtomatlashtirilgan SEO va maqola yozish tizimi.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay="200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[220px]">

          {/* ── LARGE CARD (col-span-2, row-span-2) ── */}
          <div
            className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden
                       border border-[#FB3640]/20 bg-[#000F08]
                       transition-all duration-300
                       hover:border-[#FB3640]/60
                       group"
            style={{ boxShadow: '0 0 0 1px transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 20px rgba(251,54,64,0.15), 0 0 40px rgba(251,54,64,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px transparent';
            }}
          >
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/5">
              <div className="p-2 rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20">
                <Bot className="w-5 h-5 text-[#FB3640]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Yozuvchi — Live Demo</h3>
                <p className="text-xs text-zinc-500">Claude AI + DALL-E 3 + WordPress avtomatik pipeline</p>
              </div>
            </div>

            {/* Terminal fills remaining space */}
            <div className="h-[calc(100%-76px)]">
              <TerminalMockup />
            </div>
          </div>

          {/* ── SMALL CARDS ── */}
          {smallFeatures.map(({ Icon, name, description }) => (
            <div
              key={name}
              className="rounded-2xl p-6 flex flex-col justify-between
                         border border-[#FB3640]/20 bg-[#000F08]
                         transition-all duration-300
                         hover:border-[#FB3640]/60 group"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 0 20px rgba(251,54,64,0.15), 0 0 40px rgba(251,54,64,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div className="p-2.5 w-fit rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20
                              group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-[#FB3640]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}

        </div>
      </ScrollReveal>
    </section>
  );
}
