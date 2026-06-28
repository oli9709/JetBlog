-- ============================================================
-- Autopilot fix: "kun kuydirish" idempotency bug
-- claim_article_run — failed/osilib qolgan runlarni qayta claim qiladi,
-- completed runlarni himoyalaydi (ikki marta nashr yo'q). Poyga-xavfsiz.
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_article_run(p_site_id uuid, p_run_date date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.article_runs AS ar
    (site_id, run_date, status, attempts, started_at, error, completed_at)
  VALUES
    (p_site_id, p_run_date, 'processing', 1, now(), NULL, NULL)
  ON CONFLICT ON CONSTRAINT article_runs_site_date_unique
  DO UPDATE SET
    status       = 'processing',
    attempts     = ar.attempts + 1,
    started_at   = now(),
    error        = NULL,
    completed_at = NULL
  WHERE ar.status IN ('failed', 'pending')
     OR (ar.status = 'processing' AND ar.started_at < now() - interval '15 minutes')
  RETURNING ar.id INTO v_id;

  RETURN v_id;
END;
$func$;

REVOKE ALL ON FUNCTION public.claim_article_run(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_article_run(uuid, date) TO service_role;
