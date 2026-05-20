# TextPilot.AI — CLAUDE.md

WordPress saytlari uchun AI SEO autopilot SaaS. Claude API orqali maqola generatsiya qiladi, DALL-E 3 bilan muqova rasm yaratadi, WordPress REST API orqali avtomatik publish qiladi.

## Stack

- **Framework**: Next.js App Router (`next ^16`)
- **Auth + DB**: Supabase (`@supabase/auth-helpers-nextjs ^0.7.4`)
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk ^0.96.0`)
- **Image AI**: OpenAI DALL-E 3 (`openai ^6.38.0`)
- **UI**: Tailwind CSS, Radix UI, TipTap editor (`@tiptap/react ^3`)
- **Charts**: Recharts
- **Notifications**: node-telegram-bot-api, react-toastify
- **PDF**: pdfkit
- **Validation**: zod + react-hook-form

## Loyiha strukturasi

```
src/
├── app/
│   ├── (marketing)/          # Landing, pricing, FAQ
│   ├── auth/                 # Login, signup, magic-link, forgot-password
│   ├── dashboard/
│   │   ├── main/             # Overview (stats, charts)
│   │   ├── connections/      # WordPress saytlar boshqaruvi
│   │   ├── keywords/         # Kalit so'zlar tahlili
│   │   ├── content/          # Content Queue (maqolalar)
│   │   ├── brand-voice/      # Brand ovozi sozlamalari
│   │   └── settings/         # Profile, billing, subscription
│   └── api/
│       ├── auth-callback/    # Supabase OAuth callback
│       ├── generate/         # Claude AI maqola generatsiya
│       ├── keywords/fetch/   # Kalit so'z ma'lumotlarini olish
│       ├── sites/verify/     # WordPress sayt tekshirish
│       ├── wordpress/publish/ # WP REST API orqali publish
│       ├── cron/             # Avtomatik jadval (node-cron)
│       ├── invoice/generate/ # PDF invoice yaratish
│       ├── admin/pay-invoice/ # Admin: invoice to'lash
│       └── telegram/notify/  # Telegram kanal bildirish
├── components/
│   ├── ui/                   # Radix-based komponentlar + TipTapEditor
│   └── ...                   # Footer, MainLogo, MobileNav
├── lib/
│   ├── config/
│   │   ├── dashboard.ts      # Nav routes + pricing plans
│   │   ├── site.ts           # Sayt metadata
│   │   ├── auth.ts           # Auth konfiguratsiya
│   │   └── api.ts            # API konfiguratsiya
│   ├── types/
│   │   ├── supabase.ts       # ProfileT, SiteT, KeywordT, ArticleT, InvoiceT
│   │   ├── types.ts          # NavItem, ProductI, PlanI, ServerError
│   │   └── enums.ts          # IntervalE va boshqalar
│   └── utils/
│       ├── encryption.ts     # WP parol shifrlash/ochish
│       ├── helpers.ts        # Yordamchi funksiyalar
│       └── hooks.ts          # Custom React hooks
└── styles/
    └── ThemeProvider.tsx     # next-themes dark/light
```

## Database jadvallar (Supabase)

```typescript
ProfileT {
  id: string                  // auth.users.id bilan mos
  display_name?: string
  credits_remaining?: number  // AI generatsiya uchun kredit
  plan?: 'FREE' | 'STARTER' | 'PRO' | 'AGENCY'
  stripe_customer_id?: string
  subscription_id?: string
}

SiteT {
  id, user_id, url
  wp_username: string
  wp_password?: string        // SHIFRLANGAN — faqat serverda ishlatiladi
  brand_voice: { voice_description, tone, target_audience, rules[] }
  publish_days: string[]      // ['monday', 'wednesday', ...]
  publish_time: string        // '09:00'
  is_active: boolean
  telegram_chat_id?: string
}

KeywordT {
  id, site_id, keyword
  language: 'uz' | 'ru' | 'en'
  search_volume, difficulty: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approved_by_user: boolean
  article_id?: string
}

ArticleT {
  id, site_id, keyword_id, title, content
  featured_image_url?: string
  wp_post_id?: number
  status: 'draft' | 'scheduled' | 'published' | 'error'
  scheduled_for?, published_at?: string
  ai_tokens_used: number
  error_message?: string
}

