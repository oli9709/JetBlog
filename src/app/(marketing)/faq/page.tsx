'use client';

import { HelpCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';

const faqs = [
  { 
    question: 'JetBlog nima va u qanday ishlaydi?', 
    answer: 'JetBlog - bu sun\'iy intellekt orqali kalit so\'zlarni tahlil qilish, Claude 3.5 Sonnet yordamida original maqolalar yozish va WordPress saytingizga avtomatik ravishda rasm va anonslar bilan birga nashr qilish tizimidir. Tizim to\'liq avtopilot rejimida ishlaydi.' 
  },
  { 
    question: 'WordPress saytimni qanday ulayman?', 
    answer: 'WordPress admin panelingizda Users (Foydalanuvchilar) -> Profile (Profil) bo\'limiga o\'ting. Sahifaning eng pastki qismida "Application Passwords" bo\'limini topasiz. U yerda yangi nom kiriting (masalan: JetBlog) va yaratilgan 24 xonali parolni bizning Connections bo\'limimizga sayt havolasi va foydalanuvchi nomi bilan birga kiriting.' 
  },
  { 
    question: 'Application Password ulash mutlaqo xavfsizmi?', 
    answer: 'Ha, mutlaqo xavfsiz! Application Password faqatgina REST API orqali maqola yozish va tahrirlash imkonini beradi, u sizning asosiy admin parolingiz emas. Siz uni istalgan vaqtda WordPress panelingizdan bir zumda bekor qilishingiz (delete) mumkin. Qo\'shimcha ravishda barcha ma\'lumotlar ma\'lumotlar bazamizda AES-256 shifrlangan holda saqlanadi.' 
  },
  { 
    question: 'Claude 3.5 Sonnet modeli matnlarni qay darajada sifatli yozadi?', 
    answer: 'Claude 3.5 Sonnet eng so\'nggi va eng aqlli sun\'iy intellekt modellaridan biridir. U o\'zbek tilida mutlaqo tabiiy, qiziqarli, imlo xatolarisiz va o\'quvchini jalb qiluvchi ohangda maqolalar yozadi. Maqolalar H2, H3 sarlavhalari, ro\'yxatlar va jadvallar bilan boyitiladi.' 
  },
  { 
    question: 'Maqola uchun muqova rasmlari qayerdan olinadi?', 
    answer: 'Tizim har bir maqola mazmuni va sarlavhasidan kelib chiqib, OpenAI DALL-E 3 modeli orqali mutlaqo original, premium sifatli muqova rasmini (featured image) avtomatik generatsiya qiladi. Bu rasmlar mutlaqo mualliflik huquqidan xoli bo\'lib, saytingiz jozibasini oshiradi.' 
  },
  { 
    question: 'Telegram kanalda avto-anons qanday amalga oshiriladi?', 
    answer: 'WordPress saytingizga har bir yangi maqola muvaffaqiyatli nashr qilinganidan so\'ng, tizim avtomatik ravishda maqolaning chiroyli qisqacha mazmuni va havolasini siz ulagan Telegram kanaliga rasm bilan birga anons tariqasida yuboradi.' 
  },
  { 
    question: 'To\'lovlar va hisobni to\'ldirish qanday amalga oshiriladi?', 
    answer: 'JetBlog-da manual Billing tizimi mavjud. Billing sahifasida o\'zingizga mos bo\'lgan to\'ldirish paketini tanlaysiz, hisob-faktura (invoice) PDF-ni yuklab olasiz va to\'lovni amalga oshirganingizdan so\'ng credits bir zumda hisobingizga kelib tushadi. Har bir maqola generatsiyasi 1 ta credit sarflaydi.' 
  }
];

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-900 py-4 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left py-2 group"
      >
        <span className="font-bold text-sm md:text-md text-zinc-100 group-hover:text-white transition-colors flex items-center gap-3">
          <HelpCircle className={cn("w-4.5 h-4.5 text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0")} />
          {question}
        </span>
        <ChevronRight className={cn("w-4 h-4 text-zinc-500 group-hover:text-white transition-transform duration-300 shrink-0", isOpen && "rotate-90 text-indigo-400")} />
      </button>
      <div 
        className={cn(
          "grid transition-all duration-300 overflow-hidden text-xs md:text-sm text-zinc-400 leading-relaxed",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-2 pb-2" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden pl-7">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQs() {
  return (
    <div className="relative overflow-hidden pt-12 pb-24">
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none opacity-20 blur-[100px] bg-indigo-500 rounded-full -z-10" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Title */}
        <div className="mx-auto flex w-full flex-col gap-4 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-bold uppercase w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5" /> Savollar va Javoblar
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ko'p Beriladigan{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Savollar
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-400 text-sm leading-relaxed">
            Platforma haqida eng muhim va ko'p so'raladigan savollarga javob toping. Savolingizga javob topa olmasangiz, biz bilan bog'laning.
          </p>
        </div>

        {/* FAQs List */}
        <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          {faqs.map((faq, idx) => (
            <FaqItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>

      </section>
    </div>
  );
}
