export const dynamic = 'force-dynamic';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#FB3640] uppercase mb-4">Documentation</span>
          <h1 className="text-4xl font-extrabold text-white mb-3">Qo'llanma</h1>
          <p className="text-zinc-400 leading-relaxed">
            JetBlog ni o'rnatish va ishlatish bo'yicha to'liq qo'llanma.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 p-4 rounded-xl bg-white/3 border border-white/8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Mundarija</p>
          <ol className="space-y-1.5 text-sm">
            {[
              { num: '1', text: 'Boshlash' },
              { num: '1.1', text: 'WordPress Application Password yaratish' },
              { num: '1.2', text: 'JetBlog ga sayt ulash' },
              { num: '1.3', text: 'Kalit so\'z qo\'shish' },
              { num: '1.4', text: 'Maqola generatsiya qilish' },
              { num: '2', text: 'API & Webhook' },
              { num: '2.1', text: 'Webhook ulash' },
              { num: '2.2', text: 'Payload formati' },
              { num: '2.3', text: 'Signature tekshirish (HMAC)' },
            ].map(item => (
              <li key={item.num} className={`flex gap-2 ${item.num.includes('.') ? 'ml-4 text-zinc-500' : 'text-zinc-300 font-semibold'}`}>
                <span className="text-[#FB3640] shrink-0">{item.num}.</span>
                {item.text}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-14 text-zinc-400 leading-relaxed">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-white/8">1. Boshlash</h2>

            {/* 1.1 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">1.1</span>
                WordPress Application Password yaratish
              </h3>
              <p className="mb-4">JetBlog WordPress saytingizga ulanishi uchun Application Password kerak. Bu oddiy parol emas — faqat API uchun alohida parol.</p>

              <div className="space-y-3">
                {[
                  'WordPress admin paneliga kiring: <code>yoursite.com/wp-admin</code>',
                  '<strong>Users → Profile</strong> bo\'limiga o\'ting (yoki <strong>Users → Your Profile</strong>)',
                  'Pastga scroll qiling — <strong>"Application Passwords"</strong> bo\'limini toping',
                  'Application nomini kiriting (masalan: <code>JetBlog</code>) va <strong>"Add New Application Password"</strong> tugmasini bosing',
                  'Yaratilgan parolni nusxa oling — u faqat bir marta ko\'rsatiladi!',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <p className="text-xs text-amber-400">
                  ⚠️ WordPress 5.6 dan yuqori versiyalarda Application Passwords mavjud. Eski versiyalarda plugin o'rnatish kerak bo'lishi mumkin.
                </p>
              </div>
            </div>

            {/* 1.2 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">1.2</span>
                JetBlog ga sayt ulash
              </h3>
              <p className="mb-4">Dashboard → <strong className="text-white">Connections</strong> sahifasiga o'ting.</p>

              <div className="space-y-3">
                {[
                  '"Add New Site" tugmasini bosing',
                  'WordPress sayt URLini kiriting (masalan: <code>https://yoursite.com</code>)',
                  'WordPress foydalanuvchi nomini kiriting',
                  '1.1 da yaratgan Application Password ni kiriting',
                  '"Verify & Save" — JetBlog saytingizga ulanishni tekshiradi',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-zinc-400">
                  ✅ Muvaffaqiyatli ulangandan so'ng sayt "Connected" statusida ko'rinadi. WordPress API parollar AES-256-GCM bilan shifrlanib saqlanadi.
                </p>
              </div>
            </div>

            {/* 1.3 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">1.3</span>
                Kalit so'z qo'shish
              </h3>
              <p className="mb-4">Dashboard → <strong className="text-white">Keywords</strong> sahifasiga o'ting.</p>

              <div className="space-y-3">
                {[
                  'Saytni tanlang (agar bir nechta sayt bo\'lsa)',
                  '"Add Keyword" tugmasini bosing',
                  'Kalit so\'zni kiriting (masalan: <code>wordpress seo optimizatsiya</code>)',
                  'Tilni tanlang: O\'zbek / Rus / English',
                  '"Save" — kalit so\'z "pending" statusida qo\'shiladi',
                  'JetBlog search volume va difficulty ma\'lumotlarini avtomatik oladi',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>
            </div>

            {/* 1.4 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">1.4</span>
                Maqola generatsiya qilish
              </h3>
              <p className="mb-4">Dashboard → <strong className="text-white">Content</strong> sahifasiga o'ting.</p>

              <div className="space-y-3">
                {[
                  'Generatsiya qilmoqchi bo\'lgan kalit so\'zni tanlang',
                  '"Generate Article" tugmasini bosing',
                  'Claude AI maqola yozadi — bu 30-60 soniya olishi mumkin',
                  'DALL-E 3 avtomatik muqova rasm yaratadi',
                  'TipTap editorida maqolani ko\'rib chiqing va tahrirlang',
                  '"Publish to WordPress" tugmasini bosing — maqola saytingizda paydo bo\'ladi!',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-zinc-400">
                  💡 Har bir generatsiya 1 kredit sarflaydi. Brand voice sozlamalarini to'ldirsangiz, maqolalar saytingiz ohangida yoziladi.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-white/8">2. API & Webhook</h2>

            {/* 2.1 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">2.1</span>
                Webhook ulash
              </h3>
              <p className="mb-4">
                JetBlog maqola publish bo'lganda sizning serveringizga yoki Zapier/Make ga webhook yuborishi mumkin.
              </p>

              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Webhook sozlash</p>
                <div className="space-y-2 text-sm">
                  <p>Dashboard → <strong className="text-white">Connections → sayt → Webhook URL</strong> maydoniga URL kiriting.</p>
                  <p>JetBlog har bir muvaffaqiyatli publish da <code className="text-[#FB3640] bg-[#FB3640]/10 px-1 rounded">POST</code> so'rov yuboradi.</p>
                </div>
              </div>
            </div>

            {/* 2.2 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">2.2</span>
                Payload formati
              </h3>
              <p className="mb-4">Webhook so'rovining body quyidagi JSON formatda keladi:</p>

              <div className="rounded-xl overflow-hidden border border-white/8">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/8">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-xs text-zinc-500 ml-2">webhook-payload.json</span>
                </div>
                <pre className="p-4 text-xs text-[#00FF88] bg-[#000F08] overflow-x-auto leading-relaxed">
{`{
  "event": "article.published",
  "timestamp": "2026-05-22T09:00:00Z",
  "site_url": "https://yoursite.com",
  "article": {
    "id": "uuid",
    "title": "Maqola sarlavhasi",
    "keyword": "wordpress seo",
    "wp_post_id": 1234,
    "wp_post_url": "https://yoursite.com/maqola-slug",
    "featured_image_url": "https://...",
    "published_at": "2026-05-22T09:00:00Z"
  }
}`}
                </pre>
              </div>
            </div>

            {/* 2.3 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="text-[#FB3640] mr-2">2.3</span>
                Signature tekshirish (HMAC)
              </h3>
              <p className="mb-4">
                Webhook so'rovlari HMAC-SHA256 imzosi bilan keladi. Bu sizga so'rov JetBlog dan kelganini tekshirish imkonini beradi.
              </p>

              <div className="p-4 rounded-xl bg-white/3 border border-white/8 mb-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Request Header</p>
                <code className="text-sm text-[#FB3640]">X-JetBlog-Signature: sha256=abc123...</code>
              </div>

              <p className="text-sm mb-3">Server tomonida tekshirish (Node.js misol):</p>

              <div className="rounded-xl overflow-hidden border border-white/8">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/8">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-xs text-zinc-500 ml-2">verify-webhook.js</span>
                </div>
                <pre className="p-4 text-xs text-[#00FF88] bg-[#000F08] overflow-x-auto leading-relaxed">
{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express route misol
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-jetblog-signature'];
  const isValid = verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET);

  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

  // Ishlov bering...
  console.log('New article published:', req.body.article.title);
  res.json({ ok: true });
});`}
                </pre>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-zinc-400">
                  🔐 Webhook secret ni Dashboard → Connections → sayt sozlamalarida topasiz.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="p-4 rounded-xl bg-[#FB3640]/8 border border-[#FB3640]/20">
              <p className="text-white font-semibold mb-1">Savolingiz bormi?</p>
              <p className="text-zinc-400 text-sm mb-2">Qo'llanmada javob topa olmadingizmi? Bizga yozing:</p>
              <a href="mailto:support@jetblog.app" className="text-[#FB3640] text-sm hover:underline">support@jetblog.app</a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
