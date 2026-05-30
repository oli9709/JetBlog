import React from 'react';
import { DocsPageHeader, DocsH2, DocsH3, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

const TROUBLESHOOT = [
  {
    problem: 'Connection failed / 401 Unauthorized',
    solution: 'Application Password noto\'g\'ri kiritilgan. Parolni qayta nusxalab kiriting — bo\'shliqlar (space) ham kiradi.',
  },
  {
    problem: 'REST API disabled',
    solution: 'Ba\'zi hostinglar WP REST API ni o\'chiradi. Hosting panelida yoki .htaccess da tekshiring.',
  },
  {
    problem: 'Application Passwords bo\'limi yo\'q',
    solution: 'WordPress 5.6 dan past versiya. wp-admin → Plugins → Add New → "Application Passwords" plugin o\'rnating.',
  },
  {
    problem: 'Publish qilinganda maqola draft holatida qoladi',
    solution: 'WP foydalanuvchingiz "Editor" yoki "Administrator" roliga ega emasligini tekshiring.',
  },
];

export function WordPressPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Platformalar"
        title="WordPress"
        description="WordPress REST API va Application Password orqali JetBlog ga ulang. WordPress 5.6+ talab qilinadi."
      />

      <DocsH2>Application Password yaratish</DocsH2>
      <Callout variant="info" className="mb-6">
        Application Password — oddiy parolingiz emas. Bu faqat API uchun alohida parol bo&apos;lib, asosiy parolingiz xavfsiz qoladi.
      </Callout>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'WP Admin ga kiring',
            description: <><InlineCode>yoursite.com/wp-admin</InlineCode> ga o&apos;ting va administrator hisobiga kiring</>,
          },
          {
            title: 'Profile ga o\'ting',
            description: <>Chap menuda <strong className="text-white">Users → Your Profile</strong> (yoki Users → Profile) ni bosing</>,
          },
          {
            title: 'Application Passwords toping',
            description: 'Sahifaning eng pastiga scroll qiling — "Application Passwords" bo\'limini toping',
          },
          {
            title: 'Yangi parol yarating',
            description: <>Nom kiriting (masalan: <InlineCode>JetBlog</InlineCode>) → <strong className="text-white">"Add New Application Password"</strong> tugmasini bosing</>,
          },
          {
            title: 'Parolni saqlang',
            description: 'Yaratilgan parolni HOZIROQ nusxalab oling — u faqat bir marta ko\'rsatiladi! Format: xxxx xxxx xxxx xxxx xxxx xxxx',
          },
        ]}
      />

      <DocsH2>JetBlog da ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish</strong> → <strong className="text-white">WordPress</strong> tanlang</>,
          },
          {
            description: <><strong className="text-white">Site URL</strong>: <InlineCode>https://yoursite.com</InlineCode> (slash &apos;/&apos; siz)</>,
          },
          {
            description: <><strong className="text-white">WP Username</strong>: WordPress login nomingiz (email emas, username)</>,
          },
          {
            description: <><strong className="text-white">Application Password</strong>: Yuqorida nusxalagan parolingiz</>,
          },
          {
            description: <><strong className="text-white">Test connection</strong> → 3 bosqich tekshiriladi → Muvaffaqiyatli ulandi!</>,
          },
        ]}
      />

      <DocsH2>Ulanishni tekshirish (curl)</DocsH2>
      <DocsPara>Qo&apos;lda tekshirish uchun terminal da:</DocsPara>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`curl -u "your_username:xxxx xxxx xxxx xxxx xxxx xxxx" \\
  https://yoursite.com/wp-json/wp/v2/posts \\
  -X GET`}
        className="mb-8"
      />

      <DocsH2>Muammolar va yechimlari</DocsH2>
      <div className="flex flex-col gap-3 mb-8">
        {TROUBLESHOOT.map((t) => (
          <div key={t.problem} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <DocsH3>{t.problem}</DocsH3>
            <p className="text-sm text-zinc-400">{t.solution}</p>
          </div>
        ))}
      </div>

      <Callout variant="success" title="Xavfsizlik">
        JetBlog Application Password ni AES-256-GCM shifrlash bilan saqlaydi. Parolingiz hech qachon ochiq holda saqlanmaydi.
      </Callout>
    </div>
  );
}
