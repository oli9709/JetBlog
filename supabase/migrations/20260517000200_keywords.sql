-- Create keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    keyword text NOT NULL,
    language text DEFAULT 'uz'::text NOT NULL, -- uz, ru, en
    search_volume integer DEFAULT 0 NOT NULL,
    difficulty integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL, -- 'pending', 'approved', 'rejected', 'completed'
    approved_by_user boolean DEFAULT false NOT NULL,
    article_id uuid, -- Associated article ID (referenced logically, foreign key added later)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT keywords_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    CONSTRAINT keywords_language_check CHECK (language IN ('uz', 'ru', 'en'))
);

-- Grant privileges
GRANT ALL ON TABLE public.keywords TO postgres;
GRANT ALL ON TABLE public.keywords TO anon;
GRANT ALL ON TABLE public.keywords TO authenticated;
GRANT ALL ON TABLE public.keywords TO service_role;
