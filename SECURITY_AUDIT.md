# Security Audit — JetBlog / TextPilot.AI
**Sana:** 2026-06-19  
**Auditor:** Claude (automated review)

---

## ✅ Tuzatilgan muammolar

### 1. Encryption — qattiq kodlangan zahira kalit
**Muammo:** `src/lib/utils/encryption.ts` da `SUPABASE_VAULT_KEY` yo'q bo'lsa `'default_vault_secret_key_32_chars_long_jetblog'` kabi qattiq kodlangan kalit ishlatilgan.  
**Xatar:** Ilovaning har bir o'rnatilmasida bir xil kalit → barcha shifrlanganlar buzilishi mumkin.  
**Tuzatish:** `SUPABASE_VAULT_KEY` yo'q yoki 32 belgidan qisqa bo'lsa modul yuklanganda xatolik otadi (fail-fast). `encryptText` va `decryptText` xato bo'lganda plaintext qaytarmaydi, `CredentialDecryptError` otadi.

---

### 2. Ghost va Webhook adapter_config — shifrsiz saqlangan
**Muammo:** `POST /api/sites/verify` Ghost `adminApiKey` va Webhook `secretKey` ni `adapter_config` JSONB maydoniga shifrlanmagan holda yozgan.  
**Xatar:** DB dump yoki Supabase dashboard orqali kalitlar ochiq ko'rinadi.  
**Tuzatish:** Barcha adapter sirlarini yozishda `encryptText()` chaqiriladi; o'qishda `getAdapter()` ichida `decryptText()` chaqiriladi.

---

### 3. Cron endpoint — autentifikatsiya yo'q
**Muammo:** `CRON_SECRET` muhit o'zgaruvchisi bo'lmasa `isAuthorized()` `true` qaytargan.  
**Xatar:** Ixtiyoriy shaxs `POST /api/cron` ga so'rov yuborib autopilotni ishga tushira olgan (kredit sarflanadi, maqolalar publish bo'ladi).  
**Tuzatish:** `if (!cronSecret) return false;` — CRON_SECRET yo'q bo'lsa hech qachon ruxsat berilmaydi.

---

### 4. Root papkasidagi skriptlar — qattiq kodlangan sirlar
**Muammo:** Uchta skriptda (`check_users.js`, `reset_password.js`, `update_credits.js`) to'g'ridan-to'g'ri Supabase URL + service role key yozilgan edi.  
**Xatar:** Git tarixida saqlanib qoladi; bu fayllar repo da ommaga ochiq bo'lgan bo'lsa sirlar qo'lga kiritilgan.  
**Tuzatish:**
- Eski fayllar bo'shatildi va "eskirgan" xabari bilan almashtildi
- `scripts/check-users.js`, `scripts/reset-password.js`, `scripts/update-credits.js` — env vars orqali ishlaydi
- `scripts/backfill-encrypt-adapter-config.js` — adapter_config ni bir martalik qayta shifrlash

---

### 5. RLS — `subscriptions` jadvalidagi bo'shliq
**Muammo:** `public.subscriptions` jadvalida RLS yoqilmagan edi.  
**Xatar:** Autentifikatsiya bo'lgan har qanday foydalanuvchi barcha obunalarni ko'ra olgan.  
**Tuzatish:** `supabase/migrations/20260619000200_rls_gap_fix.sql` — RLS yoqildi va uchta policy qo'shildi: foydalanuvchi o'z obunasini ko'radi/yangilaydi, service_role barcha amallarni bajaradi.

---

### 6. Admin marshrutlar — tekshiruv
**Holat:** `src/app/api/admin/` ostidagi to'rtta marshrut (`pay-invoice`, `add-credits`, `users`, `invoices`) allaqachon `profiles.is_admin` ni service-role client orqali tekshirgan edi. O'zgartirish talab qilinmadi.

---

## 🔴 Siz AYLANTIRISHINGIZ kerak bo'lgan sirlar

