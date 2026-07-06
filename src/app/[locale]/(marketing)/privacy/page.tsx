import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy — JetBlog',
};

const THIRD_PARTIES: Record<string, { name: string; desc: string; link: string }[]> = {
  uz: [
    { name: 'Supabase', desc: 'Ma\'lumotlar bazasi va autentifikatsiya', link: 'https://supabase.com/privacy' },
    { name: 'Anthropic (Claude AI)', desc: 'Maqola generatsiya', link: 'https://www.anthropic.com/privacy' },
    { name: 'OpenAI (DALL-E 3)', desc: 'Muqova rasmlar yaratish', link: 'https://openai.com/privacy' },
    { name: 'Vercel', desc: 'Hosting va deployment', link: 'https://vercel.com/legal/privacy-policy' },
  ],
  ru: [
    { name: 'Supabase', desc: 'База данных и аутентификация', link: 'https://supabase.com/privacy' },
    { name: 'Anthropic (Claude AI)', desc: 'Генерация статей', link: 'https://www.anthropic.com/privacy' },
    { name: 'OpenAI (DALL-E 3)', desc: 'Создание обложек', link: 'https://openai.com/privacy' },
    { name: 'Vercel', desc: 'Хостинг и деплой', link: 'https://vercel.com/legal/privacy-policy' },
  ],
  en: [
    { name: 'Supabase', desc: 'Database and authentication', link: 'https://supabase.com/privacy' },
    { name: 'Anthropic (Claude AI)', desc: 'Article generation', link: 'https://www.anthropic.com/privacy' },
    { name: 'OpenAI (DALL-E 3)', desc: 'Cover image creation', link: 'https://openai.com/privacy' },
    { name: 'Vercel', desc: 'Hosting and deployment', link: 'https://vercel.com/legal/privacy-policy' },
  ],
};

