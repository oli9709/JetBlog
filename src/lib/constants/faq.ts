import { HelpCircle, Globe, CreditCard, Code2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  items: FAQItem[];
}

// Translations are passed in from the component via useTranslations('Faq')
// This factory builds locale-aware FAQ_CATEGORIES from translation strings.
// t must be the result of useTranslations('Faq').
export function buildFAQCategories(t: (key: string) => string): FAQCategory[] {
  return [
    {
      id: 'general',
      title: t('catGeneral'),
      icon: HelpCircle,
      items: [
        { id: 'g1', question: t('g1q'), answer: t('g1a') },
        { id: 'g2', question: t('g2q'), answer: t('g2a') },
        { id: 'g3', question: t('g3q'), answer: t('g3a') },
        { id: 'g4', question: t('g4q'), answer: t('g4a') },
        { id: 'g5', question: t('g5q'), answer: t('g5a') },
        { id: 'g6', question: t('g6q'), answer: t('g6a') },
        { id: 'g7', question: t('g7q'), answer: t('g7a') },
        { id: 'g8', question: t('g8q'), answer: t('g8a') },
      ],
    },
    {
      id: 'platforms',
      title: t('catPlatforms'),
      icon: Globe,
      items: [
        { id: 'p1', question: t('p1q'), answer: t('p1a') },
        { id: 'p2', question: t('p2q'), answer: t('p2a') },
        { id: 'p3', question: t('p3q'), answer: t('p3a') },
        { id: 'p4', question: t('p4q'), answer: t('p4a') },
        { id: 'p5', question: t('p5q'), answer: t('p5a') },
        { id: 'p6', question: t('p6q'), answer: t('p6a') },
        { id: 'p7', question: t('p7q'), answer: t('p7a') },
        { id: 'p8', question: t('p8q'), answer: t('p8a') },
        { id: 'p9', question: t('p9q'), answer: t('p9a') },
        { id: 'p10', question: t('p10q'), answer: t('p10a') },
      ],
    },
    {
      id: 'billing',
      title: t('catBilling'),
      icon: CreditCard,
      items: [
        { id: 'b1', question: t('b1q'), answer: t('b1a') },
        { id: 'b2', question: t('b2q'), answer: t('b2a') },
        { id: 'b3', question: t('b3q'), answer: t('b3a') },
        { id: 'b4', question: t('b4q'), answer: t('b4a') },
        { id: 'b5', question: t('b5q'), answer: t('b5a') },
        { id: 'b6', question: t('b6q'), answer: t('b6a') },
      ],
    },
    {
      id: 'technical',
      title: t('catTechnical'),
      icon: Code2,
      items: [
        { id: 't1', question: t('t1q'), answer: t('t1a') },
        { id: 't2', question: t('t2q'), answer: t('t2a') },
        { id: 't3', question: t('t3q'), answer: t('t3a') },
        { id: 't4', question: t('t4q'), answer: t('t4a') },
        { id: 't5', question: t('t5q'), answer: t('t5a') },
        { id: 't6', question: t('t6q'), answer: t('t6a') },
      ],
    },
  ];
}

