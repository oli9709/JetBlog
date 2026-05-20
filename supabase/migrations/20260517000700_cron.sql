-- Enable pg_cron extension safely (Supabase pre-bundles this)
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Unschedule duplicate cron job if it already exists to prevent key collision errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
        PERFORM cron.unschedule('publish-scheduled-articles-daily');
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore unschedule errors if the job wasn't already scheduled
END $$;

-- Register the cron job safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
        -- Schedule daily publishing at 03:00 UTC
        PERFORM cron.schedule(
            'publish-scheduled-articles-daily', -- Job name
            '0 3 * * *',                         -- Every day at 03:00 UTC
            'SELECT public.publish_articles()'   -- Query to execute
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'pg_cron could not be configured or scheduled: %', SQLERRM;
END $$;
