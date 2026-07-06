import React from 'react';
import { getLocale } from 'next-intl/server';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

interface Props { locale?: string }

const CONTENT: Record<string, {
  badge: string; title: string; description: string;
  connectTitle: string;
  steps: { title: string; description: React.ReactNode }[];
  formatTitle: string;
  msgNew: string; msgTitle: string; msgKeyword: string; msgSite: string;
  calloutBody: string;
}> = {
  uz: {
    badge: 'Integratsiyalar',
    title: 'Telegram bildirish',
    description: "Maqola nashr qilinganda Telegram kanalingizga avtomatik xabar yuboriladi.",
    connectTitle: 'Ulash',
    steps: [
      {
        title: "JetBlog botini kanalingizga qo'shing",
        description: <><InlineCode>@JetBlogBot</InlineCode> ni topib kanalingizga admin sifatida qo&apos;shing</>,
      },
      {
        title: "Kanal ID ni oling",
        description: <><InlineCode>@userinfobot</InlineCode> ga kanalingizdan istalgan xabarni forward qiling — u ID ni beradi (<InlineCode>-100XXXXXXXXX</InlineCode> format)</>,
      },
      {
        title: 'JetBlog da ulang',
        description: <><strong className="text-white">Dashboard → Connections</strong> → Sayt kartasida <strong className="text-white">Telegram ulash</strong> tugmasini bosing</>,
      },
      {
        title: 'ID kiriting',
        description: <>Kanal ID kiriting va <strong className="text-white">Ulash</strong> → Test xabar keladi!</>,
      },
    ],
    formatTitle: "Xabar formati",
    msgNew: '📝 Yangi maqola nashr qilindi!',
    msgTitle: 'Sarlavha',
    msgKeyword: "Kalit so'z",
    msgSite: 'Sayt',
    calloutBody: 'Bir saytga faqat bitta Telegram kanal ulash mumkin. Uzish uchun sayt kartasidagi Uzish tugmasini bosing.',
  },
  ru: {
    badge: 'Интеграции',
    title: 'Уведомления Telegram',
    description: 'При публикации статьи в ваш Telegram-канал автоматически приходит сообщение.',
    connectTitle: 'Подключение',
    steps: [
      {
        title: 'Добавьте бота JetBlog в канал',
        description: <><InlineCode>@JetBlogBot</InlineCode> найдите и добавьте как администратора в ваш канал</>,
      },
      {
        title: 'Получите ID канала',
        description: <>Перешлите любое сообщение из канала боту <InlineCode>@userinfobot</InlineCode> — он вернёт ID (формат: <InlineCode>-100XXXXXXXXX</InlineCode>)</>,
      },
      {
        title: 'Подключите в JetBlog',
        description: <><strong className="text-white">Dashboard → Connections</strong> → в карточке сайта нажмите <strong className="text-white">Подключить Telegram</strong></>,
      },
      {
        title: 'Введите ID',
        description: <>Введите ID канала и нажмите <strong className="text-white">Подключить</strong> → придёт тестовое сообщение!</>,
      },
    ],
    formatTitle: 'Формат сообщения',
    msgNew: '📝 Новая статья опубликована!',
    msgTitle: 'Заголовок',
    msgKeyword: 'Ключевое слово',
    msgSite: 'Сайт',
    calloutBody: 'К одному сайту можно подключить только один Telegram-канал. Для отключения нажмите кнопку «Отключить» в карточке сайта.',
  },
  en: {
    badge: 'Integrations',
    title: 'Telegram notifications',
    description: 'An automatic message is sent to your Telegram channel whenever an article is published.',
    connectTitle: 'Connecting',
    steps: [
      {
        title: 'Add the JetBlog bot to your channel',
        description: <>Find <InlineCode>@JetBlogBot</InlineCode> on Telegram and add it as an admin to your channel</>,
      },
      {
        title: 'Get the channel ID',
        description: <>Forward any message from your channel to <InlineCode>@userinfobot</InlineCode> — it will return the ID (format: <InlineCode>-100XXXXXXXXX</InlineCode>)</>,
      },
      {
        title: 'Connect in JetBlog',
        description: <><strong className="text-white">Dashboard → Connections</strong> → click <strong className="text-white">Connect Telegram</strong> on the site card</>,
      },
      {
        title: 'Enter the ID',
        description: <>Enter the channel ID and click <strong className="text-white">Connect</strong> → a test message will arrive!</>,
      },
    ],
    formatTitle: 'Message format',
    msgNew: '📝 New article published!',
    msgTitle: 'Title',
    msgKeyword: 'Keyword',
    msgSite: 'Site',
    calloutBody: 'Only one Telegram channel can be connected per site. To disconnect, click the Disconnect button on the site card.',
  },
};

export async function TelegramPage({ locale: _locale }: Props) {
  const locale = (await getLocale()) as 'uz' | 'ru' | 'en';
  const c = CONTENT[locale] ?? CONTENT.uz;
  return (
    <div>
      <DocsPageHeader badge={c.badge} title={c.title} description={c.description} />

      <DocsH2>{c.connectTitle}</DocsH2>
      <StepList className="mb-8" steps={c.steps} />

      <DocsH2>{c.formatTitle}</DocsH2>
      <div className="p-4 rounded-xl bg-[#229ED9]/8 border border-[#229ED9]/20 text-sm text-zinc-300 mb-8 font-mono">
        <p className="text-[#229ED9] font-bold mb-2">{c.msgNew}</p>
        <p className="text-zinc-400 mb-1"><strong>{c.msgTitle}:</strong> Article title here</p>
        <p className="text-zinc-400 mb-1"><strong>{c.msgKeyword}:</strong> wordpress seo 2026</p>
        <p className="text-zinc-400 mb-1"><strong>{c.msgSite}:</strong> yoursite.com</p>
        <p className="text-[#229ED9] mt-2">🔗 https://yoursite.com/article-slug</p>
      </div>

      <Callout variant="info" title="Tip">{c.calloutBody}</Callout>
    </div>
  );
}
