-- Enable Row Level Security on all new tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 1. Sites Table Policies
CREATE POLICY "Users can manage their own sites" ON public.sites
    FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 2. Keywords Table Policies
CREATE POLICY "Users can manage keywords for their sites" ON public.keywords
    FOR ALL 
    USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid())) 
    WITH CHECK (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));

-- 3. Articles Table Policies
CREATE POLICY "Users can manage articles for their sites" ON public.articles
    FOR ALL 
    USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid())) 
    WITH CHECK (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));

-- 4. Invoices Table Policies
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own top-up invoices" ON public.invoices
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
