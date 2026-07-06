import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsH3, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  appPwdTitle: string; appPwdCallout: string;
  appPwdSteps: { title: string; description: React.ReactNode }[];
  connectTitle: string;
  connectSteps: { description: React.ReactNode }[];
  testTitle: string; testDesc: string;
  seoTitle: string; seoCallout: string;
  seoNotes: { title: string; body: string }[];
  troubleshootTitle: string;
  troubleshoot: { problem: string; solution: string }[];
  securityTitle: string; securityBody: string;
}> = {
  uz: {
    badge: 'Platformalar',
    title: 'WordPress',
    description: 'WordPress REST API va Application Password orqali JetBlog ga ulang. WordPress 5.6+ talab qilinadi.',
    appPwdTitle: 'Application Password yaratish',
    appPwdCallout: "Application Password — oddiy parolingiz emas. Bu faqat API uchun alohida parol bo'lib, asosiy parolingiz xavfsiz qoladi.",
    appPwdSteps: [
      { title: 'WP Admin ga kiring', description: <><InlineCode>yoursite.com/wp-admin</InlineCode> ga o&apos;ting va administrator hisobiga kiring</> },
      { title: "Profile ga o'ting", description: <>Chap menuda <strong className="text-white">Users → Your Profile</strong> ni bosing</> },
      { title: 'Application Passwords toping', description: 'Sahifaning eng pastiga scroll qiling — "Application Passwords" bo\'limini toping' },
      { title: 'Yangi parol yarating', description: <>Nom kiriting (masalan: <InlineCode>JetBlog</InlineCode>) → <strong className="text-white">"Add New Application Password"</strong> tugmasini bosing</> },
      { title: 'Parolni saqlang', description: "Yaratilgan parolni HOZIROQ nusxalab oling — u faqat bir marta ko'rsatiladi! Format: xxxx xxxx xxxx xxxx xxxx xxxx" },
    ],
    connectTitle: 'JetBlog da ulash',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish</strong> → <strong className="text-white">WordPress</strong> tanlang</> },
      { description: <><strong className="text-white">Site URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">WP Username</strong>: WordPress login nomingiz (email emas)</> },
      { description: <><strong className="text-white">Application Password</strong>: Yuqorida nusxalagan parolingiz</> },
      { description: <><strong className="text-white">Test connection</strong> → Muvaffaqiyatli ulandi!</> },
    ],
    testTitle: 'Ulanishni tekshirish (curl)',
    testDesc: "Qo'lda tekshirish uchun terminal da:",
    seoTitle: 'SEO meta qanday ishlaydi?',
    seoCallout: "Excerpt va JSON-LD har doim ishlaydi — SEO plugin o'rnatish majburiy emas.",
    seoNotes: [
      { title: 'Excerpt (meta description)', body: "JetBlog har doim excerpt maydonini to'ldiradi — qidiruv snippet uchun ishonchli ishlaydi." },
      { title: "JSON-LD tuzilgan ma'lumot", body: 'Har bir maqola <script type="application/ld+json"> Article blokini o\'z ichiga oladi.' },
      { title: 'Yoast SEO / RankMath meta', body: "JetBlog _yoast_wpseo_title, _yoast_wpseo_metadesc, rank_math_title va rank_math_description meta maydonlarini yuboradi." },
      { title: 'Teglar', body: "Teglar WP term ID sifatida yuboriladi. JetBlog mavjud tegni avtomatik topadi yoki yangi tag yaratadi." },
    ],
    troubleshootTitle: 'Muammolar va yechimlari',
    troubleshoot: [
      { problem: 'Connection failed / 401 Unauthorized', solution: "Application Password noto'g'ri kiritilgan. Parolni qayta nusxalab kiriting." },
      { problem: 'REST API disabled', solution: "Ba'zi hostinglar WP REST API ni o'chiradi. Hosting panelida tekshiring." },
      { problem: "Application Passwords bo'limi yo'q", solution: "WordPress 5.6 dan past versiya. 'Application Passwords' plugin o'rnating." },
      { problem: 'Publish qilinganda maqola draft holatida qoladi', solution: 'WP foydalanuvchingiz "Editor" yoki "Administrator" roliga ega emasligini tekshiring.' },
    ],
    securityTitle: 'Xavfsizlik',
    securityBody: "JetBlog Application Password ni AES-256-GCM shifrlash bilan saqlaydi. Parolingiz hech qachon ochiq holda saqlanmaydi.",
  },
  ru: {
    badge: 'Платформы',
    title: 'WordPress',
    description: 'Подключите JetBlog через WordPress REST API и Application Password. Требуется WordPress 5.6+.',
    appPwdTitle: 'Создание Application Password',
    appPwdCallout: "Application Password — не ваш обычный пароль. Это отдельный па��оль только для API, ваш основной пароль остаётся в безопасности.",
    appPwdSteps: [
      { title: 'Войдите в WP Admin', description: <><InlineCode>yoursite.com/wp-admin</InlineCode> и войдите под учётной записью администратора</> },
      { title: 'Перейдите в Profile', description: <>В левом меню нажмите <strong className="text-white">Users → Your Profile</strong></> },
      { title: 'Найдите Application Passwords', description: 'Прокрутите страницу вниз — найдите раздел "Application Passwords"' },
      { title: 'Создайте новый пароль', description: <>Введите название (например: <InlineCode>JetBlog</InlineCode>) → нажмите <strong className="text-white">"Add New Application Password"</strong></> },
      { title: 'Сохраните пароль', description: "Скопируйте созданный па��оль СЕЙЧАС — он показывается только один раз! Формат: xxxx xxxx xxxx xxxx xxxx xxxx" },
    ],
    connectTitle: 'Подключение в JetBlog',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Добавить сайт</strong> → выберите <strong className="text-white">WordPress</strong></> },
      { description: <><strong className="text-white">Site URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">WP Username</strong>: ваш логин WordPress (не email)</> },
      { description: <><strong className="text-white">Application Password</strong>: пароль, скопированный выше</> },
      { description: <><strong className="text-white">Test connection</strong> → Успешно подключено!</> },
    ],
    testTitle: 'Проверка подключения (curl)',
    testDesc: 'Для ручной проверки в терминале:',
    seoTitle: 'Как работают SEO-мета?',
    seoCallout: "Excerpt и JSON-LD работают всегда — устанавливать SEO-плагин необязательно.",
    seoNotes: [
      { title: 'Excerpt (meta description)', body: 'JetBlog всегда заполняет поле excerpt — надёжно работает для поисковых сниппетов.' },
      { title: 'JSON-LD структурированные данные', body: 'Каждая статья содержит блок <script type="application/ld+json"> Article для Google.' },
      { title: 'Yoast SEO / RankMath meta', body: 'JetBlog отправляет мета-поля _yoast_wpseo_title, _yoast_wpseo_metadesc, rank_math_title и rank_math_description.' },
      { title: 'Теги', body: 'Теги отправляются как WP term ID. JetBlog автоматически находит существующий тег или создаёт новый.' },
    ],
    troubleshootTitle: 'Проблемы и решения',
    troubleshoot: [
      { problem: 'Connection failed / 401 Unauthorized', solution: 'Application Password введён неверно. Скопируйте его заново — пробелы тоже входят.' },
      { problem: 'REST API disabled', solution: 'Некоторые хостинги отключают WP REST API. Проверьте в панели х��стинга или .htaccess.' },
      { problem: 'Раздел Application Passwords отсутствует', solution: 'Версия WordPress ниже 5.6. Установите плагин "Application Passwords" в wp-admin → Plugins → Add New.' },
      { problem: 'После публикации статья остаётся в черновике', solution: 'Убедитесь, что у вашего WP-пользователя роль "Editor" или "Administrator".' },
    ],
    securityTitle: 'Безопасность',
    securityBody: "JetBlog хранит Application Password с шифрованием AES-256-GCM. Ваш пароль никогда не хранится в открытом виде.",
  },
  en: {
    badge: 'Platforms',
    title: 'WordPress',
    description: 'Connect JetBlog via the WordPress REST API and Application Password. Requires WordPress 5.6+.',
    appPwdTitle: 'Create an Application Password',
    appPwdCallout: "Application Password is not your regular password. It's a separate API-only password — your main password stays secure.",
    appPwdSteps: [
      { title: 'Log into WP Admin', description: <><InlineCode>yoursite.com/wp-admin</InlineCode> and sign in with an administrator account</> },
      { title: 'Go to Profile', description: <>In the left menu click <strong className="text-white">Users → Your Profile</strong></> },
      { title: 'Find Application Passwords', description: 'Scroll to the bottom of the page — find the "Application Passwords" section' },
      { title: 'Create a new password', description: <>Enter a name (e.g. <InlineCode>JetBlog</InlineCode>) → click <strong className="text-white">"Add New Application Password"</strong></> },
      { title: 'Save the password', description: "Copy the generated password RIGHT NOW — it's only shown once! Format: xxxx xxxx xxxx xxxx xxxx xxxx" },
    ],
    connectTitle: 'Connect in JetBlog',
    connectSteps: [
      { description: <>Dashboard → <strong className="text-white">Connections → Add Site</strong> �� select <strong className="text-white">WordPress</strong></> },
      { description: <><strong className="text-white">Site URL</strong>: <InlineCode>https://yoursite.com</InlineCode></> },
      { description: <><strong className="text-white">WP Username</strong>: your WordPress login (not email)</> },
      { description: <><strong className="text-white">Application Password</strong>: the password copied above</> },
      { description: <><strong className="text-white">Test connection</strong> → Successfully connected!</> },
    ],
    testTitle: 'Test connection (curl)',
    testDesc: 'Manual check in terminal:',
    seoTitle: 'How do SEO metas work?',
    seoCallout: "Excerpt and JSON-LD always work — installing an SEO plugin is not required.",
    seoNotes: [
      { title: 'Excerpt (meta description)', body: 'JetBlog always fills the excerpt field — works reliably for search snippets.' },
      { title: 'JSON-LD structured data', body: 'Every article includes a <script type="application/ld+json"> Article block for Google.' },
      { title: 'Yoast SEO / RankMath meta', body: 'JetBlog sends _yoast_wpseo_title, _yoast_wpseo_metadesc, rank_math_title and rank_math_description fields.' },
      { title: 'Tags', body: 'Tags are sent as WP term IDs. JetBlog automatically finds an existing tag or creates a new one.' },
    ],
    troubleshootTitle: 'Troubleshooting',
    troubleshoot: [
      { problem: 'Connection failed / 401 Unauthorized', solution: 'Application Password entered incorrectly. Copy it again — spaces are included.' },
      { problem: 'REST API disabled', solution: 'Some hosts disable the WP REST API. Check in your hosting panel or .htaccess.' },
      { problem: 'Application Passwords section missing', solution: 'WordPress version below 5.6. Install the "Application Passwords" plugin via wp-admin → Plugins → Add New.' },
      { problem: 'Article stays in draft after publishing', solution: 'Check that your WP user has the "Editor" or "Administrator" role.' },
    ],
    securityTitle: 'Security',
    securityBody: "JetBlog stores Application Password with AES-256-GCM encryption. Your password is never stored in plain text.",
  },
};

