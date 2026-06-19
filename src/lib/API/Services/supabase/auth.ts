'use server';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import config from '@/lib/config/auth';
import { getBaseUrl } from '@/lib/config/site';
import { SupabaseAuthError } from '@/lib/utils/error';

/**
 * Auth redirect URL lari getBaseUrl() orqali quriladi — NEXT_PUBLIC_DOMAIN dan o'qiydi.
 * dev  → http://localhost:3000
 * prod → https://jetblog.app  (Vercel da NEXT_PUBLIC_DOMAIN=https://jetblog.app o'rnatilishi kerak)
 */

export const SupabaseSignUp = async (email: string, password: string) => {
  const client = await supabase();
  const res = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/api/auth-callback`
    }
  });
  return res;
};

export const SupabaseSignIn = async (email: string, password: string) => {
  const client = await supabase();
  const res = await client.auth.signInWithPassword({
    email,
    password
  });
  return res;
};

export const SupabaseSignOut = async () => {
  const client = await supabase();
  const res = await client.auth.signOut();
  if (res.error) SupabaseAuthError(res.error);
  return res;
};

// NOTE: signInWithOAuth must be called client-side — use supabaseBrowser() in components directly

export const SupabaseSignInWithMagicLink = async (email: string) => {
  const client = await supabase();
  const res = await client.auth.signInWithOtp({
    email: `${email}`,
    options: {
      emailRedirectTo: `${getBaseUrl()}${config.redirects.callback}`
    }
  });
  return res;
};

export const SupabaseUpdateEmail = async (email: string) => {
  const client = await supabase();
  const res = await client.auth.updateUser({ email });
  return res;
};

export const SupabaseUpdatePassword = async (password: string) => {
  const client = await supabase();
  const res = await client.auth.updateUser({ password });
  return res;
};

export const SupabaseResetPasswordEmail = async (email: string) => {
  const redirectTo = `${getBaseUrl()}${config.redirects.toProfile}`;
  const client = await supabase();
  const res = await client.auth.resetPasswordForEmail(email, {
    redirectTo
  });
  return res;
};
