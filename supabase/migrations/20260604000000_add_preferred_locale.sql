-- Add preferred_locale column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('uz', 'ru', 'en'));

COMMENT ON COLUMN public.profiles.preferred_locale IS 'User preferred language: uz, ru, or en';
