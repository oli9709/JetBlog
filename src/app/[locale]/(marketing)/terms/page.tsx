import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms and Conditions — JetBlog',
};

const CONTENT: Record<string, {
  lastUpdated: string;
  sections: { title: string; body?: string; list?: string[]; subsections?: { title: string; body: string }[]; table?: { plan: string; sites: string; kw: string; articles: string }[]; note?: string }[];
  contactLabel: string;
}> = {
  uz: {
    lastUpdated: "So'nggi yangilanish: 22 May 2026 · O'zbekiston qonunchiligi asosida",
    contactLabel: 'JetBlog Support',
    sections: [
      {
        title: '1. Xizmatdan Foydalanish Shartlari',
        body: 'JetBlog.app ("Xizmat") dan foydalanish orqali siz ushbu shartlarni qabul qilasiz. Agar rozi bo\'lmasangiz, xizmatdan foydalanmang.',
        list: [
          'Foydalanuvchi kamida 18 yoshda bo\'lishi kerak',
          'Hisob ma\'lumotlari maxfiy saqlanishi shart',
          'Bitta foydalanuvchi faqat bitta hisob yuritishi mumkin',
          'Xizmat faqat qonuniy maqsadlarda ishlatilishi kerak',
        ],
      },
      {
        title: '2. Taqiqlangan Faoliyat',
        body: 'Quyidagi faoliyatlar qat\'iyan taqiqlanadi:',
        list: [
          'Spam, dezinformatsiya yoki zararli kontent yaratish',
          'Boshqa foydalanuvchilarning ma\'lumotlariga ruxsatsiz kirish',
          'Xizmatni reverse-engineer qilish yoki clone qilish',
          'API limitlarini chetlab o\'tish yoki bot orqali haddan ziyod so\'rov yuborish',
          'Muallif huquqini buzadigan kontent nashr etish',
        ],
      },
      {
        title: '3. To\'lov va Refund Siyosati',
        subsections: [
          { title: 'Kredit tizimi', body: 'JetBlog kredit asosida ishlaydi. Sotib olingan kreditlar qaytarilmaydi, lekin muddatsiz amal qiladi.' },
          { title: 'Refund', body: 'Texnik nosozlik sababli ishlatilmagan kreditlar uchun support@jetblog.app ga murojaat qiling. 7 kun ichida ko\'rib chiqiladi.' },
          { title: 'Narx o\'zgarishi', body: 'Narxlar 30 kun oldindan xabar berib o\'zgartirilishi mumkin. Oldindan sotib olingan kreditlarga ta\'sir qilmaydi.' },
        ],
      },
      {
        title: '4. Intellektual Mulk',
        body: 'JetBlog platformasi, uning kodi, dizayni va brendi JetBlog\'ga tegishli va himoyalangan. AI orqali yaratilgan maqolalar sizga tegishli — siz ularni istalgan maqsadda ishlata olasiz.',
        list: [
          'Boshqa shaxslarning muallif huquqini buzmasligi kerak',
          'O\'zbekiston qonunchiligi doirasida bo\'lishi kerak',
        ],
      },
      {
        title: '5. Xizmat Cheklovlari va SLA',
        table: [
          { plan: 'Free', sites: '1 sayt', kw: '10 kalit so\'z/oy', articles: '2 maqola/oy' },
          { plan: 'Starter', sites: '3 sayt', kw: '100 kalit so\'z/oy', articles: '20 maqola/oy' },
          { plan: 'Pro', sites: '10 sayt', kw: '500 kalit so\'z/oy', articles: '80 maqola/oy' },
          { plan: 'Agency', sites: 'Cheksiz', kw: 'Cheksiz', articles: '200 maqola/oy' },
        ],
        note: 'Biz 99% uptime ga intilamiz, lekin kafolatlamaymiz. Rejalangan texnik ishlar oldindan e\'lon qilinadi.',
      },
      {
        title: '6. Javobgarlik Chegarasi',
        body: 'JetBlog quyidagilar uchun javobgar emas:',
        list: [
          'AI tomonidan yaratilgan kontentning aniqligi yoki SEO samarasi',
          'WordPress saytingizda yuzaga kelishi mumkin bo\'lgan muammolar',
          'Uchinchi tomon API (Anthropic, OpenAI) ishlamay qolishi',
          'Bilvosita yo\'qotishlar yoki daromad kamayi',
        ],
        note: 'Maksimal javobgarlik chegara — oxirgi 3 oy ichida to\'langan miqdor.',
      },
      {
        title: '7. Hisob O\'chirish',
        body: 'Siz istalgan vaqt hisobingizni o\'chirishingiz mumkin. O\'chirishdan so\'ng:',
        list: [
          'Barcha ma\'lumotlar 30 kun ichida yo\'q qilinadi',
          'WordPress integratsiya avtomatik uziladi',
          'Qolgan kreditlar qaytarilmaydi',
        ],
        note: 'JetBlog ham ushbu shartlarni buzgan foydalanuvchilarning hisobini ogohlantirmasdan o\'chirish huquqini saqlab qoladi.',
      },
      {
        title: '8. Qonunchilik va Jurisdiksiya',
        body: 'Ushbu shartlar O\'zbekiston Respublikasi qonunchiligi asosida tartibga solinadi. Nizolar avvalo muzokaralar orqali hal etiladi. Kerak bo\'lsa — Toshkent shahar sudlari orqali.',
      },
      {
        title: '9. O\'zgarishlar',
        body: 'Biz ushbu shartlarni istalgan vaqt yangilashimiz mumkin. Muhim o\'zgarishlar haqida email orqali xabar beriladi. Xizmatdan foydalanishni davom ettirish yangi shartlarni qabul qilish deb hisoblanadi.',
      },
      { title: '10. Aloqa', body: '' },
    ],
  },
  ru: {
    lastUpdated: 'Последнее обновление: 22 мая 2026 г. · На основании законодательства Узбекистана',
    contactLabel: 'Поддержка JetBlog',
    sections: [
      {
        title: '1. Условия использования',
        body: 'Используя JetBlog.app («Сервис»), вы принимаете настоящие условия. Если вы не согласны — не используйте сервис.',
        list: [
          'Пользователю должно быть не менее 18 лет',
          'Учётные данные должны храниться в тайне',
          'Один пользователь — только один аккаунт',
          'Сервис должен использоваться исключительно в законных целях',
        ],
      },
      {
        title: '2. Запрещённая деятельность',
        body: 'Следующие действия строго запрещены:',
        list: [
          'Создание спама, дезинформации или вредоносного контента',
          'Несанкционированный доступ к данным других пользователей',
          'Reverse-engineering или клонирование сервиса',
          'Обход лимитов API или чрезмерные запросы через ботов',
          'Публикация контента, нарушающего авторские права',
        ],
      },
      {
        title: '3. Оплата и политика возврата',
        subsections: [
          { title: 'Система кредитов', body: 'JetBlog работает на основе кредитов. Купленные кредиты не возвращаются, но действуют бессрочно.' },
          { title: 'Возврат средств', body: 'По вопросам неиспользованных кредитов из-за технической ошибки обращайтесь на support@jetblog.app. Рассматривается в течение 7 дней.' },
          { title: 'Изменение цен', body: 'Цены могут быть изменены с уведомлением за 30 дней. Ранее купленные кредиты не затрагиваются.' },
        ],
      },
      {
        title: '4. Интеллектуальная собственность',
        body: 'Платформа JetBlog, её код, дизайн и бренд принадлежат JetBlog и защищены. Статьи, созданные ИИ, принадлежат вам — вы можете использовать их в любых целях.',
        list: [
          'Не должны нарушать авторские права третьих лиц',
          'Должны соответствовать законодательству Узбекистана',
        ],
      },
      {
        title: '5. Ограничения сервиса и SLA',
        table: [
          { plan: 'Free', sites: '1 сайт', kw: '10 ключевых слов/мес.', articles: '2 статьи/мес.' },
          { plan: 'Starter', sites: '3 сайта', kw: '100 ключевых слов/мес.', articles: '20 статей/мес.' },
          { plan: 'Pro', sites: '10 сайтов', kw: '500 ключевых слов/мес.', articles: '80 статей/мес.' },
          { plan: 'Agency', sites: 'Безлимитно', kw: 'Безлимитно', articles: '200 статей/мес.' },
        ],
        note: 'Мы стремимся к 99% uptime, но не гарантируем его. Плановые технические работы объявляются заранее.',
      },
      {
        title: '6. Ограничение ответственности',
        body: 'JetBlog не несёт ответственности за:',
        list: [
          'Точность или SEO-эффективность контента, созданного ИИ',
          'Проблемы, возникшие на вашем сайте WordPress',
          'Сбои сторонних API (Anthropic, OpenAI)',
          'Косвенные убытки или потерю дохода',
        ],
        note: 'Максимальная ответственность — сумма, оплаченная за последние 3 месяца.',
      },
      {
        title: '7. Удаление аккаунта',
        body: 'Вы можете удалить аккаунт в любое время. После удаления:',
        list: [
          'Все данные будут уничтожены в течение 30 дней',
          'Интеграция с WordPress автоматически отключится',
          'Оставшиеся кредиты не возвращаются',
        ],
        note: 'JetBlog также оставляет за собой право удалить аккаунт пользователя, нарушившего настоящие условия, без предупреждения.',
      },
      {
        title: '8. Законодательство и юрисдикция',
        body: 'Настоящие условия регулируются законодательством Республики Узбекистан. Споры решаются сначала путём переговоров, при необходимости — через суды города Ташкента.',
      },
      {
        title: '9. Изменения',
        body: 'Мы можем обновить настоящие условия в любое время. О существенных изменениях уведомляем по электронной почте. Продолжение использования сервиса означает принятие новых условий.',
      },
      { title: '10. Контакты', body: '' },
    ],
  },
  en: {
    lastUpdated: 'Last updated: 22 May 2026 · Governed by Uzbekistan law',
    contactLabel: 'JetBlog Support',
    sections: [
      {
        title: '1. Terms of Use',
        body: 'By using JetBlog.app ("Service") you accept these terms. If you disagree, do not use the Service.',
        list: [
          'User must be at least 18 years old',
          'Account credentials must be kept confidential',
          'One user may maintain only one account',
          'The Service must be used for lawful purposes only',
        ],
      },
      {
        title: '2. Prohibited Activities',
        body: 'The following activities are strictly prohibited:',
        list: [
          'Creating spam, disinformation, or harmful content',
          'Unauthorized access to other users\' data',
          'Reverse-engineering or cloning the Service',
          'Bypassing API limits or sending excessive requests via bots',
          'Publishing content that violates copyright',
        ],
      },
      {
        title: '3. Payment and Refund Policy',
        subsections: [
          { title: 'Credit system', body: 'JetBlog operates on a credit basis. Purchased credits are non-refundable but never expire.' },
          { title: 'Refunds', body: 'For unused credits due to technical failure contact support@jetblog.app. Reviewed within 7 days.' },
          { title: 'Price changes', body: 'Prices may be changed with 30 days\' notice. Previously purchased credits are not affected.' },
        ],
      },
      {
        title: '4. Intellectual Property',
        body: 'The JetBlog platform, its code, design, and brand belong to JetBlog and are protected. AI-generated articles belong to you — you may use them for any purpose.',
        list: [
          'Must not infringe third-party copyrights',
          'Must comply with the laws of Uzbekistan',
        ],
      },
      {
        title: '5. Service Limits and SLA',
        table: [
          { plan: 'Free', sites: '1 site', kw: '10 keywords/mo', articles: '2 articles/mo' },
          { plan: 'Starter', sites: '3 sites', kw: '100 keywords/mo', articles: '20 articles/mo' },
          { plan: 'Pro', sites: '10 sites', kw: '500 keywords/mo', articles: '80 articles/mo' },
          { plan: 'Agency', sites: 'Unlimited', kw: 'Unlimited', articles: '200 articles/mo' },
        ],
        note: 'We target 99% uptime but do not guarantee it. Scheduled maintenance is announced in advance.',
      },
      {
        title: '6. Limitation of Liability',
        body: 'JetBlog is not liable for:',
        list: [
          'Accuracy or SEO performance of AI-generated content',
          'Issues that may arise on your WordPress site',
          'Downtime of third-party APIs (Anthropic, OpenAI)',
          'Indirect losses or loss of revenue',
        ],
        note: 'Maximum liability is capped at the amount paid in the last 3 months.',
      },
      {
        title: '7. Account Deletion',
        body: 'You may delete your account at any time. After deletion:',
        list: [
          'All data will be deleted within 30 days',
          'WordPress integration is automatically disconnected',
          'Remaining credits are non-refundable',
        ],
        note: 'JetBlog also reserves the right to delete accounts that violate these terms without notice.',
      },
      {
        title: '8. Governing Law and Jurisdiction',
        body: 'These terms are governed by the laws of the Republic of Uzbekistan. Disputes are first resolved through negotiation; if necessary — through the courts of Tashkent.',
      },
      {
        title: '9. Changes',
        body: 'We may update these terms at any time. Material changes will be communicated by email. Continued use of the Service constitutes acceptance of the new terms.',
      },
      { title: '10. Contact', body: '' },
    ],
  },
};

export default async function TermsPage() {
  const locale = await getLocale();
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">Terms and Conditions</h1>
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
              {s.subsections && (
                <div className="space-y-4 mt-4">
                  {s.subsections.map((sub) => (
                    <div key={sub.title} className="p-4 rounded-xl bg-white/3 border border-white/8">
                      <h3 className="text-white font-semibold text-sm mb-2">{sub.title}</h3>
                      <p className="text-sm">{sub.body}</p>
                    </div>
                  ))}
                </div>
              )}
              {s.table && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {s.table.map((row) => (
                    <div key={row.plan} className="p-3 rounded-xl bg-white/3 border border-white/8">
                      <p className="text-[#FB3640] font-bold text-sm">{row.plan}</p>
                      <p className="text-zinc-500 text-xs mt-1">{row.sites}</p>
                      <p className="text-zinc-500 text-xs">{row.kw}</p>
                      <p className="text-zinc-500 text-xs">{row.articles}</p>
                    </div>
                  ))}
                </div>
              )}
              {s.note && <p className="mt-3 text-sm">{s.note}</p>}
              {s.title.startsWith('10') && (
                <div className="mt-4 p-4 rounded-xl bg-[#FB3640]/8 border border-[#FB3640]/20">
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
