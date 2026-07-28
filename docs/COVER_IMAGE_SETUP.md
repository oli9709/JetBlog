# Cover Image Upload — Supabase Storage Setup

Content Queue editorda maqola muqova rasmini yuklash uchun **prod Supabase'da bir marta qo'lda** bajarilishi kerak bo'lgan qadamlar.

---

## 1. Bucket yaratish

**Supabase Dashboard → Storage → New bucket:**

| Field | Value |
|---|---|
| Name | `article-images` |
| Public bucket | **YES** ✓ |
| File size limit | `5 MB` |
| Allowed MIME types | `image/jpeg, image/png, image/webp` |

**Create** tugmasini bosing.

---

## 2. RLS policies

**Supabase Dashboard → SQL Editor → New query** — nusxa oling va **Run**:

```sql
-- Users can upload only into their own folder (path prefix = auth.uid())
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'article-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone (unauthenticated too) can view images — public bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'article-images');

-- Users can delete only their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'article-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Muhim**: fayl nomi doim `{userId}/{articleId}-{timestamp}.{ext}` formatida bo'ladi — birinchi papka `userId` bo'lishi RLS uchun majburiy.

---

## 3. Env

Yangi env o'zgaruvchi **shart emas**. Kod mavjud `NEXT_PUBLIC_SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` ni ishlatadi (server-side upload service role bilan bajariladi).

---

## 4. Verify

Setup tugagach, dashboard'da:

1. Content Queue → maqolani tanlang
2. Yuqorida "Cover image" bo'limi ko'rinadi
3. Rasm hali yo'q → drop zone; bor → preview + Replace/Remove tugmalari
4. JPEG/PNG/WebP fayl yuklang (max 5MB)
5. Toast: "Cover image updated" — Supabase Storage'da fayl paydo bo'ladi

**Storage'да tekshirish**: Supabase Dashboard → Storage → article-images → `<userId>/` papkasida yuklangan fayllar.

---

## 5. Xato holatlari

| Xato | Sabab | Yechim |
|---|---|---|
| `bucket not found` | Bucket yaratilmagan | Qadam 1 |
| `403 upload` | RLS yo'q yoki path prefix noto'g'ri | Qadam 2 SQL run |
| `File too large` | 5MB dan katta | Bucket limit + server 400 |
| `Invalid image file` | Magic bytes mos kelmagan | Faqat JPEG/PNG/WebP |

---

## 6. Yangi rasm yuklash → eski rasm o'chadi

Upload route eski `featured_image_url` ni tekshiradi:
- Agar u `supabase.co/storage` ichida bo'lsa → o'chiradi (quota tejash)
- Agar Pexels yoki boshqa tashqi URL bo'lsa → tegmaydi

Bu behavior avtomatik, qo'lda hech narsa qilish shart emas.
