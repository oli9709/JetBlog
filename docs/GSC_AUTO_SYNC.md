# GSC Keyword Auto-Discovery

Google Search Console'даgi haftalik ma'lumotlardan avtomatik SEO keyword'lar topib qo'yish.

---

## Ikki qatlamli ishlash

### 1. Haftalik cron (asosiy)
Har dushanba 05:00 UTC — barcha faol saytlar (GSC ulanган) uchun `syncGscKeywordsForSite(siteId, 20)` chaqiriladi. Har sayt uchun eng yaxshi 20 ta yangi keyword `pending` statusда qo'shiladi.

### 2. Autopilot safety net (fallback)
Autopilot ishga tushganда `keywords` jadvalida `approved`/`pending` bo'lgan keyword yo'q bo'lsa — GSC'дan **1 ta** keyword olishga urinadi. Muvaffaqiyat bo'lsa shu keyword bilan generatsiya davom etadi. Aks holda "keyword topilmadi" bilan skip.

Bu ikkisi bir-birini to'ldiradi: cron rejalashtirilgan, safety net esa "unutish" holatida jonlantiruvchi.

---

## Filter va ranking

Keyword `pending` statusга qo'shilishi uchun:
- `impressions >= 5` (past — noise)
- `position >= 3` (top-1/2 allaqachon zo'r, keraksiz)
- `clicks < impressions` (ular teng bo'lsa allaqachon maksimum ishlаyapti)

Ranking formulasi:
```
score = impressions * (1 - min(clicks/impressions, 1)) * (1 / max(position, 1))
```
Ma'nosi: ko'p ko'rilgan, kam bosilgan, past pozitsiyada — eng katta yutuq imkoniyati.

---

## Migration deploy

Prod Supabase → SQL Editor:

```sql
ALTER TABLE keywords
  ADD COLUMN IF NOT EXISTS source text
    CHECK (source IN ('manual','gsc_auto','ai_suggested')) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS gsc_impressions int,
  ADD COLUMN IF NOT EXISTS gsc_position numeric(5,2),
  ADD COLUMN IF NOT EXISTS gsc_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS keywords_site_keyword_unique
  ON keywords (site_id, LOWER(keyword));
```

---

## QStash schedule qo'shish

**QStash Dashboard → Schedules → Create Schedule**:

| Field | Value |
|---|---|
| Destination URL | `https://www.jetblog.app/api/cron/gsc-sync` |
| Method | `POST` |
| Cron expression | `0 5 * * 1` (dushanba 05:00 UTC) |
| Headers | `Authorization: Bearer <CRON_SECRET>` |
| Retry | 3 |
| Timeout | 300s |

Alternative — Vercel Cron (`vercel.json`):
```json
{
  "crons": [
    { "path": "/api/cron/gsc-sync?secret=<CRON_SECRET>", "schedule": "0 5 * * 1" }
  ]
}
```

---

## Env

Yangi env **kerak emas**. Mavjud `CRON_SECRET` + GSC OAuth (`gsc_tokens` jadval) yetadi.

---

## Test qadamlar

1. GSC ulanган sayt uchun qo'lda cron chaqir:
   ```bash
   curl -X POST 'https://www.jetblog.app/api/cron/gsc-sync?secret=YOUR_CRON_SECRET'
   ```
2. Javob: `{ ok: true, sites_processed: N, total_added: X, per_site: [...] }`
3. Vercel Logs: `[cron/gsc-sync]` va `[gsc-discover]` prefix bilan qadam-baqadam
4. Keywords sahifasiga o'ting → yangi keyword'larда **GSC (auto)** yashil badge

Safety net test:
1. Keyword'larni barcha o'chirib qo'ying
2. Autopilot cron ishlashini kuting yoki qo'lda ishga tushiring
3. Log'da: `[Worker] Keyword bo'sh — GSC dan sinash: site=...` → `[Worker] GSC keyword avto-qo'shildi: "..."`

---

## Debugging

| Muammo | Sabab | Yechim |
|---|---|---|
| `total_added: 0` | GSC'да mos keyword yo'q | Filter shartlarni tekshiring (impressions>=5, position>=3) |
| `reason: gsc_not_connected` | Sayt GSC ulanmagan | Brand Voice → Connect GSC |
| `error: 401` | Token expired va refresh_token yo'q | User qайta GSC login qilishi kerak |
| Duplicate error | Unique constraint (LOWER(keyword)) | Log'да skipped++ ko'rinadi, xato emas |
| Autopilot GSC ham bo'sh | Barcha filter shartlaridan o'tadigan keyword yo'q | User qo'lda keyword qo'shsin |
