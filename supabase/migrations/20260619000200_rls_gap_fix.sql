-- ============================================================
-- RLS bo'shliqlarini to'ldirish (security audit 2026-06-19)
-- ============================================================

-- subscriptions jadvali: faqat mavjud bo'lsa RLS yoqiladi
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'subscriptions'
  ) THEN
    EXECUTE 'ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'subscriptions'
        AND policyname = 'Users see own subscription'
    ) THEN
      EXECUTE $p$CREATE POLICY "Users see own subscription"
        ON public.subscriptions FOR SELECT
        USING (auth.uid() = user_id)$p$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'subscriptions'
        AND policyname = 'Users update own subscription'
    ) THEN
      EXECUTE $p$CREATE POLICY "Users update own subscription"
        ON public.subscriptions FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)$p$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'subscriptions'
        AND policyname = 'Service role manages subscriptions'
    ) THEN
      EXECUTE $p$CREATE POLICY "Service role manages subscriptions"
        ON public.subscriptions FOR ALL
        USING (auth.role() = 'service_role')$p$;
    END IF;
  END IF;
END $$;

-- todos jadvali: faqat mavjud bo'lsa policy qo'shiladi
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'todos'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'todos'
        AND policyname = 'Users manage own todos'
    ) THEN
      EXECUTE $p$CREATE POLICY "Users manage own todos"
        ON public.todos FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)$p$;
    END IF;
  END IF;
END $$;
