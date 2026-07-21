-- Eski manual-invoice tizimini olib tashlash (PayPal Subscriptions almashtirdi).
--
-- MUHIM: Bu migration'ni prod Supabase'da qo'lda ishga tushiring
-- (Supabase Dashboard → SQL Editor). Local dev repo migrations
-- avtomatik apply qilinmaydi.
--
-- Data yo'qotish: `invoices` jadval ma'lumotlari o'chib ketadi. Agar
-- eski invoice'lar audit uchun kerak bo'lsa, avval export qiling:
--   copy (select * from public.invoices) to 'invoices_backup.csv' csv header;

DROP TABLE IF EXISTS public.invoices CASCADE;

-- topup_packages jadval hech qachon yaratilmagan (client-side static array edi),
-- shu bois DROP shart emas. Agar mavjud bo'lsa — quyidagi qatorni uncomment qiling:
-- DROP TABLE IF EXISTS public.topup_packages CASCADE;
