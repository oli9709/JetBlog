-- ============================================================
-- Autopilot v2: idempotency table + credit RPCs (2026-06-19)
-- ============================================================

-- ── 1. article_runs — har bir (site, sana) juftligi uchun bir martalik qayd ──
-- Dispatcher tomonidan joylashtirilgan har bir ishchi uchun qator yaratiladi.
-- (site_id, run_date) bo'yicha UNIQUE constraint ikki marta nashr qilishni oldini oladi.

CREATE TABLE IF NOT EXISTS public.article_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  run_date     date NOT NULL DEFAULT CURRENT_DATE,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  article_id   uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  keyword_id   uuid REFERENCES public.keywords(id) ON DELETE SET NULL,
  error        text,
  attempts     integer NOT NULL DEFAULT 0,
  enqueued_at  timestamptz NOT NULL DEFAULT now(),
  started_at   timestamptz,
  completed_at timestamptz,
  CONSTRAINT article_runs_site_date_unique UNIQUE (site_id, run_date)
);

ALTER TABLE public.article_runs ENABLE ROW LEVEL SECURITY;

-- Service role barcha amallarni bajaradi (ishchi va dispatcher uchun)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'article_runs'
      AND policyname = 'Service role manages article_runs'
  ) THEN
    CREATE POLICY "Service role manages article_runs"
      ON public.article_runs FOR ALL
      USING (auth.role() = 'service_role');
  END IF;

  -- Foydalanuvchi o'z saytlari uchun article_runs ni ko'ra oladi
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'article_runs'
      AND policyname = 'Users see own article_runs'
  ) THEN
    CREATE POLICY "Users see own article_runs"
      ON public.article_runs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.sites s
          WHERE s.id = site_id AND s.user_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS article_runs_site_date_idx
  ON public.article_runs (site_id, run_date);
CREATE INDEX IF NOT EXISTS article_runs_status_idx
  ON public.article_runs (status)
  WHERE status IN ('pending', 'processing');

-- ── 2. reserve_credit(p_user_id) — atomik kredit ajratish ───────────────────
-- Kredit mavjud bo'lsa 1 ta kamaytiradi va true qaytaradi.
-- Kredit 0 bo'lsa false qaytaradi va hech narsa o'zgartirmaydi.
-- SECURITY DEFINER: service_role dan chaqiriladi, RLS chetlab o'tiladi.

CREATE OR REPLACE FUNCTION public.reserve_credit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits integer;
BEGIN
  -- FOR UPDATE — boshqa parallel so'rovlar bilan poyga oldini oladi
  SELECT credits_remaining INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_credits IS NULL OR v_credits < 1 THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_credit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_credit(uuid) TO service_role;

-- ── 3. refund_credit(p_user_id) — kredit qaytarish ─────────────────────────
-- Xato yuz berganda chaqiriladi; credits_remaining ni 1 ga oshiradi.

CREATE OR REPLACE FUNCTION public.refund_credit(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + 1
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_credit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_credit(uuid) TO service_role;

-- ── 4. pg_cron jadvalini yangilash ──────────────────────────────────────────
-- Eski 03:00 UTC da ishga tushadigan job ni dispatcher chaqiruviga almashtirish.
-- Dispatcher o'zi publish_time ga qarab filtr qiladi, shuning uchun soatiga bir marta
-- tekshirish yetarli.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    -- Eski job ni o'chirish (xato bo'lsa ham davom etiladi)
    BEGIN
      PERFORM cron.unschedule('publish-scheduled-articles-daily');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Yangi: soatiga bir marta dispatcher ni chaqiradi (pg_net orqali)
    -- ESLATMA: SITE_URL va CRON_SECRET ni muhit o'zgaruvchilaridan oling.
    -- pg_net mavjud bo'lmasa bu blok ishlaydi lekin job HTTP so'rov yubormasdan
    -- faqat ro'yxatdan o'tadi — tashqi scheduler (Vercel Cron) dan foydalaning.
    BEGIN
      PERFORM cron.schedule(
        'autopilot-dispatcher-hourly',
        '0 * * * *',   -- har soat boshida
        $$SELECT 1$$   -- placeholder: haqiqiy chaqiruv Vercel Cron orqali amalga oshiriladi
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'pg_cron dispatcher jadval o''rnatilmadi: %', SQLERRM;
    END;
  END IF;
END $$;
