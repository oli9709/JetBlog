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

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'general',
    title: 'Umumiy',
    icon: HelpCircle,
    items: [
      {
        id: 'g1',
        question: 'JetBlog nima va kimlar uchun?',
        answer:
          "JetBlog — AI yordamida SEO maqolalar yozib, avtomatik saytga publish qiladigan platforma. Bloggerlar, raqamli marketing agentliklari va ko'p saytli bizneslar uchun mo'ljallangan. Siz faqat kalit so'zlarni kiritasiz — qolganini JetBlog avtomatik bajaradi.",
      },
      {
        id: 'g2',
        question: "Bepul plan bilan nimalarga ega bo'laman?",
        answer:
          "Bepul planda: 1 ta sayt ulanishi, oyiga 10 ta kalit so'z tahlili, 2 ta maqola generatsiyasi. Kredit tugaganida generatsiya to'xtatiladi, lekin saytingiz va ma'lumotlaringiz o'chirilmaydi.",
      },
      {
        id: 'g3',
        question: 'AI qanday maqola yozadi?',
        answer:
          "Kalit so'zni kiritasiz → Claude (Anthropic) SEO optimallashtirilgan, insoniy ohangli maqola yozadi → DALL-E 3 muqova rasm yaratadi → avtomatik saytingizga publish bo'ladi. Brand voice sozlasangiz, maqola uslubi va ohangi to'liq saytingiznikiga moslashadi.",
      },
      {
        id: 'g4',
        question: "Maqola sifati yaxshimi?",
        answer:
          "Anthropic Claude Sonnet modeli ishlatiladi — eng yuqori sifatli AI modellardan biri. Brand voice sozlasangiz, ovoz va uslub to'liq siznikiga moslashadi. Har bir maqolani nashr oldidan TipTap editor da ko'rib chiqib, tahrirlash imkoni ham mavjud.",
      },
      {
        id: 'g5',
        question: 'Bir maqola necha kredit sarflaydi?',
        answer:
          "Har bir maqola generatsiyasi 1 kredit sarflaydi. Kredit miqdori tanlagan plangizga bog'liq. Kredit tugaganida qo'shimcha kredit sotib olish yoki planningizni yangilash mumkin.",
      },
      {
        id: 'g6',
        question: "Kredit muddati bormi?",
        answer:
          "Yo'q. Qo'shimcha sotib olingan kreditlar muddatsiz saqlanadi. Faqat oylik plan kreditlari (har oygi limit) keyingi oyga o'tkazilmaydi.",
      },
      {
        id: 'g7',
        question: "Ma'lumotlarim xavfsizmi?",
        answer:
          "Ha. WordPress Application Password va boshqa maxfiy kalitlar AES-256-GCM shifrlash bilan saqlanadi. Hech qanday parol ochiq (plain text) holda bazaga tushmaydi. Supabase Row Level Security barcha foydalanuvchi ma'lumotlarini himoya qiladi.",
      },
      {
        id: 'g8',
        question: "Qo'llab-quvvatlash qanday ishlaydi?",
        answer:
          "Telegram orqali: Dashboard → Settings → Support bo'limida Telegram havolasi bor. Odatda 1 ish kuni ichida javob beriladi.",
      },
    ],
  },
  {
    id: 'platforms',
    title: 'Platformalar',
    icon: Globe,
    items: [
      {
        id: 'p1',
        question: 'Qaysi platformalar bilan ishlaydi?',
        answer:
          "WordPress, Ghost CMS, Webflow, va webhook orqali istalgan boshqa platforma (Next.js, Nuxt, Laravel, va h.k.). Har bir sayt uchun alohida platforma tanlash mumkin.",
      },
      {
        id: 'p2',
        question: 'WordPress qanday ulanadi?',
        answer:
          "WP Admin → Users → Profile (yoki Your Profile) → pastga scroll → Application Passwords → yangi parol yarating. JetBlog Connections da URL, username va application password kiriting → Test connection.",
      },
      {
        id: 'p3',
        question: 'WordPress Application Password nima?',
        answer:
          "WordPress 5.6 dan beri mavjud xavfsiz API autentifikatsiya usuli. Asosiy admin parolingizdan to'liq alohida — faqat API so'rovlari uchun ishlaydi. Istalgan vaqt WP paneldan bir zumda o'chirib tashlanadi.",
      },
      {
        id: 'p4',
        question: 'Ghost CMS qanday ulanadi?',
        answer:
          "Ghost Dashboard → Settings → Integrations → Add custom integration → nom bering (masalan: JetBlog) → Admin API Key ni nusxalab oling. JetBlog da Ghost platformasini tanlang, Ghost URL va Admin API Key kiriting.",
      },
      {
        id: 'p5',
        question: "Webflow bilan ishlash uchun nima kerak?",
        answer:
          "Webflow Starter plan ($14/oy) yoki undan yuqori talab qilinadi — bepul plan CMS API ni qo'llab-quvvatlamaydi. API token: Project Settings → Integrations → API Access. Collection ID: CMS → Collections → URL dagi ID.",
      },
      {
        id: 'p6',
        question: 'Custom sayt (Next.js, Nuxt, Laravel...) ulash mumkinmi?',
        answer:
          "Ha. Webhook usuli bilan istalgan texnologiya ishlaydi. Saytingizga 20 qatorlik kod qo'shiladi — maqola avtomatik keladi. Node.js, PHP va Python uchun tayyor misollar /docs/webhook sahifasida.",
      },
      {
        id: 'p7',
        question: "Webhook xavfsizligi qanday ta'minlanadi?",
        answer:
          "Har bir so'rovda HMAC-SHA256 imzosi yuboriladi (X-JetBlog-Signature header). Saytingiz imzoni tekshiradi — buzilgan yoki soxta so'rov rad etiladi. Secret key faqat siz va JetBlog biladi.",
      },
      {
        id: 'p8',
        question: "Bir accountda nechta platforma ulab bo'ladi?",
        answer:
          "Har bir sayt alohida platforma bo'lishi mumkin. Masalan: 1-sayt WordPress, 2-sayt Ghost, 3-sayt Webhook. Planningizga qarab sayt soni cheklanadi.",
      },
      {
        id: 'p9',
        question: "Maqola Webflow da qayerga publish bo'ladi?",
        answer:
          "Siz ko'rsatgan CMS Collection ga. Collection ID ni connection sozlamalarida kiritasiz. JetBlog name (sarlavha), slug va kontent maydonlarini to'ldiradi.",
      },
      {
        id: 'p10',
        question: "Sayt URL o'zgarganda nima qilish kerak?",
        answer:
          "Connections sahifasida sayt kartasini oching → Edit → yangi URL saqlang → Test connection. Eski URL bilan bog'liq maqolalar o'zgarmaydi.",
      },
    ],
  },
  {
    id: 'billing',
    title: 'Kredit va narxlar',
    icon: CreditCard,
    items: [
      {
        id: 'b1',
        question: 'Kredit va plan farqi nima?',
        answer:
          "Plan — oylik limit (maqola soni, sayt soni, kalit so'z soni). Kredit — plan limitidan tashqari qo'shimcha maqola uchun alohida sotib olinadigan birlik. Plan limiti tugasa, kredit sotib olib davom ettirish mumkin.",
      },
      {
        id: 'b2',
        question: "Plan yangilashda kredit yo'qolmaydimi?",
        answer:
          "Yo'q. Qo'shimcha sotib olingan kreditlar planli yangilashda saqlanib qoladi. Yangi plan limiti saqlab qolingan kreditlar ustiga qo'shiladi.",
      },
      {
        id: 'b3',
        question: "Oylik limit tugasa nima bo'ladi?",
        answer:
          "Maqola generatsiyasi avtomatik to'xtatiladi. Ikki variantingiz bor: qo'shimcha kredit sotib olish (Settings → Billing) yoki keyingi oy boshini kutish (limit yangilanadi).",
      },
      {
        id: 'b4',
        question: "Agentlik planida nechta foydalanuvchi bo'ladi?",
        answer:
          "Hozircha 1 foydalanuvchi. Ko'p foydalanuvchi (team members) funksiyasi ishlanmoqda va yaqinda chiqariladi.",
      },
      {
        id: 'b5',
        question: "To'lov usullari qaysilar?",
        answer:
          "Hozirda: Visa va Mastercard karta. Kelgusida: kriptovalyuta va bank o'tkazmasi qo'shiladi.",
      },
      {
        id: 'b6',
        question: "Pul qaytarib beriladi?",
        answer:
          "Ha, 14 kun ichida, hech qanday maqola generate qilinmagan bo'lsa to'liq pul qaytariladi. support@jetblog.app ga yozing.",
      },
    ],
  },
  {
    id: 'technical',
    title: 'Texnik',
    icon: Code2,
    items: [
      {
        id: 't1',
        question: 'Generatsiya qancha vaqt oladi?',
        answer:
          "Odatda 30–90 soniya. Uzun maqolalar (3000+ so'z) 2 daqiqagacha olishi mumkin. Generatsiya davomida sahifani yopmasligingiz kerak.",
      },
      {
        id: 't2',
        question: "Rasmlar avtomatik qo'shiladi?",
        answer:
          "Ha. Har bir maqola uchun DALL-E 3 maqola mavzusiga mos, unikal featured image yaratadi. Rasm WordPress/Ghost/Webflow ga yuklanadi va maqolaga biriktiriladi.",
      },
      {
        id: 't3',
        question: "Maqolani nashr oldidan tahrir qilsa bo'ladimi?",
        answer:
          "Ha. Content Queue sahifasida maqolani oching → TipTap editor da tahrirlang → Publish tugmasini bosing. Maqola draft holatda qoladi, siz tayyor bo'lguncha nashr qilinmaydi.",
      },
      {
        id: 't4',
        question: "Avtomatik jadval qanday ishlaydi?",
        answer:
          "Sayt sozlamalarida publish_days (nashr kunlari) va publish_time (vaqt, UTC da) belgilaysiz. CRON har kuni tekshiradi — vaqti kelgan maqolalarni avtomatik publish qiladi. Autopilot faol bo'lishi kerak.",
      },
      {
        id: 't5',
        question: "Google Search Console nima uchun kerak?",
        answer:
          "GSC ulantirilsa, saytingizning real qidiruv ma'lumotlari (kalit so'zlar, kliklar, pozitsiya) asosida maqola tavsiyalari beriladi. Ixtiyoriy, lekin tavsiya etiladi — real ma'lumotlarga asoslangan maqolalar ko'proq traffic keltiradi.",
      },
      {
        id: 't6',
        question: "API orqali integratsiya qilsa bo'ladimi?",
        answer:
          "Ha. JetBlog API Supabase JWT token orqali ishlaydi. To'liq endpoint ma'lumotnomasi /docs/api-endpoints sahifasida. Hozircha faqat autentifikatsiya qilingan foydalanuvchilar uchun, tashqi API key kelgusida qo'shiladi.",
      },
    ],
  },
];

export function getAllFAQItems(): FAQItem[] {
  return FAQ_CATEGORIES.flatMap((cat) => cat.items);
}
