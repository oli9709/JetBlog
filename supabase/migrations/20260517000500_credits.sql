-- Modify profiles table to support custom credits and plans
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS credits_remaining integer DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE'::text NOT NULL;

-- Add check constraint for plans
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'AGENCY'));
