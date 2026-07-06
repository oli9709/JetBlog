'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useTranslations, useLocale } from 'next-intl';

// ── Terminal animation (LARGE CARD) ──────────────────────────────────────────
const LINES_DATA: Record<string, { text: string; color: string }[]> = {
  uz: [
    { text: "$ jetblog generate --keyword 'toshkentda stomatolog'", color: '#00FF88' },
    { text: "✓ Kalit so'z tahlil qilindi: 3,768 qidiruv/oy",       color: '#00FF88' },
    { text: '✓ Claude AI maqola yozmoqda...',                        color: '#00FF88' },
    { text: '✓ DALL-E 3 rasm yaratmoqda...',                         color: '#00FF88' },
    { text: '✓ WordPress ga yuklanmoqda...',                          color: '#00FF88' },
    { text: '🚀 Maqola nashr qilindi! wp_post_id: 1247',             color: '#00FF88' },
  ],
  ru: [
    { text: "$ jetblog generate --keyword 'stomatolog v tashkente'", color: '#00FF88' },
    { text: '✓ Ключевое слово проанализировано: 3 768 запросов/мес.', color: '#00FF88' },
    { text: '✓ Claude AI пишет статью...',                            color: '#00FF88' },
    { text: '✓ DALL-E 3 создаёт изображение...',                      color: '#00FF88' },
    { text: '✓ Загрузка в WordPress...',                               color: '#00FF88' },
    { text: '🚀 Статья опубликована! wp_post_id: 1247',               color: '#00FF88' },
  ],
  en: [
    { text: "$ jetblog generate --keyword 'best dentist tashkent'",  color: '#00FF88' },
    { text: '✓ Keyword analyzed: 3,768 searches/mo',                  color: '#00FF88' },
    { text: '✓ Claude AI writing article...',                          color: '#00FF88' },
    { text: '✓ DALL-E 3 generating image...',                          color: '#00FF88' },
    { text: '✓ Uploading to WordPress...',                             color: '#00FF88' },
    { text: '🚀 Article published! wp_post_id: 1247',                 color: '#00FF88' },
  ],
};