const CONTENT: Record<string, {
  lastUpdated: string;
  sections: { title: string; body?: string; list?: string[]; note?: string; cookies?: { name: string; desc: string }[] }[];
  contactLabel: string;
  noSell: string;
  noCookieTracking: string;
}> = {
  uz: {
    lastUpdated: "So'nggi yangilanish: 22 May 2026",
    contactLabel: 'JetBlog Support',
    noSell: 'Biz sizning ma\'lumotlaringizni hech qachon uchinchi tomonlarga sotmaymiz.',
    noCookieTracking: 'Reklama yoki tracking cookie ishlatilmaydi.',
    sections: [
      {
        title: '1. Ma\'lumot Yig\'ish',
        body: 'JetBlog.app xizmatidan foydalanish jarayonida biz quyidagi ma\'lumotlarni yig\'amiz:',
        list: [
          'Email manzil — ro\'yxatdan o\'tish va tizimga kirish uchun',
          'WordPress sayt URL — integratsiya uchun',
          'WordPress Application Password — AES-256-GCM bilan shifrlangan holda saqlanadi',
          'Kalit so\'zlar va maqolalar — xizmat funksionalligi uchun',
          'Foydalanish statistikasi — xizmatni yaxshilash uchun',
        ],
      },
      {
        title: '2. Ma\'lumotdan Foydalanish',
        body: 'Yig\'ilgan ma\'lumotlar faqat quyidagi maqsadlarda ishlatiladi:',
        list: [
          'AI orqali SEO maqolalar yaratish va WordPress ga yuklash',
          'Hisob va obuna boshqaruvi',
          'Texnik qo\'llab-quvvatlash va muammo hal qilish',
          'Xizmat yangiliklari haqida xabar berish (faqat rozi bo\'lganlar uchun)',
        ],
      },
      { title: '3. Uchinchi Tomon Xizmatlar', body: 'JetBlog quyidagi uchinchi tomon xizmatlardan foydalanadi:' },
      {
        title: '4. Cookie Policy',
        body: 'Biz minimal miqdorda cookie fayllardan foydalanamiz:',
        cookies: [
          { name: 'Sessiya cookie', desc: 'tizimga kirishni saqlash uchun (Supabase auth token)' },
          { name: 'Preference cookie', desc: 'til va tema sozlamalarini saqlash uchun' },
        ],
      },
      {
        title: '5. Ma\'lumot Xavfsizligi',
        body: 'Sizning ma\'lumotlaringiz himoyalash uchun:',
        list: [
          'WordPress parollar AES-256-GCM bilan shifrlangan',
          'Barcha aloqa HTTPS/TLS orqali amalga oshiriladi',
          'Ma\'lumotlar bazasi Row Level Security (RLS) bilan himoyalangan',
          'Supabase SOC 2 Type II sertifikatiga ega',
        ],
      },
      {
        title: '6. Foydalanuvchi Huquqlari',
        body: 'Siz quyidagi huquqlarga egasiz:',
        list: [
          'O\'z ma\'lumotlaringizga kirish va ko\'rish',
          'Noto\'g\'ri ma\'lumotlarni tahrirlash',
          'Hisobingizni va barcha ma\'lumotlarni o\'chirish',
          'Ma\'lumotlarni eksport qilish (JSON formatida)',
        ],
        note: 'Ushbu huquqlardan foydalanish uchun support@jetblog.app ga murojaat qiling.',
      },
      {
        title: '7. Ma\'lumotlarni Saqlash Muddati',
        body: 'Ma\'lumotlaringiz hisob faol ekan saqlanadi. Hisob o\'chirilganda barcha ma\'lumotlar 30 kun ichida butunlay o\'chiriladi.',
      },
      { title: '8. Aloqa', body: '' },
    ],
  },
  ru: {
    lastUpdated: 'Последнее обновление: 22 мая 2026 г.',
    contactLabel: 'Поддержка JetBlog',
    noSell: 'Мы никогда не продаём ваши данные третьим лицам.',
    noCookieTracking: 'Рекламные и трекинговые cookie не используются.',
    sections: [
      {
        title: '1. Сбор данных',
        body: 'При использовании JetBlog.app мы собираем следующие данные:',
        list: [
          'Email-адрес — для регистрации и входа в систему',
          'URL сайта WordPress — для интеграции',
          'WordPress Application Password — хранится в зашифрованном виде (AES-256-GCM)',
          'Ключевые слова и статьи — для функционирования сервиса',
          'Статистика использования — для улучшения сервиса',
        ],
      },
      {
        title: '2. Использование данных',
        body: 'Собранные данные используются исключительно для:',
        list: [
          'Создания SEO-статей с помощью ИИ и загрузки в WordPress',
          'Управления аккаунтом и подпиской',
          'Технической поддержки и решения проблем',
          'Уведомлений о новостях сервиса (только для давших согласие)',
        ],
      },
      { title: '3. Сторонние сервисы', body: 'JetBlog использует следующие сторонние сервисы:' },
      {
        title: '4. Политика cookies',
        body: 'Мы используем минимальное количество cookie-файлов:',
        cookies: [
          { name: 'Сессионные cookie', desc: 'для сохранения сессии входа (токен Supabase auth)' },
          { name: 'Preference cookie', desc: 'для сохранения языковых и тематических настроек' },
        ],
      },
      {
        title: '5. Безопасность данных',
        body: 'Для защиты ваших данных:',
        list: [
          'Пароли WordPress зашифрованы с помощью AES-256-GCM',
          'Все соединения осуществляются через HTTPS/TLS',
          'База данных защищена с помощью Row Level Security (RLS)',
          'Supabase имеет сертификат SOC 2 Type II',
        ],
      },
      {
        title: '6. Права пользователя',
        body: 'Вы имеете право:',
        list: [
          'Получать доступ к своим данным и просматривать их',
          'Исправлять неточные данные',
          'Удалить аккаунт и все данные',
          'Экспортировать данные (в формате JSON)',
        ],
        note: 'Для реализации этих прав обращайтесь на support@jetblog.app.',
      },
      {
        title: '7. Срок хранения данных',
        body: 'Ваши данные хранятся, пока аккаунт активен. После удаления аккаунта все данные полностью уничтожаются в течение 30 дней.',
      },
      { title: '8. Контакты', body: '' },
    ],
  },
  en: {
    lastUpdated: 'Last updated: 22 May 2026',
    contactLabel: 'JetBlog Support',
    noSell: 'We never sell your data to third parties.',
    noCookieTracking: 'No advertising or tracking cookies are used.',
    sections: [
      {
        title: '1. Data Collection',
        body: 'While using JetBlog.app we collect the following data:',
        list: [
          'Email address — for registration and login',
          'WordPress site URL — for integration',
          'WordPress Application Password — stored encrypted with AES-256-GCM',
          'Keywords and articles — for service functionality',
          'Usage statistics — for service improvement',
        ],
      },
      {
        title: '2. Use of Data',
        body: 'Collected data is used only for:',
        list: [
          'Creating SEO articles with AI and uploading to WordPress',
          'Account and subscription management',
          'Technical support and troubleshooting',
          'Service update notifications (only for those who consented)',
        ],
      },
      { title: '3. Third-Party Services', body: 'JetBlog uses the following third-party services:' },
      {
        title: '4. Cookie Policy',
        body: 'We use a minimal number of cookies:',
        cookies: [
          { name: 'Session cookie', desc: 'to maintain login session (Supabase auth token)' },
          { name: 'Preference cookie', desc: 'to save language and theme settings' },
        ],
      },
      {
        title: '5. Data Security',
        body: 'To protect your data:',
        list: [
          'WordPress passwords are encrypted with AES-256-GCM',
          'All communication is via HTTPS/TLS',
          'Database is protected with Row Level Security (RLS)',
          'Supabase holds SOC 2 Type II certification',
        ],
      },
      {
        title: '6. User Rights',
        body: 'You have the right to:',
        list: [
          'Access and view your data',
          'Correct inaccurate data',
          'Delete your account and all data',
          'Export your data (in JSON format)',
        ],
        note: 'To exercise these rights contact support@jetblog.app.',
      },
      {
        title: '7. Data Retention',
        body: 'Your data is retained while your account is active. When the account is deleted, all data is permanently erased within 30 days.',
      },
      { title: '8. Contact', body: '' },
    ],
  },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const c = CONTENT[locale] ?? CONTENT.uz;
  const parties = THIRD_PARTIES[locale] ?? THIRD_PARTIES.uz;

  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">{c.lastUpdated}</p>
        </div>
        <div className="space-y-10 text-zinc-400 leading-relaxed">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-white mb-3">{s.title}</h2>
              {s.body && <p>{s.body}</p>}
              {s.list && (
                <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.title.startsWith('3') && (
                <div className="mt-4 space-y-3">
                  {parties.map((svc) => (
                    <div key={svc.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FB3640] mt-2 shrink-0" />
                      <div>
                        <span className="text-white font-semibold text-sm">{svc.name}</span>
                        <span className="text-zinc-500 text-sm"> — {svc.desc}. </span>
                        <a href={svc.link} target="_blank" rel="noopener noreferrer" className="text-[#FB3640] text-xs hover:underline">Privacy Policy ↗</a>
                      </div>
                    </div>
                  ))}
                  <p className="mt-3 text-sm">{c.noSell}</p>
                </div>
              )}
              {s.cookies && (
                <>
                  <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
                    {s.cookies.map((ck) => (
                      <li key={ck.name}><span className="text-zinc-300">{ck.name}</span> — {ck.desc}</li>
                    ))}
                  </ul>
                  <p className="mt-3">{c.noCookieTracking}</p>
                </>
              )}
              {s.note && <p className="mt-3">{s.note}</p>}
              {s.title.startsWith('8') && (
                <div className="mt-3 p-4 rounded-xl bg-[#FB3640]/8 border border-[#FB3640]/20">
                  <p className="text-white font-semibold">{c.contactLabel}</p>
                  <a href="mailto:support@jetblog.app" className="text-[#FB3640] text-sm hover:underline">support@jetblog.app</a>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
