import React from 'react';
import { DocsPageHeader, DocsH2 } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { Callout } from '../Callout';
import { InlineCode } from '../CodeBlock';

export function TelegramPage({ locale: _locale }: { locale?: string } = {}) {
  return (
    <div>
      <DocsPageHeader
        badge="Integratsiyalar"
        title="Telegram bildirish"
        description="Maqola nashr qilinganda Telegram kanalingizga avtomatik xabar yuboriladi."
      />

      <DocsH2>Ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'JetBlog botini kanalingizga qo\'shing',
            description: <>Telegram da <InlineCode>@JetBlogBot</InlineCode> ni topib kanalingizga admin sifatida qo&apos;shing</>,
          },
          {
            title: 'Kanal ID ni oling',
            description: <><InlineCode>@userinfobot</InlineCode> ga kanalingizdan istalgan xabarni forward qiling — u ID ni beradi (format: <InlineCode>-100XXXXXXXXX</InlineCode>)</>,
          },
          {
            title: 'JetBlog da ulang',
            description: <>Dashboard → Connections → Sayt kartasida <strong className="text-white">Telegram ulash</strong> tugmasini bosing</>,
          },
          {
            title: 'ID kiriting',
            description: <>Kanal ID ni kiriting va <strong className="text-white">Ulash</strong> → Test xabar keladi!</>,
          },
        ]}
      />

      <DocsH2>Xabar formati</DocsH2>
      <div className="p-4 rounded-xl bg-[#229ED9]/8 border border-[#229ED9]/20 text-sm text-zinc-300 mb-8 font-mono">
        <p className="text-[#229ED9] font-bold mb-2">📝 Yangi maqola nashr qilindi!</p>
        <p className="text-zinc-400 mb-1"><strong>Sarlavha:</strong> Maqola sarlavhasi</p>
        <p className="text-zinc-400 mb-1"><strong>Kalit so&apos;z:</strong> wordpress seo 2026</p>
        <p className="text-zinc-400 mb-1"><strong>Sayt:</strong> yoursite.com</p>
        <p className="text-[#229ED9] mt-2">🔗 https://yoursite.com/maqola-slug</p>
      </div>

      <Callout variant="info" title="Tip">
        Bir saytga faqat bitta Telegram kanal ulash mumkin. Uzish uchun sayt kartasidagi <strong>Uzish</strong> tugmasini bosing.
      </Callout>
    </div>
  );
}