Quyidagi sirlar Git tarixiga tushgan (agar repo ommaviy bo'lgan bo'lsa ular buzilgan hisoblanadi):

| Sir | Joyi | Harakat |
|-----|------|---------|
| **Supabase Service Role Key** | `check_users.js`, `reset_password.js`, `update_credits.js` (eski root versiyalar) | Supabase dashboard → Settings → API → "Revoke" va yangi kalit oling |
| **Supabase Project URL** | Yuqoridagi fayllar | URL ommaviy ma'lumot, lekin keyingi qadamlar uchun hozircha saqlash mumkin |
| **SUPABASE_VAULT_KEY** | Agar hech qachon o'rnatilmagan bo'lsa, default kalit ishlatilgan — shu kalit bilan shifrlangan barcha satrlar buzilgan | Yangi 32+ belgili kalit o'rnating, keyin `scripts/backfill-encrypt-adapter-config.js` ni ishga tushiring |

### Tekshirish ro'yxati (insoniy bajarish talab etiladi)

- [ ] Supabase Dashboard → Settings → API → Service Role Key ni aylantiring
- [ ] `.env.local` dagi `SUPABASE_VAULT_KEY` ni yangi, kuchli kalit bilan almashtiring (32+ belgi)
- [ ] `SUPABASE_VAULT_KEY` almashtirilgandan so'ng `scripts/backfill-encrypt-adapter-config.js` ni ishga tushiring:
  ```bash
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_VAULT_KEY=... \
  node scripts/backfill-encrypt-adapter-config.js
  ```
- [ ] `CRON_SECRET` o'rnatilgan va kamida 32 belgili ekanligini tasdiqlang
- [ ] `ANTHROPIC_API_KEY` ni Anthropic Console dan aylantiring (agar repo ommaviy bo'lgan bo'lsa)
- [ ] `OPENAI_API_KEY` ni OpenAI dashboard dan aylantiring (agar repo ommaviy bo'lgan bo'lsa)
- [ ] `TELEGRAM_BOT_TOKEN` ni @BotFather orqali aylantiring (agar repo ommaviy bo'lgan bo'lsa)
- [ ] Git tarixini tozalash: `git filter-repo` yoki BFG Repo-Cleaner bilan eski skriptlardagi sirlarni tarixdan o'chirsangiz bo'ladi (lekin agar repo ommaviy bo'lgan bo'lsa shu vaqtgacha kalitlar keshlanib qolgan bo'lishi mumkin — aylantirishni ustuvor qiling)

---

## ⚠️ Qolgan xatarlar

| Xatar | Daraja | Tavsiya |
|-------|--------|---------|
| Git tarixida xom sirlar | Yuqori | Kalitlarni aylantirishni birinchi o'ringa qo'ying; keyin `git filter-repo` bilan tarixni tozalang |
| `adapter_config` dagi eski plaintext yozuvlar | O'rta | `backfill-encrypt-adapter-config.js` ni ishga tushirgandan so'ng bartaraf etiladi |
| WordPress parollar DB da shifrlangan, lekin VAULT_KEY default bo'lsa buzilgan | Yuqori | VAULT_KEY aylantirilgandan so'ng sites jadvalidagi barcha WP parollar ham qayta yozilishi kerak (hozirda avtomatik script yo'q — qo'lda yoki keyingi migration) |
| `test_anthropic_scratch.js` | Past | Hech qanday sir yo'q, xavfsiz |

---

## 📁 Yangi fayl strukturasi

```
scripts/
├── check-users.js                     # Env vars orqali (xavfsiz)
├── reset-password.js                  # Env vars + NEW_PASSWORD (xavfsiz)
├── update-credits.js                  # Env vars orqali (xavfsiz)
└── backfill-encrypt-adapter-config.js # Bir martalik, idempotent

check_users.js      → "eskirgan" placeholder (sirlar o'chirildi)
reset_password.js   → "eskirgan" placeholder (sirlar o'chirildi)
update_credits.js   → "eskirgan" placeholder (sirlar o'chirildi)
```