function TerminalMockup({ runningLabel, publishedLabel, locale }: { runningLabel: string; publishedLabel: string; locale: string }) {
  const LINES = LINES_DATA[locale] ?? LINES_DATA.uz;
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (visibleLines < LINES.length) {
      timeout = setTimeout(() => setVisibleLines(v => v + 1), 800);
    } else {
      timeout = setTimeout(() => setVisibleLines(0), 2000);
    }
    return () => clearTimeout(timeout);
  }, [visibleLines, LINES.length]);

  useEffect(() => {
    const id = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-zinc-900/60">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">jetblog — zsh</span>
      </div>
      <div className="flex-1 p-5 font-mono text-xs leading-relaxed bg-[#000F08] overflow-hidden">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex items-start gap-0 mb-1 animate-fadeIn">
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        <span
          className="inline-block w-2 h-4 align-middle"
          style={{ backgroundColor: '#00FF88', opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
        />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-zinc-900/40">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {runningLabel}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-white/60">
          <NumberTicker value={127} className="text-white font-mono" />
          <span className="text-zinc-500 ml-1">{publishedLabel}</span>
        </div>
      </div>
    </div>
  );
}

const KEYWORD_EXAMPLES: Record<string, Array<{ kw: string; vol: number; dot: string; diff: 'easy' | 'medium' | 'hard' }>> = {
  uz: [
    { kw: 'toshkentda stomatolog', vol: 2400, dot: '#22c55e', diff: 'easy' },
    { kw: 'ingliz tili kurslari',  vol: 8100, dot: '#eab308', diff: 'medium' },
    { kw: "uy-joy narxlari",       vol: 5600, dot: '#ef4444', diff: 'hard' },
  ],
  ru: [
    { kw: 'стоматолог в Ташкенте',    vol: 2400, dot: '#22c55e', diff: 'easy' },
    { kw: 'курсы английского языка',  vol: 8100, dot: '#eab308', diff: 'medium' },
    { kw: 'цены на недвижимость',     vol: 5600, dot: '#ef4444', diff: 'hard' },
  ],
  en: [
    { kw: 'best dentist Tashkent',    vol: 2400, dot: '#22c55e', diff: 'easy' },
    { kw: 'English language courses', vol: 8100, dot: '#eab308', diff: 'medium' },
    { kw: 'real estate prices',       vol: 5600, dot: '#ef4444', diff: 'hard' },
  ],
};

// ── KARTA 1: Keywords ────────────────────────────────────────────────────────────
function KeywordCard({ diffEasy, diffMedium, diffHard, locale }: { diffEasy: string; diffMedium: string; diffHard: string; locale: string }) {
  const examples = KEYWORD_EXAMPLES[locale] ?? KEYWORD_EXAMPLES.uz;
  const diffLabels: Record<'easy' | 'medium' | 'hard', string> = { easy: diffEasy, medium: diffMedium, hard: diffHard };
  const KEYWORDS = examples.map(e => ({ ...e, diff: diffLabels[e.diff] }));

  const [visible, setVisible] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    KEYWORDS.forEach((k, i) => {
      setTimeout(() => {
        setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * 400 + 300);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full mt-1">
      {KEYWORDS.map((k, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-[10px]"
          style={{
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <span className="text-white/80 truncate flex-1">{k.kw}</span>
          <span className="text-white/60 font-mono shrink-0">
            {visible[i] ? <NumberTicker value={k.vol} className="text-white/60 font-mono text-[10px]" /> : '0'}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: k.dot }} />
            <span style={{ color: k.dot }}>{k.diff}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ── KARTA 2: Smart Scheduler ──────────────────────────────────────────────────
const DAYS_DATA: Record<string, string[]> = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const ACTIVE = [0, 2, 4]; // Mon, Wed, Fri

function SchedulerCard({ nextPublishLabel, nextPublishDay, locale }: { nextPublishLabel: string; nextPublishDay: string; locale: string }) {
  const DAYS = DAYS_DATA[locale] ?? DAYS_DATA.uz;
  const [now, setNow] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      // next Monday
      const dayOfWeek = d.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const nextMon = new Date(d);
      nextMon.setDate(d.getDate() + daysUntilMonday);
      setNow(`${nextMon.getDate()}.${String(nextMon.getMonth() + 1).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full mt-1">
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => {
          const isActive = ACTIVE.includes(i);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[9px] text-white/40">{d}</span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold relative"
                style={{
                  background: isActive ? 'rgba(251,54,64,0.2)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(251,54,64,0.5)' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? '#FB3640' : '#ffffff40',
                }}
              >
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-md animate-ping"
                    style={{ backgroundColor: 'rgba(251,54,64,0.25)', animationDuration: '2s' }}
                  />
                )}
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-white/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FB3640] animate-pulse" />
        {nextPublishLabel} <span className="text-white font-semibold">{nextPublishDay}</span>
        {now && <span className="ml-auto text-white/30">{now}</span>}
      </div>
    </div>
  );
}

// ── KARTA 3: DALL-E 3 Cover Art ───────────────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg, #7c3aed 0%, #FB3640 100%)',
  'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #FB3640 0%, #f97316 100%)',
];

function DalleCard({ imageCreatedLabel }: { imageCreatedLabel: string }) {
  const [states, setStates] = useState<('loading' | 'done')[]>(['loading', 'loading', 'loading']);
  const [showTick, setShowTick] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStates(s => { const n = [...s]; n[0] = 'done'; return n; }), 800),
      setTimeout(() => setStates(s => { const n = [...s]; n[1] = 'done'; return n; }), 1400),
      setTimeout(() => setStates(s => { const n = [...s]; n[2] = 'done'; return n; }), 2000),
      setTimeout(() => setShowTick(true), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full mt-1">
      <div className="flex gap-2">
        {GRADIENTS.map((g, i) => (
          <div
            key={i}
            className="flex-1 h-14 rounded-lg overflow-hidden relative"
            style={{ background: states[i] === 'done' ? g : '#1a1a2e' }}
          >
            {states[i] === 'loading' && (
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.2s infinite',
                }}
              />
            )}
            {states[i] === 'done' && (
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/20" />
                <div className="absolute bottom-1 right-1 w-6 h-2 rounded-full bg-white/10" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-1.5 text-[10px]"
        style={{
          opacity: showTick ? 1 : 0,
          transition: 'opacity 0.6s ease',
          color: '#22c55e',
        }}
      >
        <span>✓</span>
        <span>{imageCreatedLabel}</span>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

const TELEGRAM_AGO: Record<string, string> = {
  uz: '2 daqiqa oldin',
  ru: '2 минуты назад',
  en: '2 minutes ago',
};
const TELEGRAM_MSG: Record<string, string> = {
  uz: '🔥 Yangi maqola: Toshkentda...',
  ru: '🔥 Новая статья: Стоматолог в Ташкенте...',
  en: '🔥 New article: Best dentist in Tashkent...',
};

// ── KARTA 4: Telegram ─────────────────────────────────────────────────────────
function TelegramCard({ locale }: { locale: string }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setViews(1247), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full mt-1">
      <div className="rounded-xl bg-[#17212B] border border-white/5 p-3 text-[10px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FB3640] to-[#7c3aed] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
            JB
          </div>
          <div>
            <div className="text-white font-semibold text-[10px]">JetBlog</div>
            <div className="text-white/30 text-[9px]">{TELEGRAM_AGO[locale] ?? TELEGRAM_AGO.uz}</div>
          </div>
        </div>
        <div className="text-white/80 leading-relaxed mb-2 min-h-[28px]">
          <TypingAnimation
            duration={60}
            className="text-[10px] leading-relaxed text-white/80"
            startOnView={false}
          >
            {TELEGRAM_MSG[locale] ?? TELEGRAM_MSG.uz}
          </TypingAnimation>
        </div>
        <div className="flex items-center justify-end gap-1 text-white/30 text-[9px]">
          <span>👁</span>
          {views > 0
            ? <NumberTicker value={views} className="text-white/40 text-[9px]" />
            : <span>0</span>
          }
        </div>
      </div>
    </div>
  );
}

// ── Small card wrapper ────────────────────────────────────────────────────────
interface SmallCardDef {
  name: string;
  description: string;
  emoji: string;
  Content: React.FC;
}

function SmallCard({ name, description, emoji, Content }: SmallCardDef) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col border bg-[#000F08] transition-all duration-300 h-full"
      style={{
        borderColor: hovered ? 'rgba(251,54,64,0.4)' : 'rgba(255,255,255,0.05)',
        boxShadow: hovered ? '0 0 20px rgba(251,54,64,0.15)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="p-2 rounded-xl text-base leading-none"
          style={{
            background: 'rgba(251,54,64,0.1)',
            border: '1px solid rgba(251,54,64,0.2)',
          }}
        >
          {emoji}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight">{name}</h3>
          <p className="text-[10px] text-white/60 leading-snug mt-0.5">{description}</p>
        </div>
      </div>
      <Content />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FeatureList() {
  const t = useTranslations('Landing');
  const locale = useLocale();

  const smallCards: SmallCardDef[] = [
    {
      emoji: '🔍',
      name: t('keywordsCardName'),
      description: t('keywordsCardDesc'),
      Content: () => <KeywordCard diffEasy={t('diffEasy')} diffMedium={t('diffMedium')} diffHard={t('diffHard')} locale={locale} />,
    },
    {
      emoji: '📅',
      name: t('schedulerCardName'),
      description: t('schedulerCardDesc'),
      Content: () => <SchedulerCard nextPublishLabel={t('nextPublish')} nextPublishDay={t('nextPublishDay')} locale={locale} />,
    },
    {
      emoji: '🎨',
      name: t('dalleCardName'),
      description: t('dalleCardDesc'),
      Content: () => <DalleCard imageCreatedLabel={t('imageCreated')} />,
    },
    {
      emoji: '✈️',
      name: t('telegramCardName'),
      description: t('telegramCardDesc'),
      Content: () => <TelegramCard locale={locale} />,
    },
  ];

  return (
    <section className="space-y-12 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">

      <ScrollReveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('featureTitle')}{' '}
            <span className="bg-gradient-to-r from-[#FB3640] to-[#FF8A8F] bg-clip-text text-transparent">
              {t('featureTitleHighlight')}
            </span>
          </h2>
          <p className="max-w-2xl text-zinc-400 text-base md:text-lg leading-relaxed">
            {t('featureDesc')}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay="200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[220px]">

          {/* ── LARGE CARD ── */}
          <div
            className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden border border-[#FB3640]/20 bg-[#000F08] transition-all duration-300 hover:border-[#FB3640]/60 group"
            style={{ boxShadow: '0 0 0 1px transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 20px rgba(251,54,64,0.15), 0 0 40px rgba(251,54,64,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px transparent';
            }}
          >
            <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/5">
              <div className="p-2 rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20">
                <Bot className="w-5 h-5 text-[#FB3640]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t('aiWriterName')}</h3>
                <p className="text-xs text-zinc-500">{t('aiWriterDesc')}</p>
              </div>
            </div>
            <div className="h-[calc(100%-76px)]">
              <TerminalMockup runningLabel={t('terminalRunning')} publishedLabel={t('terminalPublished')} locale={locale} />
            </div>
          </div>

          {/* ── SMALL CARDS ── */}
          {smallCards.map(card => (
            <div key={card.name} className="h-full">
              <SmallCard {...card} />
            </div>
          ))}

        </div>
      </ScrollReveal>
    </section>
  );
}
