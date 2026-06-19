import React from 'react';
import { DocsPageHeader, DocsH2, DocsPara } from '../DocsPageHeader';
import { StepList } from '../StepList';
import { CodeBlock, InlineCode } from '../CodeBlock';
import { Callout } from '../Callout';

export function WebflowPage() {
  return (
    <div>
      <DocsPageHeader
        badge="Platformalar"
        title="Webflow"
        description="Webflow CMS Collection Data API v2 orqali maqolalarni avtomatik nashr qiling."
      />

      <Callout variant="warning" title="Plan talabi" className="mb-8">
        Webflow <strong>Free plan</strong> da CMS API mavjud emas.
        CMS API faqat <strong>Basic ($14/oy)</strong> va undan yuqori planlarda ishlaydi.
      </Callout>

      {/* ── API Token ─────────────────────────────────────────────────────── */}
      <DocsH2>API Token olish</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Webflow Dashboard ga kiring',
            description: <><InlineCode>webflow.com</InlineCode> → loyihangizni oching</>,
          },
          {
            title: 'Site Settings → Integrations',
            description: <>Loyiha sozlamalari → <strong className="text-white">Integrations → API Access</strong></>,
          },
          {
            title: "Token yarating — to'g'ri ruxsatlar bilan",
            description: (
              <>
                <strong className="text-white">Generate API Token</strong> → ruxsatlar:
                <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
                  <li><InlineCode>sites:read</InlineCode> — saytlar ro&apos;yxati</li>
                  <li><InlineCode>cms:read</InlineCode> — kolleksiya va maydon ma&apos;lumotlari</li>
                  <li><InlineCode>cms:write</InlineCode> — maqola yaratish va nashr qilish</li>
                </ul>
              </>
            ),
          },
          {
            title: 'Token ni nusxalab oling',
            description: 'Token faqat bir marta ko\'rsatiladi — darhol saqlang.',
          },
        ]}
      />

      {/* ── Ulanish jarayoni ─────────────────────────────────────────────── */}
      <DocsH2>JetBlog da ulash</DocsH2>
      <StepList
        className="mb-8"
        steps={[
          {
            title: 'Connections → Sayt qo\'shish → Webflow',
            description: <>Dashboard → <strong className="text-white">Connections → Sayt qo&apos;shish → Webflow</strong> tanlang</>,
          },
          {
            title: 'API Token kiriting',
            description: (
              <>Yuqorida yaratgan tokenni kiriting → <strong className="text-white">Saytlarni yuklash</strong> tugmasini bosing</>
            ),
          },
          {
            title: 'Sayt va Kolleksiyani tanlang',
            description: (
              <>Tokenga ulangan saytlar ro&apos;yxatidan keraklisini → keyin blog maqolalari uchun CMS kolleksiyasini tanlang</>
            ),
          },
          {
            title: 'Maydonlarni xaritang',
            description: (
              <>
                Kolleksiya maydonlari ko&apos;rsatiladi. Xaritalash:
                <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
                  <li><strong className="text-white">Kontent maydoni</strong> (majburiy) — HTML maqola matni uchun RichText maydoni</li>
                  <li><strong className="text-white">Sarlavha maydoni</strong> (ixtiyoriy) — <InlineCode>name</InlineCode> tizim maydoni doim to&apos;ldiriladi</li>
                  <li><strong className="text-white">Xulosa maydoni</strong> (ixtiyoriy) — SEO meta tavsifi</li>
                  <li><strong className="text-white">Rasm maydoni</strong> (ixtiyoriy) — muqova rasm</li>
                </ul>
              </>
            ),
          },
          {
            title: 'Test Connection → Tayyor!',
            description: 'Kolleksiya tekshiriladi — muvaffaqiyatli bo\'lsa sayt saqlanadi.',
          },
        ]}
      />

      {/* ── adapter_config sxemasi ───────────────────────────────────────── */}
      <DocsH2>Texnik: adapter_config sxemasi</DocsH2>
      <DocsPara>
        Quyidagi ma&apos;lumotlar <InlineCode>sites.adapter_config</InlineCode> JSONB maydonida shifrlangan holda saqlanadi.
        <InlineCode>apiToken</InlineCode> AES-256-GCM bilan shifrlangan.
      </DocsPara>
      <CodeBlock
        language="typescript"
        filename="WebflowAdapterConfig"
        code={`type WebflowAdapterConfig = {
  apiToken:       string;   // AES-256-GCM encrypted Webflow Site API Token
  siteId:         string;   // Webflow site ID  (e.g. "64a1b2c3d4e5f6a7b8c9d0e1")
  collectionId:   string;   // CMS Collection ID
  collectionSlug: string;   // collection URL slug (e.g. "blog-posts") — for URL construction
  siteDomain:     string;   // primary domain   (e.g. "example.webflow.io")
  fieldMap: {
    body:     string;         // REQUIRED — RichText field slug for article HTML
    title?:   string;         // optional custom PlainText field for title
                              // ('name' system field is always set from article.title)
    summary?: string;         // optional PlainText field for SEO description
    image?:   string;         // optional Image field for featured image
  };
};`}
        className="mb-8"
      />

      {/* ── Nashr jarayoni ───────────────────────────────────────────────── */}
      <DocsH2>Nashr jarayoni</DocsH2>
      <DocsPara>
        JetBlog Webflow Data API v2 orqali maqolani nashr qilganda:
      </DocsPara>
      <StepList
        className="mb-8"
        steps={[
          {
            description: (
              <>
                <InlineCode>POST /v2/collections/{'{collectionId}'}/items</InlineCode> chaqiriladi —
                <InlineCode>isDraft: false</InlineCode> bilan (darhol LIVE nashr)
              </>
            ),
          },
          {
            description: (
              <>
                <InlineCode>fieldData</InlineCode> da doim:
                <InlineCode>name</InlineCode> (sarlavha) va
                <InlineCode>slug</InlineCode> (noyob URL slug) o&apos;rnatiladi
              </>
            ),
          },
          {
            description: 'Xaritalangan maydonlar (body, summary, image) fieldData ga qo\'shiladi',
          },
          {
            description: (
              <>
                Live URL quyidagicha quriladi:
                <InlineCode>https://&#123;domain&#125;/&#123;collectionSlug&#125;/&#123;itemSlug&#125;</InlineCode>
              </>
            ),
          },
          {
            description: 'Rasm: Image maydoniga { url, alt } shaklida uzatiladi — xato bo\'lsa ham nashr davom etadi (non-fatal)',
          },
        ]}
      />

      {/* ── API tekshiruv ────────────────────────────────────────────────── */}
      <DocsH2>API dan foydalanishni tekshirish</DocsH2>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Saytlar ro'yxati
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.webflow.com/v2/sites

