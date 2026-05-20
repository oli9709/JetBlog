'use server';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import config from '@/lib/config/auth';
import { SupabaseAuthError } from '@/lib/utils/error';

export const SupabaseSignUp = async (email: string, password: string) => {
  const client = await supabase();
  const res = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/api/auth-callback`
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

export const SupabaseSignInWithGoogle = async () => {
  const client = await supabase();
  const res = await client.auth.signInWithOAuth({
    provider: 'google'
  });
  return res;
};

export const SupabaseSignInWithMagicLink = async (email: string) => {
  const client = await supabase();
  const res = await client.auth.signInWithOtp({
    email: `${email}`,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}${config.redirects.callback}`
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
  const redirectTo = `${process.env.NEXT_PUBLIC_DOMAIN}${config.redirects.toProfile}`;
  const client = await supabase();
  const res = await client.auth.resetPasswordForEmail(email, {
    redirectTo
  });
  return res;
};
