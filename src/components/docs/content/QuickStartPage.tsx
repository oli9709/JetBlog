'use client';

import React from 'react';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { PlatformTabs } from '../PlatformTabs';
import { InlineCode } from '../CodeBlock';
import { useLocale } from 'next-intl';

interface Props { locale?: string }

function getContent(locale: string) {
  const isEn = locale === 'en';
  const isRu = locale === 'ru';

  const badge = isEn ? 'Getting Started' : isRu ? 'Начало' : 'Boshlash';
  const title = isEn ? 'Setup in 5 minutes' : isRu ? 'Настройка за 5 минут' : "5 daqiqada sozlash";
  const description = isEn
    ? 'Installing JetBlog and creating your first article takes just 5 minutes.'
    : isRu
    ? 'Настроить JetBlog и создать первую статью займёт всего 5 минут.'
    : "JetBlog ni o'rnatib, birinchi maqolangizni yaratishga bor-yo'g'i 5 daqiqa kerak.";

  const step1Title = isEn ? 'Sign up' : isRu ? 'Регистрация' : "Ro'yxatdan o'ting";
  const step2Title = isEn ? 'Connect your platform' : isRu ? 'Подключите платформу' : 'Platformani ulang';
  const step3Title = isEn ? 'Add a keyword' : isRu ? 'Добавьте ключевое слово' : "Kalit so'z qo'shing";
  const step4Title = isEn ? 'Generate your first article' : isRu ? 'Сгенерируйте первую статью' : 'Birinchi maqolani generatsiya qiling';

  const calloutTitle = isEn ? 'Congratulations!' : isRu ? 'Поздравляем!' : 'Tabriklaymiz!';
  const calloutBody = isEn
    ? 'Your first article is published. Now enable Autopilot — JetBlog will automatically write and publish articles on schedule.'
    : isRu
    ? 'Ваша первая статья опубликована. Теперь включите Autopilot — JetBlog будет автоматически писать и публиковать статьи по расписанию.'
    : "Birinchi maqolangiz nashr qilindi. Endi Autopilot ni yoqing — JetBlog belgilangan jadvalda avtomatik maqola yozib nashr qiladi.";

  const step1Steps = isEn
    ? [
        { title: 'Go to jetblog.app', description: <>Visit <InlineCode>jetblog.app/auth/signup</InlineCode> and sign up with your email.</> },
        { title: 'Confirm your email', description: "A confirmation link will be sent to your email. Click it — you'll be taken to the dashboard." },
        { title: 'Start with the free plan', description: 'Free plan — 2 articles/month, 1 site. You can upgrade at any time.' },
      ]
    : isRu
    ? [
        { title: 'Перейдите на jetblog.app', description: <>Откройте <InlineCode>jetblog.app/auth/signup</InlineCode> и зарегистрируйтесь по email.</> },
        { title: 'Подтвердите email', description: 'На ваш email придёт ссылка для подтверждения. Нажмите на неё — вы перейдёте в дашборд.' },
        { title: 'Начните с бесплатного плана', description: 'Бесплатный план — 2 статьи/мес., 1 сайт. Обновить можно в любое время.' },
      ]
    : [
        { title: "jetblog.app ga o'ting", description: <><InlineCode>jetblog.app/auth/signup</InlineCode> sahifasiga o&apos;ting va email bilan ro&apos;yxatdan o&apos;ting.</> },
        { title: 'Email tasdiqlang', description: "Emailingizga tasdiqlash havolasi yuboriladi. Havolani bosing — siz dashboardga o'tkazilasiz." },
        { title: "Bepul plan bilan boshlang", description: "Free plan — 2 ta maqola/oy, 1 ta sayt. Kerak bo'lsa istalgan vaqt upgrade qilasiz." },
      ];

  const connectIntro = isEn
    ? <>Dashboard → <strong className="text-white">Connections</strong> → click <strong className="text-white">Add Site</strong> and select your platform:</>
    : isRu
    ? <>Dashboard → <strong className="text-white">Connections</strong> → нажмите <strong className="text-white">Добавить сайт</strong> и выберите платформу:</>
    : <>Dashboard → <strong className="text-white">Connections</strong> → <strong className="text-white">Sayt qo&apos;shish</strong> tugmasini bosing va platformangizni tanlang:</>;

  const wpSteps = isEn
    ? [
        { description: <>Log in to WordPress admin: <InlineCode>yoursite.com/wp-admin</InlineCode></> },
        { description: <><strong className="text-white">Users → Profile → Application Passwords</strong></> },
        { description: 'Enter a name (e.g. JetBlog) → "Add New Application Password" → copy it' },
        { description: <>In JetBlog: enter Site URL, WP Username, and Application Password → <strong className="text-white">Test connection</strong></> },
      ]
    : isRu
    ? [
        { description: <>Войдите в WordPress Admin: <InlineCode>yoursite.com/wp-admin</InlineCode></> },
        { description: <><strong className="text-white">Users → Profile → Application Passwords</strong></> },
        { description: 'Введите название (например: JetBlog) → "Add New Application Password" → скопируйте' },
        { description: <>В JetBlog: введите URL сайта, WP Username и Application Password → <strong className="text-white">Test connection</strong></> },
      ]
    : [
        { description: <>WordPress admin paneliga kiring: <InlineCode>yoursite.com/wp-admin</InlineCode></> },
        { description: <><strong className="text-white">Users → Profile → Application Passwords</strong> bo&apos;limiga o&apos;ting</> },
        { description: "Nom kiriting (masalan: JetBlog) → \"Add New Application Password\" → Nusxalab oling" },
        { description: <>JetBlog da: Site URL, WP Username va Application Password kiriting → <strong className="text-white">Test connection</strong></> },
      ];

  const ghostSteps = isEn
    ? [
        { description: <>Log in to Ghost Admin: <InlineCode>yoursite.com/ghost</InlineCode></> },
        { description: <><strong className="text-white">Settings → Integrations → Add custom integration</strong></> },
        { description: 'Give it a name (JetBlog) → copy the Admin API Key' },
        { description: <>In JetBlog: enter Ghost URL and Admin API Key → <strong className="text-white">Test connection</strong></> },
      ]
    : isRu
    ? [
        { description: <>Войдите в Ghost Admin: <InlineCode>yoursite.com/ghost</InlineCode></> },
        { description: <><strong className="text-white">Settings → Integrations → Add custom integration</strong></> },
        { description: 'Дайте имя (JetBlog) → скопируйте Admin API Key' },
        { description: <>В JetBlog: введите Ghost URL и Admin API Key → <strong className="text-white">Test connection</strong></> },
      ]
    : [
        { description: <>Ghost Admin paneliga kiring: <InlineCode>yoursite.com/ghost</InlineCode></> },
        { description: <><strong className="text-white">Settings → Integrations → Add custom integration</strong></> },
        { description: 'Nom bering (JetBlog) → Admin API Key ni nusxalab oling' },
        { description: <>JetBlog da: Ghost URL va Admin API Key kiriting → <strong className="text-white">Test connection</strong></> },
      ];

  const webflowSteps = isEn
    ? [
        { description: <>Webflow Dashboard → <strong className="text-white">Project Settings → Integrations</strong></> },
        { description: 'Create a token in API Access → copy it' },
        { description: <>CMS → Collections → open the articles collection → take the ID from the URL</> },
        { description: <>In JetBlog: enter Site URL, API Token, Collection ID → <strong className="text-white">Test connection</strong></> },
      ]
    : isRu
    ? [
        { description: <>Webflow Dashboard → <strong className="text-white">Project Settings → Integrations</strong></> },
        { description: 'В разделе API Access создайте токен → скопируйте' },
        { description: <>CMS → Collections → откройте коллекцию статей → возьмите ID из URL</> },
        { description: <>В JetBlog: введите URL сайта, API Token, Collection ID → <strong className="text-white">Test connection</strong></> },
      ]
    : [
        { description: <>Webflow Dashboard → <strong className="text-white">Project Settings → Integrations</strong></> },
        { description: "API Access bo'limida token yarating → Nusxalab oling" },
        { description: <>CMS → Collections → maqolalar kolleksiyasini oching → URL dagi ID ni oling</> },
        { description: <>JetBlog da: Site URL, API Token, Collection ID kiriting → <strong className="text-white">Test connection</strong></> },
      ];

  const webhookSteps = isEn
    ? [
        { description: 'Create a webhook endpoint on your server (Node.js, PHP, or Python examples on the Webhook page)' },
        { description: <><InlineCode>https://yourserver.com/webhook</InlineCode> endpoint URL</> },
        { description: 'Enter a secret key or click auto-generate' },
        { description: <><strong className="text-white">Test connection</strong> — JetBlog sends a test request</> },
      ]
    : isRu
    ? [
        { description: 'Создайте webhook-эндпоинт на сервере (примеры на Node.js, PHP и Python — на странице Webhook)' },
        { description: <><InlineCode>https://yourserver.com/webhook</InlineCode> URL эндпоинта</> },
        { description: 'Введите secret key или нажмите auto-generate' },
        { description: <><strong className="text-white">Test connection</strong> — JetBlog отправит тестовый запрос</> },
      ]
    : [
        { description: "Serveringizda webhook endpoint yarating (Node.js, PHP, yoki Python misollari Webhook sahifasida)" },
        { description: <><InlineCode>https://yourserver.com/webhook</InlineCode> endpoint URL ni kiriting</> },
        { description: "Secret key kiriting yoki auto-generate tugmasini bosing" },
        { description: <><strong className="text-white">Test connection</strong> — JetBlog test so&apos;rov yuboradi</> },
      ];

  const step3Steps = isEn
    ? [
        { description: <>Go to <strong className="text-white">Dashboard → Keywords</strong></> },
        { description: <><strong className="text-white">Add Keyword</strong></> },
        { description: <>Enter a keyword (e.g. <InlineCode>wordpress seo 2026</InlineCode>) and select language</> },
        { description: "JetBlog automatically fetches search volume and difficulty data and adds the keyword to the list" },
      ]
    : isRu
    ? [
        { description: <>Перейдите в <strong className="text-white">Dashboard → Keywords</strong></> },
        { description: <><strong className="text-white">Add Keyword</strong></> },
        { description: <>Введите ключевое слово (например: <InlineCode>wordpress seo 2026</InlineCode>) и выберите язык</> },
        { description: "JetBlog автоматически получает данные search volume, difficulty и добавляет ключевое слово в список" },
      ]
    : [
        { description: <>Dashboard → <strong className="text-white">Keywords</strong> sahifasiga o&apos;ting</> },
        { description: <><strong className="text-white">Add Keyword</strong> tugmasini bosing</> },
        { description: <><InlineCode>wordpress seo 2026</InlineCode> kabi kalit so&apos;z kiriting va tilni tanlang</> },
        { description: "JetBlog search volume, difficulty ma'lumotlarini avtomatik oladi va kalit so'z ro'yxatga qo'shiladi" },
      ];

  const step4Steps = isEn
    ? [
        { description: <>Go to <strong className="text-white">Dashboard → Content</strong></> },
        { description: 'Select the keyword you want to generate an article for' },
        { description: <><strong className="text-white">Generate Article</strong> — this may take 30–60 seconds</> },
        { description: 'Claude AI writes the article, DALL-E 3 creates the cover image' },
        { description: 'Review and edit in the TipTap editor' },
        { description: <><strong className="text-white">Publish</strong> — the article appears on your site!</> },
      ]
    : isRu
    ? [
        { description: <>Перейдите в <strong className="text-white">Dashboard → Content</strong></> },
        { description: 'Выберите ключевое слово, для которого хотите сгенерировать статью' },
        { description: <><strong className="text-white">Generate Article</strong> — это может занять 30–60 секунд</> },
        { description: 'Claude AI пишет статью, DALL-E 3 создаёт обложку' },
        { description: 'Просмотрите и отредактируйте в TipTap-редакторе' },
        { description: <><strong className="text-white">Publish</strong> — статья появится на вашем сайте!</> },
      ]
    : [
        { description: <>Dashboard → <strong className="text-white">Content</strong> sahifasiga o&apos;ting</> },
        { description: "Maqola generatsiya qilmoqchi bo'lgan kalit so'zni tanlang" },
        { description: <><strong className="text-white">Generate Article</strong> tugmasini bosing — bu 30–60 soniya olishi mumkin</> },
        { description: 'Claude AI maqola yozadi, DALL-E 3 muqova rasm yaratadi' },
        { description: 'TipTap editorida ko\'rib chiqing va tahrirlang' },
        { description: <><strong className="text-white">Publish</strong> tugmasini bosing — maqola saytingizda paydo bo&apos;ladi!</> },
      ];

  return {
    badge, title, description,
    step1Title, step2Title, step3Title, step4Title,
    calloutTitle, calloutBody,
    step1Steps, connectIntro, wpSteps, ghostSteps, webflowSteps, webhookSteps,
    step3Steps, step4Steps,
  };
}

export function QuickStartPage({ locale: _localeProp }: Props) {
  const locale = useLocale() as 'uz' | 'ru' | 'en';
  const c = getContent(locale);
  const isEn = locale === 'en';
  const isRu = locale === 'ru';

  const platformLabels = {
    wordpress: 'WordPress',
    ghost: 'Ghost',
    webflow: 'Webflow',
    webhook: 'Webhook',
  };

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.step1Title}</DocsH2>
      <StepList className="mb-8" steps={c.step1Steps} />

      <DocsH2>{c.step2Title}</DocsH2>
      <p className="text-sm text-zinc-400 mb-4">{c.connectIntro}</p>

      <PlatformTabs
        className="mb-8"
        tabs={[
          { id: 'wordpress', label: platformLabels.wordpress, content: <StepList steps={c.wpSteps} /> },
          { id: 'ghost', label: platformLabels.ghost, content: <StepList steps={c.ghostSteps} /> },
          { id: 'webflow', label: platformLabels.webflow, content: <StepList steps={c.webflowSteps} /> },
          { id: 'webhook', label: platformLabels.webhook, content: <StepList steps={c.webhookSteps} /> },
        ]}
      />

      <DocsH2>{c.step3Title}</DocsH2>
      <StepList className="mb-8" steps={c.step3Steps} />

      <DocsH2>{c.step4Title}</DocsH2>
      <StepList className="mb-8" steps={c.step4Steps} />

      <Callout variant="success" title={c.calloutTitle}>{c.calloutBody}</Callout>
    </div>
  );
}