// Kept for backwards compat (used in faq/page.tsx for JSON-LD)
// Falls back to Uzbek strings since it's only used for SEO schema
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'general',
    title: 'Umumiy',
    icon: HelpCircle,
    items: [
      { id: 'g1', question: 'JetBlog nima va kimlar uchun?', answer: "JetBlog — AI yordamida SEO maqolalar yozib, avtomatik saytga publish qiladigan platforma. Bloggerlar, raqamli marketing agentliklari va ko'p saytli bizneslar uchun mo'ljallangan." },
      { id: 'g2', question: "Bepul plan bilan nimalarga ega bo'laman?", answer: "Bepul planda: 1 ta sayt ulanishi, oyiga 10 ta kalit so'z tahlili, 2 ta maqola generatsiyasi." },
      { id: 'g3', question: 'AI qanday maqola yozadi?', answer: "Kalit so'zni kiritasiz → Claude (Anthropic) SEO optimallashtirilgan maqola yozadi → DALL-E 3 muqova rasm yaratadi → avtomatik saytingizga publish bo'ladi." },
      { id: 'g4', question: "Maqola sifati yaxshimi?", answer: "Anthropic Claude Sonnet modeli ishlatiladi — eng yuqori sifatli AI modellardan biri." },
      { id: 'g5', question: 'Bir maqola necha kredit sarflaydi?', answer: "Har bir maqola generatsiyasi 1 kredit sarflaydi." },
      { id: 'g6', question: "Kredit muddati bormi?", answer: "Yo'q. Qo'shimcha sotib olingan kreditlar muddatsiz saqlanadi." },
      { id: 'g7', question: "Ma'lumotlarim xavfsizmi?", answer: "Ha. WordPress Application Password va boshqa maxfiy kalitlar AES-256-GCM shifrlash bilan saqlanadi." },
      { id: 'g8', question: "Qo'llab-quvvatlash qanday ishlaydi?", answer: "Telegram orqali: Dashboard → Settings → Support bo'limida Telegram havolasi bor." },
    ],
  },
  {
    id: 'platforms',
    title: 'Platformalar',
    icon: Globe,
    items: [
      { id: 'p1', question: 'Qaysi platformalar bilan ishlaydi?', answer: "WordPress, Ghost CMS, Webflow, va webhook orqali istalgan boshqa platforma." },
      { id: 'p2', question: 'WordPress qanday ulanadi?', answer: "WP Admin → Users → Profile → Application Passwords → yangi parol yarating." },
      { id: 'p3', question: 'WordPress Application Password nima?', answer: "WordPress 5.6 dan beri mavjud xavfsiz API autentifikatsiya usuli." },
      { id: 'p4', question: 'Ghost CMS qanday ulanadi?', answer: "Ghost Dashboard → Settings → Integrations → Add custom integration → Admin API Key." },
      { id: 'p5', question: "Webflow bilan ishlash uchun nima kerak?", answer: "Webflow Starter plan ($14/oy) yoki undan yuqori talab qilinadi." },
      { id: 'p6', question: 'Custom sayt ulash mumkinmi?', answer: "Ha. Webhook usuli bilan istalgan texnologiya ishlaydi." },
      { id: 'p7', question: "Webhook xavfsizligi qanday ta'minlanadi?", answer: "Har bir so'rovda HMAC-SHA256 imzosi yuboriladi (X-JetBlog-Signature header)." },
      { id: 'p8', question: "Bir accountda nechta platforma ulab bo'ladi?", answer: "Har bir sayt alohida platforma bo'lishi mumkin." },
      { id: 'p9', question: "Maqola Webflow da qayerga publish bo'ladi?", answer: "Siz ko'rsatgan CMS Collection ga." },
      { id: 'p10', question: "Sayt URL o'zgarganda nima qilish kerak?", answer: "Connections sahifasida sayt kartasini oching → Edit → yangi URL saqlang → Test connection." },
    ],
  },
  {
    id: 'billing',
    title: 'Kredit va narxlar',
    icon: CreditCard,
    items: [
      { id: 'b1', question: 'Kredit va plan farqi nima?', answer: "Plan — oylik limit. Kredit — plan limitidan tashqari qo'shimcha maqola uchun alohida sotib olinadigan birlik." },
      { id: 'b2', question: "Plan yangilashda kredit yo'qolmaydimi?", answer: "Yo'q. Qo'shimcha sotib olingan kreditlar planli yangilashda saqlanib qoladi." },
      { id: 'b3', question: "Oylik limit tugasa nima bo'ladi?", answer: "Maqola generatsiyasi avtomatik to'xtatiladi." },
      { id: 'b4', question: "Agentlik planida nechta foydalanuvchi bo'ladi?", answer: "Hozircha 1 foydalanuvchi. Ko'p foydalanuvchi funksiyasi ishlanmoqda." },
      { id: 'b5', question: "To'lov usullari qaysilar?", answer: "Hozirda: Visa va Mastercard karta." },
      { id: 'b6', question: "Pul qaytarib beriladi?", answer: "Ha, 14 kun ichida, hech qanday maqola generate qilinmagan bo'lsa to'liq pul qaytariladi." },
    ],
  },
  {
    id: 'technical',
    title: 'Texnik',
    icon: Code2,
    items: [
      { id: 't1', question: 'Generatsiya qancha vaqt oladi?', answer: "Odatda 30–90 soniya." },
      { id: 't2', question: "Rasmlar avtomatik qo'shiladi?", answer: "Ha. Har bir maqola uchun DALL-E 3 unikal featured image yaratadi." },
      { id: 't3', question: "Maqolani nashr oldidan tahrir qilsa bo'ladimi?", answer: "Ha. Content Queue sahifasida maqolani TipTap editor da tahrirlang." },
      { id: 't4', question: "Avtomatik jadval qanday ishlaydi?", answer: "Sayt sozlamalarida publish_days va publish_time belgilaysiz. CRON har kuni tekshiradi." },
      { id: 't5', question: "Google Search Console nima uchun kerak?", answer: "GSC ulantirilsa, saytingizning real qidiruv ma'lumotlari asosida maqola tavsiyalari beriladi." },
      { id: 't6', question: "API orqali integratsiya qilsa bo'ladimi?", answer: "Ha. JetBlog API Supabase JWT token orqali ishlaydi." },
    ],
  },
];

export function getAllFAQItems(): FAQItem[] {
  return FAQ_CATEGORIES.flatMap((cat) => cat.items);
}
