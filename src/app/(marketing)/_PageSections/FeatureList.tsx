import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid';
import { Bot, Globe, Key, Send, ImageIcon, Calendar } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const features = [
  {
    Icon: Bot,
    name: "AI Yozuvchi",
    description: "Sun'iy intellekt orqali to'liq original, SEO-optimallashtirilgan sarlavha va maqola matnlarini noldan yaratish.",
    href: "/",
    cta: "Batafsil ma'lumot",
    background: <div className="absolute inset-0 bg-zinc-950/20 mix-blend-overlay transition-all duration-300 group-hover:bg-[#FB3640]/10 pointer-events-none" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-3",
  },
  {
    Icon: Key,
    name: "Kalit So'zlar",
    description: "Kalit so'zlarning qidiruv hajmi va raqobat darajasini DataForSEO orqali tahlil qiling.",
    href: "/",
    cta: "Batafsil ma'lumot",
    background: <div className="absolute inset-0 bg-zinc-950/20 mix-blend-overlay transition-all duration-300 group-hover:bg-[#FB3640]/10 pointer-events-none" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Calendar,
    name: "Smart Scheduler",
    description: "Haftaning qaysi kunlari va soatlarida nashr qilish jadvalini oson tanlang.",
    href: "/",
    cta: "Batafsil ma'lumot",
    background: <div className="absolute inset-0 bg-zinc-950/20 mix-blend-overlay transition-all duration-300 group-hover:bg-cyan-500/10 pointer-events-none" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: ImageIcon,
    name: "DALL-E 3 Cover Art",
    description: "Har bir maqola uchun mavzuga mos premium sifatli muqova rasmlarini avtomatik yaratish.",
    href: "/",
    cta: "Batafsil ma'lumot",
    background: <div className="absolute inset-0 bg-zinc-950/20 mix-blend-overlay transition-all duration-300 group-hover:bg-emerald-500/10 pointer-events-none" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-4 lg:row-end-5",
  },
  {
    Icon: Send,
    name: "Telegram Kanallari",
    description: "Yangi nashr qilingan maqolani avtomatik rasm va havola bilan Telegramga yo'llang.",
    href: "/",
    cta: "Batafsil ma'lumot",
    background: <div className="absolute inset-0 bg-zinc-950/20 mix-blend-overlay transition-all duration-300 group-hover:bg-rose-500/10 pointer-events-none" />,
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-4 lg:row-end-5",
  },
];

export default function FeatureList() {
  return (
    <section className="space-y-12 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Sarlavha qismi */}
      <ScrollReveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Saytingiz o'sishi uchun{' '}
            <span className="bg-gradient-to-r from-[#FB3640] to-[#FF8A8F] bg-clip-text text-transparent">
              Cheksiz Imkoniyatlar
            </span>
          </h2>
          <p className="max-w-2xl text-zinc-400 text-base md:text-lg leading-relaxed">
            Sizning WordPress saytingiz uchun to'liq yopiq tsiklli (closed-loop) avtomatlashtirilgan SEO va maqola yozish tizimi.
          </p>
        </div>
      </ScrollReveal>

      {/* Bento Grid */}
      <ScrollReveal delay="200">
        <BentoGrid className="lg:grid-rows-4 mx-auto max-w-5xl">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </ScrollReveal>

    </section>
  );
}
