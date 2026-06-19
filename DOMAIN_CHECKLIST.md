# Domain Migration Checklist — jetblog.app

Bu fayldagi barcha o'zgarishlar **kod tashqarisida** (tashqi panellarda) bajarilishi kerak.
Kod tomonidagi barcha o'zgarishlar `NEXT_PUBLIC_DOMAIN` muhit o'zgaruvchisiga asoslangan holda
`src/lib/config/site.ts` → `getBaseUrl()` orqali markazlashtirilgan.

---

## 1. Vercel — Muhit o'zgaruvchilari

**Qayerda:** Vercel Dashboard → loyiha → Settings → Environment Variables

| O'zgaruvchi | Qiymat | Muhit |
|---|---|---|
| `NEXT_PUBLIC_DOMAIN` | `https://jetblog.app` | Production |
| `NEXT_PUBLIC_DOMAIN` | `http://localhost:3000` | Development (mavjud) |

**Keyin:** Production deployment ni qayta ishga tushiring (Redeploy).

> ⚠️ `NEXT_PUBLIC_DOMAIN` o'rnatilmasa, kod `https://jetblog.app` ga fallback qiladi —
> lekin ochiq o'rnatish xatolarni oldini oladi va `.env.example` bilan moslikni ta'minlaydi.

---

## 2. Supabase Auth — URL sozlamalari

**Qayerda:** Supabase Dashboard → Authentication → URL Configuration

### Site URL
```
https://jetblog.app
```

### Redirect URLs (hammasi qo'shilishi kerak)
```
https://jetblog.app/**
https://jetblog.app/api/auth-callback
https://jetblog.app/auth/confirm
http://localhost:3000/**          ← mahalliy dev uchun
http://localhost:3000/api/auth-callback
```

> 📌 Eski vercel.app URL larni (`jet-blog-zeta.vercel.app`, `jet-blog-tau.vercel.app`) o'chirib tashlang.

---

## 3. Google OAuth — Cloud Console

**Qayerda:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client

### Authorized JavaScript Origins
```
https://jetblog.app
http://localhost:3000
```

### Authorized Redirect URIs
```
https://[your-supabase-project].supabase.co/auth/v1/callback
https://jetblog.app/api/auth-callback
http://localhost:3000/api/auth-callback
```

> 📌 Supabase OAuth callback URL ni ham qo'shing (Supabase Dashboard → Auth → Providers → Google).

---

## 4. Google Search Console Indexing API (GSC OAuth)

**Qayerda:** Google Cloud Console → APIs → OAuth 2.0 Client (GSC uchun alohida client bo'lsa)

### Authorized Redirect URIs
```
https://jetblog.app/api/gsc/callback
http://localhost:3000/api/gsc/callback
```

> 📌 `src/app/api/gsc/callback/route.ts` da redirect URI `getBaseUrl()` orqali quriladi.

---

## 5. DNS / Kanonik URL

| Element | Holat | Tavsiya |
|---|---|---|
| Apex domain `jetblog.app` | Asosiy domain | Vercel ga A/CNAME |
| `www.jetblog.app` | Redirect | `jetblog.app` ga 301 redirect |
| Eski vercel.app URL lar | Yopilishi kerak | Vercel loyihasida custom domain o'chirib qo'ying |

**SEO uchun:** `www.jetblog.app` → `https://jetblog.app` 301 redirect o'rnating
(Vercel → Domains → `www.jetblog.app` qo'shing → "Redirect" rejimida).

---

## 6. Upstash QStash (Autopilot)

**Qayerda:** [console.upstash.com](https://console.upstash.com) → QStash

Vercel da qo'shimcha o'rnatilishi kerak bo'lgan muhit o'zgaruvchilari:

| O'zgaruvchi | Manba |
|---|---|
| `QSTASH_TOKEN` | QStash → Publish token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash → Signing keys |
| `QSTASH_NEXT_SIGNING_KEY` | QStash → Signing keys |

QStash worker URL: `https://jetblog.app/api/cron/site`

---

## 7. Tekshirish ro'yxati (deploy dan keyin)

- [ ] `https://jetblog.app/sitemap.xml` — jetblog.app URL larni ko'rsatadi
- [ ] `https://jetblog.app/robots.txt` — Sitemap: `https://jetblog.app/sitemap.xml`
- [ ] `view-source:https://jetblog.app` — `<link rel="canonical" href="https://jetblog.app">` va `og:url`
- [ ] Email signup → redirect URL emailda `https://jetblog.app/api/auth-callback` ko'rinadi
- [ ] Magic link → `https://jetblog.app` ga yo'naltiradi
- [ ] `https://jetblog.app/api/cron?secret=...` → `{"success":true}` qaytaradi
- [ ] Eski `jet-blog-zeta.vercel.app` → `https://jetblog.app` ga 301 redirect qiladi

---

## Kod tomonida bajarilgan o'zgarishlar (ma'lumot uchun)

| Fayl | O'zgarish |
|---|---|
| `src/lib/config/site.ts` | `getBaseUrl()` va `SITE_URL` eksport qilindi — yagona haqiqat manbai |
| `src/app/layout.tsx` | `metadataBase`, OG, canonical → `SITE_URL` dan o'qiydi |
| `src/app/sitemap.ts` | `SITE_URL` dan o'qiydi |
| `public/robots.txt` | `jet-blog-zeta.vercel.app` → `https://jetblog.app` |
| `src/lib/API/Services/supabase/auth.ts` | `process.env.NEXT_PUBLIC_DOMAIN` → `getBaseUrl()` |
| `src/app/api/publish/route.ts` | Telegram notify origin → `getBaseUrl()` |
| `src/app/api/wordpress/publish/route.ts` | Telegram notify origin → `getBaseUrl()` |
| `.env.example` | `NEXT_PUBLIC_DOMAIN` uchun to'liq izoh qo'shildi |