export async function WordPressPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.appPwdTitle}</DocsH2>
      <Callout variant="info" className="mb-6">{c.appPwdCallout}</Callout>
      <StepList className="mb-8" steps={c.appPwdSteps} />

      <DocsH2>{c.connectTitle}</DocsH2>
      <StepList className="mb-8" steps={c.connectSteps} />

      <DocsH2>{c.testTitle}</DocsH2>
      <DocsPara>{c.testDesc}</DocsPara>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`curl -u "your_username:xxxx xxxx xxxx xxxx xxxx xxxx" \\\n  https://yoursite.com/wp-json/wp/v2/posts \\\n  -X GET`}
        className="mb-8"
      />

      <DocsH2>{c.seoTitle}</DocsH2>
      <Callout variant="info" className="mb-4">{c.seoCallout}</Callout>
      <div className="flex flex-col gap-3 mb-8">
        {c.seoNotes.map((n) => (
          <div key={n.title} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <DocsH3>{n.title}</DocsH3>
            <p className="text-sm text-zinc-400">{n.body}</p>
          </div>
        ))}
      </div>

      <DocsH2>{c.troubleshootTitle}</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {c.troubleshoot.map((t) => (
          <div key={t.problem} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <DocsH3>{t.problem}</DocsH3>
            <p className="text-sm text-zinc-400">{t.solution}</p>
          </div>
        ))}
      </div>

      <Callout variant="success" title={c.securityTitle}>
        {c.securityBody}
      </Callout>
    </div>
  );
}
