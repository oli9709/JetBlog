-- ============================================================
-- RLS bo'shliqlarini to'ldirish (security audit 2026-06-19)
-- ============================================================

-- subscriptions jadvali: remote_schema da yaratilgan, RLS yo'q edi
-- Bu jadval foydalanuvchi obuna ma'lumotlarini saqlaydi — RLS majburiy
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
      AND policyname = 'Users see own subscription'
  ) THEN
    CREATE POLICY "Users see own subscription"
      ON public.subscriptions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
      AND policyname = 'Users update own subscription'
  ) THEN
    CREATE POLICY "Users update own subscription"
      ON public.subscriptions FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
      AND policyname = 'Service role manages subscriptions'
  ) THEN
    CREATE POLICY "Service role manages subscriptions"
      ON public.subscriptions FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- todos jadvali: RLS yoqilgan lekin policy yo'q edi — everyone blocked which is safe,
-- but add explicit service_role policy for completeness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'todos'
      AND policyname = 'Users manage own todos'
  ) THEN
    CREATE POLICY "Users manage own todos"
      ON public.todos FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