# Kolleksiya maydonlarini ko'rish
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.webflow.com/v2/collections/YOUR_COLLECTION_ID

# Test: CMS item yaratish
curl -X POST \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"isDraft":false,"isArchived":false,"fieldData":{"name":"Test Maqola","slug":"test-maqola","YOUR_BODY_FIELD":"<p>Salom dunyo!</p>"}}' \\
  https://api.webflow.com/v2/collections/YOUR_COLLECTION_ID/items`}
        className="mb-8"
      />

      {/* ── Keng tarqalgan xatolar ───────────────────────────────────────── */}
      <DocsH2>Keng tarqalgan xatolar</DocsH2>

      <Callout variant="warning" title="402 — CMS API mavjud emas" className="mb-4">
        Webflow bepul rejada CMS API ishlaydi. <strong>Basic ($14/oy)</strong> rejaga o&apos;ting.
      </Callout>

      <Callout variant="info" title="401/403 — Token noto'g'ri" className="mb-4">
        Token <InlineCode>cms:read</InlineCode> va <InlineCode>cms:write</InlineCode> ruxsatlariga ega ekanligini tekshiring.
        Site Settings → Integrations da yangi token yarating.
      </Callout>

      <Callout variant="info" title="Rasm ko'rinmaydi" className="mb-4">
        Webflow Image maydoni URL dan rasm olib ko&apos;rsatadi. Agar rasm ko&apos;rinmasa,
        Webflow Designer da item ni ochib rasimni qayta yuklang. Nashr jarayoni rasm xatosida ham to&apos;xtamaydi.
      </Callout>
    </div>
  );
}
