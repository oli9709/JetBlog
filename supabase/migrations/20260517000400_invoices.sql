-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_usd numeric(10,2) NOT NULL,
    credits_to_add integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL, -- 'pending', 'paid', 'cancelled'
    invoice_pdf_url text, -- Storage URL of the generated PDF invoice
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'paid', 'cancelled'))
);

-- Grant privileges
GRANT ALL ON TABLE public.invoices TO postgres;
GRANT ALL ON TABLE public.invoices TO anon;
GRANT ALL ON TABLE public.invoices TO authenticated;
GRANT ALL ON TABLE public.invoices TO service_role;
