-- ============================================================
-- RLS to'ldirish migratsiyasi
-- Mavjud (sites, articles, keywords, invoices) politikalariga
-- tegmasdan, qolgan jadvallar uchun RLS yoqish va policy yozish
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- invoices — mavjud SELECT + INSERT (users) politikalari bor.
-- Faqat service_role uchun INSERT va UPDATE qo'shamiz.
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'invoices'
      AND policyname = 'Service role insert invoices'
  ) THEN
    CREATE POLICY "Service role insert invoices"
      ON public.invoices FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'invoices'
      AND policyname = 'Service role update invoices'
  ) THEN
    CREATE POLICY "Service role update invoices"
      ON public.invoices FOR UPDATE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- gsc_tokens
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.gsc_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gsc_tokens' AND policyname = 'Users see own gsc_tokens') THEN
    CREATE POLICY "Users see own gsc_tokens"
      ON public.gsc_tokens FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gsc_tokens' AND policyname = 'Users insert own gsc_tokens') THEN
    CREATE POLICY "Users insert own gsc_tokens"
      ON public.gsc_tokens FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gsc_tokens' AND policyname = 'Users update own gsc_tokens') THEN
    CREATE POLICY "Users update own gsc_tokens"
      ON public.gsc_tokens FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gsc_tokens' AND policyname = 'Users delete own gsc_tokens') THEN
    CREATE POLICY "Users delete own gsc_tokens"
      ON public.gsc_tokens FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- webhooks
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- webhooks jadvalida user_id yo'q — site_id orqali foydalanuvchiga bog'langan
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'webhooks' AND policyname = 'Users see own webhooks') THEN
    CREATE POLICY "Users see own webhooks"
      ON public.webhooks FOR SELECT
      USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'webhooks' AND policyname = 'Users insert own webhooks') THEN
    CREATE POLICY "Users insert own webhooks"
      ON public.webhooks FOR INSERT
      WITH CHECK (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'webhooks' AND policyname = 'Users update own webhooks') THEN
    CREATE POLICY "Users update own webhooks"
      ON public.webhooks FOR UPDATE
      USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'webhooks' AND policyname = 'Users delete own webhooks') THEN
    CREATE POLICY "Users delete own webhooks"
      ON public.webhooks FOR DELETE
      USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- subscribers — faqat INSERT ochiq, SELECT faqat service_role
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Anyone can subscribe') THEN
    CREATE POLICY "Anyone can subscribe"
      ON public.subscribers FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Service role reads subscribers') THEN
    CREATE POLICY "Service role reads subscribers"
      ON public.subscribers FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- profiles — agar mavjud bo'lmasa qo'shamiz
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';
  IF FOUND THEN
    -- RLS yoqilganini tekshirish
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'profiles' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users see own profile') THEN
      CREATE POLICY "Users see own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users update own profile') THEN
      CREATE POLICY "Users update own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Service role manages profiles') THEN
      CREATE POLICY "Service role manages profiles"
        ON public.profiles FOR ALL
        USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;
