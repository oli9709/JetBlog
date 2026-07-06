import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  howTitle: string; howDesc: string;
  stepsTitle: string;
  steps: { title: string; description: React.ReactNode }[];
  structureTitle: string; structureIntro: string;
  structure: string[];
  autopilotTitle: string; autopilotDesc: string;
  autopilotSteps: string[];
  tipTitle: string; tipBody: React.ReactNode;
}> = {
  uz: {
    badge: 'AI va kontent',
    title: 'Maqola generatsiya',
    description: 'Claude AI yordamida SEO optimallashtirilgan maqolalarni avtomatik yarating.',
    howTitle: 'Qanday ishlaydi?',
    howDesc: "JetBlog kalit so'z, brand voice sozlamalari, va SEO talablarini tahlil qilib, Claude AI ga to'liq prompt yuboradi. Natijada maqola, sarlavha, meta tavsif va muqova rasm (DALL-E 3) avtomatik yaratiladi.",
    stepsTitle: 'Maqola yaratish bosqichlari',
    steps: [
      { title: "Kalit so'z tanlash", description: <>Dashboard → <strong className="text-white">Content</strong> → generatsiya qilmoqchi bo&apos;lgan kalit so&apos;zni tanlang</> },
      { title: 'Generate bosish', description: <><strong className="text-white">Generate Article</strong> tugmasini bosing — 1 kredit sarflanadi</> },
      { title: 'AI ishlamoqda', description: 'Claude maqola yozadi (30-60 soniya). DALL-E 3 muqova rasm yaratadi.' },
      { title: 'Tahrirlash', description: "TipTap editor da maqolani ko'rib chiqing, kerak bo'lsa tahrirlang" },
      { title: 'Nashr', description: <><strong className="text-white">Publish</strong> tugmasini bosing — maqola saytingizga yuboriladi</> },
    ],
    structureTitle: 'Maqola tuzilishi',
    structureIntro: 'JetBlog har bir maqolada quyidagilarni avtomatik yaratadi:',
    structure: [
      "SEO sarlavha (kalit so'z bilan)",
      'Meta tavsif (155 belgi)',
      'Kirish (introduction) — diqqatni jalb qiluvchi',
      'Asosiy kontent — H2/H3 sarlavhalar bilan tuzilgan',
      "FAQ bo'limi — long-tail kalit so'zlar uchun",
      'Xulosa va CTA',
      'Muqova rasm (DALL-E 3)',
    ],
    autopilotTitle: 'Avtomatik jadval (Autopilot)',
    autopilotDesc: 'Connections sahifasida sayt sozlamalarida nashr kunlari va vaqtini belgilang. Autopilot yoqilganda JetBlog belgilangan vaqtda avtomatik:',
    autopilotSteps: [
      "Navbatdagi tasdiqlangan kalit so'zni oladi",
      'Claude AI bilan maqola yozadi',
      'DALL-E 3 muqova rasm yaratadi',
      'Saytingizga nashr qiladi',
      'Telegram kanalingizga xabar yuboradi',
    ],
    tipTitle: 'Tip',
    tipBody: <>Brand voice ni to&apos;ldirsangiz, maqolalar saytingiz ohangida yoziladi. <InlineCode>Brand voice</InlineCode> sahifasiga qarang.</>,
  },
  ru: {
    badge: 'AI и контент',
    title: 'Генерация статей',
    description: 'Автоматически создавайте SEO-оптимизированные статьи с помощью Claude AI.',
    howTitle: 'Как это работает?',
    howDesc: 'JetBlog анализирует ключевое слово, настройки brand voice и требования SEO, затем отправляет полный промпт Claude AI. В результате автоматически создаются статья, заголовок, мета-описание и обложка (DALL-E 3).',
    stepsTitle: 'Шаги создания статьи',
    steps: [
      { title: 'Выбор ключевого слова', description: <>Dashboard → <strong className="text-white">Content</strong> → выберите ключевое слово для генерации</> },
      { title: 'Нажмите Generate', description: <><strong className="text-white">Generate Article</strong> — расходуется 1 кредит</> },
      { title: 'AI работает', description: 'Claude пишет статью (30-60 секунд). DALL-E 3 создаёт обложку.' },
      { title: 'Редактирование', description: 'Просмотрите статью в TipTap-редакторе и при необходимости отредактируйте' },
      { title: 'Публикация', description: <><strong className="text-white">Publish</strong> — статья отправляется на ваш сайт</> },
    ],
    structureTitle: 'Структура статьи',
    structureIntro: 'JetBlog автоматически создаёт в каждой статье:',
    structure: [
      'SEO-заголовок (с ключевым словом)',
      'Мета-описание (155 символов)',
      'Введение — привлекающее внимание',
      'Основной контент — структурированный с заголовками H2/H3',
      'Раздел FAQ — для long-tail ключевых слов',
      'Заключение и CTA',
      'Обложка (DALL-E 3)',
    ],
    autopilotTitle: 'Автоматическое расписание (Автопилот)',
    autopilotDesc: 'Задайте дни и время публикации в настройках сайта на странице Connections. Когда автопилот активен, JetBlog автоматически:',
    autopilotSteps: [
      'Берёт следующее одобренное ключевое слово',
      'Пишет статью с Claude AI',
      'Создаёт обложку DALL-E 3',
      'Публикует на ваш сайт',
      'Отправляет сообщение в ваш Telegram-канал',
    ],
    tipTitle: 'Совет',
    tipBody: <>Заполните Brand voice — и статьи будут написаны в тоне вашего сайта. Смотрите страницу <InlineCode>Brand voice</InlineCode>.</>,
  },
  en: {
    badge: 'AI & Content',
    title: 'Article generation',
    description: 'Automatically generate SEO-optimised articles with Claude AI.',
    howTitle: 'How does it work?',
    howDesc: 'JetBlog analyses the keyword, brand voice settings, and SEO requirements, then sends a complete prompt to Claude AI. As a result, the article, title, meta description, and cover image (DALL-E 3) are all created automatically.',
    stepsTitle: 'Article creation steps',
    steps: [
      { title: 'Select a keyword', description: <>Dashboard → <strong className="text-white">Content</strong> → select the keyword you want to generate for</> },
      { title: 'Click Generate', description: <><strong className="text-white">Generate Article</strong> — 1 credit is used</> },
      { title: 'AI is working', description: 'Claude writes the article (30-60 seconds). DALL-E 3 creates the cover image.' },
      { title: 'Edit', description: 'Review the article in the TipTap editor and edit if needed' },
      { title: 'Publish', description: <><strong className="text-white">Publish</strong> — the article is sent to your site</> },
    ],
    structureTitle: 'Article structure',
    structureIntro: 'JetBlog automatically creates in every article:',
    structure: [
      'SEO title (with keyword)',
      'Meta description (155 characters)',
      'Introduction — attention-grabbing',
      'Main content — structured with H2/H3 headings',
      'FAQ section — for long-tail keywords',
      'Conclusion and CTA',
      'Cover image (DALL-E 3)',
    ],
    autopilotTitle: 'Automatic schedule (Autopilot)',
    autopilotDesc: 'Set publishing days and time in site settings on the Connections page. When autopilot is enabled, JetBlog automatically:',
    autopilotSteps: [
      'Takes the next approved keyword',
      'Writes an article with Claude AI',
      'Creates a DALL-E 3 cover image',
      'Publishes to your site',
      'Sends a message to your Telegram channel',
    ],
    tipTitle: 'Tip',
    tipBody: <>Fill in Brand voice and articles will be written in your site&apos;s tone. See the <InlineCode>Brand voice</InlineCode> page.</>,
  },
};

export async function MaqolaGeneratsiyaPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;

  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.howTitle}</DocsH2>
      <DocsPara>{c.howDesc}</DocsPara>

      <DocsH2>{c.stepsTitle}</DocsH2>
      <StepList className="mb-8" steps={c.steps} />

      <DocsH2>{c.structureTitle}</DocsH2>
      <DocsPara>{c.structureIntro}</DocsPara>
      <ul className="space-y-2 mb-8">
        {c.structure.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-[#FB3640] mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <DocsH2>{c.autopilotTitle}</DocsH2>
      <DocsPara>{c.autopilotDesc}</DocsPara>
      <ol className="space-y-2 mb-8">
        {c.autopilotSteps.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <Callout variant="info" title={c.tipTitle}>
        {c.tipBody}
      </Callout>
    </div>
  );
}
