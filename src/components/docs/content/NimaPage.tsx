import React from 'react';
import { Zap, Globe, Brain, BarChart2, Bell } from 'lucide-react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { Callout } from '../Callout';

const FEATURES = [
  { icon: <Brain className="w-5 h-5" />, title: 'Claude AI maqola yozadi', desc: 'Har bir maqola brand voice va SEO talablariga moslashtirilgan holda yoziladi.' },
  { icon: <Globe className="w-5 h-5" />, title: 'Ko\'p platforma', desc: 'WordPress, Ghost, Webflow yoki istalgan platformaga webhook orqali nashr qilish.' },
  { icon: <BarChart2 className="w-5 h-5" />, title: 'Kalit so\'z tahlili', desc: 'Search volume, difficulty va raqobat ma\'lumotlari avtomatik yuklanadi.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Autopilot', desc: 'Belgilangan vaqtda avtomatik nashr — siz hech narsa qilmasangiz ham ishlaydi.' },
  { icon: <Bell className="w-5 h-5" />, title: 'Telegram xabarnoma', desc: 'Har bir nashr qilingan maqola haqida Telegram kanalingizga xabar keladi.' },
];

export function NimaPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Hujjatlar"
        title="JetBlog nima?"
        description="JetBlog — WordPress, Ghost va boshqa platformalar uchun AI yordamida SEO maqolalarini avtomatik yaratuvchi va nashr qiluvchi SaaS xizmati."
      />

      <DocsH2>Asosiy imkoniyatlar</DocsH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="w-9 h-9 rounded-lg bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FB3640] flex items-center justify-center shrink-0">
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
              <p className="text-xs text-zinc-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <DocsH2>Qanday ishlaydi?</DocsH2>
      <DocsPara>
        JetBlog uchta asosiy bosqichda ishlaydi:
      </DocsPara>
      <ol className="space-y-3 mb-6">
        {[
          'Saytingizni uling — WordPress, Ghost, Webflow yoki Webhook orqali.',
          "Kalit so'zlarni qo'shing — JetBlog SEO ma'lumotlarini avtomatik oladi.",
          "Autopilotni yoqing — belgilangan jadvalda AI maqola yozib, saytingizga nashr qiladi.",
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="info" title="Boshlash uchun">
        5 daqiqada sozlash bo&apos;limiga o&apos;ting — birinchi maqolangizni juda tez yaratishingiz mumkin.
      </Callout>
    </div>
  );
}
