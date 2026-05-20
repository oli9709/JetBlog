-- Enable pg_net extension safely (used for background HTTP requests)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Create the publish_articles PL/pgSQL function
CREATE OR REPLACE FUNCTION public.publish_articles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cron_url text;
    cron_token text;
BEGIN
    -- 1. Identify Next.js URL and Secret token from environment or configurations
    -- (In Supabase, we can set custom variables in postgresql.conf or read from vault)
    cron_url := 'https://textpilot.ai/api/cron'; -- Fallback public URL
    cron_token := 'super_secret_cron_token_123'; -- Fallback token

    -- 2. Trigger the Next.js API Cron Route in the background using pg_net
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'net' AND p.proname = 'http_post'
    ) THEN
        PERFORM net.http_post(
            url := cron_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || cron_token
            ),
            body := jsonb_build_object('triggered_by', 'pg_cron_publish_articles'),
            timeout_ms := 10000
        );
    END IF;
END;
$$;

-- Grant execution privileges
GRANT ALL ON FUNCTION public.publish_articles() TO postgres;
GRANT ALL ON FUNCTION public.publish_articles() TO anon;
GRANT ALL ON FUNCTION public.publish_articles() TO authenticated;
GRANT ALL ON FUNCTION public.publish_articles() TO service_role;