InvoiceT {
  id, user_id
  amount_usd: number
  credits_to_add: number
  status: 'pending' | 'paid' | 'cancelled'
  invoice_pdf_url?: string
  paid_at?: string
}
```

## Pricing planlar

| Plan    | Narx (oylik) | Saytlar | Kalit so'zlar/oy | Maqolalar/oy |
|---------|-------------|---------|------------------|--------------|
| Free    | $0          | 1       | 10               | 2            |
| Starter | $19         | 3       | 100              | 20           |
| Pro     | $49         | 10      | 500              | 80           |
| Agency  | $99         | Cheksiz | Cheksiz          | 200          |

Price ID formatlar: `plan_free`, `plan_starter_monthly`, `plan_starter_yearly`, `plan_pro_monthly`, `plan_pro_yearly`, `plan_agency_monthly`, `plan_agency_yearly`

## Auth oqimi

1. Foydalanuvchi `/auth/signup` yoki `/auth/login` sahifasiga kiradi
2. Supabase Auth email/parol yoki magic link bilan ishlaydi
3. Email tasdiqlash: `/api/auth-callback?code=...` → `exchangeCodeForSession` → `/dashboard/main`
4. Xato bo'lsa: `/auth/login` ga redirect

`src/app/api/auth-callback/route.ts` — `createRouteHandlerClient({ cookies })` pattern ishlatiladi (cookies funksiyasini to'g'ridan-to'g'ri reference sifatida berish, await qilmasdan).

## AI generatsiya oqimi

1. Dashboard: foydalanuvchi keyword tanlaydi va generatsiya bosadi
2. `POST /api/generate` → kredit tekshiruvi → Claude API chaqiruvi
3. Brand voice sozlamalari prompt ga qo'shiladi
4. DALL-E 3 orqali featured image yaratiladi
5. Natija `articles` jadvaliga `draft` statusida saqlanadi
6. Foydalanuvchi TipTap editorida tahrirlaydi
7. `POST /api/wordpress/publish` → WP REST API → `articles.wp_post_id` yangilanadi

## WordPress integratsiya

- `wp_password` shifrlangan holda saqlanadi (`src/lib/utils/encryption.ts`)
- `POST /api/sites/verify` saytni tekshiradi: WP REST API ga test so'rov yuboradi
- Publish: `Authorization: Basic base64(username:password)` header ishlatiladi
- WP REST API endpoint: `{site_url}/wp-json/wp/v2/posts`

## Musbat muhit o'zgaruvchilari (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ENCRYPTION_KEY=              # WP parollarni shifrlash uchun
TELEGRAM_BOT_TOKEN=
CRON_SECRET=                 # /api/cron ni himoya qilish uchun
```

## Muhim qoidalar

### Supabase client ishlatiladigan joy
- **Server components / Route handlers**: `createRouteHandlerClient({ cookies })` yoki `createServerComponentClient({ cookies })`
- **Client components**: `createClientComponentClient()`
- `cookies` ni HECH QACHON `await` qilib route handler ga bermang — to'g'ridan-to'g'ri reference bering

### Kredit tizimi
- Har bir maqola generatsiyasi kredit sarflaydi
- Kredit `profiles.credits_remaining` da saqlanadi
- Plan limiti `configuration.products` da aniqlanadi (`src/lib/config/dashboard.ts`)
- Kredit tugaganda: `InvoiceT` yaratiladi → admin tasdiqlaydi → kredit qo'shiladi

### TypeScript
- `any` ishlatmang — `supabase.ts` dagi tiplarni ishlating
- Server-only kod: `import 'server-only'` qo'shing
- Client-only kod: `import 'client-only'` qo'shing

### Komponentlar
- UI komponentlar: `src/components/ui/` (Radix-based)
- Page-specific komponentlar: har bir dashboard sahifasida `_PageSections/` papkasida
- TipTap editor: `src/components/ui/TipTapEditor.tsx` — maqola tahrirlash uchun

## Dev buyruqlari

```bash
npm run dev          # localhost:3000 da ishga tushirish
npm run build        # production build
npm run lint         # ESLint tekshiruvi
npm test             # Jest testlari
npm run e2e          # Cypress E2E testlari
npm run stripe:listen # Stripe webhook (agar kerak bo'lsa)
```

## Keng tarqalgan xatolar va yechimlari

| Xato | Sabab | Yechim |
|------|-------|--------|
| 500 `/api/auth-callback` | `cookies()` ni await qilib berish | `cookies` ni reference sifatida bering |
| WP publish 401 | Shifrlangan parol noto'g'ri ochilgan | `ENCRYPTION_KEY` ni tekshiring |
| DALL-E rasm yo'q | OpenAI API xato | `OPENAI_API_KEY` va prompt uzunligini tekshiring |
| Dashboard bo'sh ma'lumot | Supabase RLS policy | `profiles` jadvalidagi RLS politikalarini tekshiring |
| Kredit kamaymaayapti | Generatsiya xatosi | `/api/generate` route dagi kredit deduction mantiqini tekshiring |
