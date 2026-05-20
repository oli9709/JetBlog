-- Delete unused todos table
DROP TABLE IF EXISTS public.todos CASCADE;

-- Create sites table
CREATE TABLE IF NOT EXISTS public.sites (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url text NOT NULL,
    wp_password text NOT NULL, -- Encrypted application password
    brand_voice jsonb DEFAULT '{}'::jsonb NOT NULL,
    publish_days text[] DEFAULT '{}'::text[] NOT NULL, -- e.g., ['monday', 'wednesday']
    publish_time time without time zone DEFAULT '09:00:00'::time NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    telegram_chat_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant privileges
GRANT ALL ON TABLE public.sites TO postgres;
GRANT ALL ON TABLE public.sites TO anon;
GRANT ALL ON TABLE public.sites TO authenticated;
GRANT ALL ON TABLE public.sites TO service_role;
