-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    keyword_id uuid NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL, -- Rich HTML from TipTap
    featured_image_url text,
    wp_post_id integer, -- Post ID returned by WordPress REST API
    status text DEFAULT 'draft'::text NOT NULL, -- 'draft', 'scheduled', 'published', 'error'
    scheduled_for timestamp with time zone,
    published_at timestamp with time zone,
    ai_tokens_used integer DEFAULT 0 NOT NULL,
    error_message text, -- To store error logs if WordPress publishing fails
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT articles_status_check CHECK (status IN ('draft', 'scheduled', 'published', 'error'))
);

-- Complete the bidirectional link by adding foreign key to keywords
ALTER TABLE public.keywords 
    ADD CONSTRAINT keywords_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE SET NULL;

-- Grant privileges
GRANT ALL ON TABLE public.articles TO postgres;
GRANT ALL ON TABLE public.articles TO anon;
GRANT ALL ON TABLE public.articles TO authenticated;
GRANT ALL ON TABLE public.articles TO service_role;
