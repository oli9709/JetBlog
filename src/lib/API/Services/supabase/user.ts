'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { SupabaseAuthError } from '@/lib/utils/error';

export const SupabaseSession = async () => {
  try {
    const client = await supabase();
    const userRes = await client.auth.getUser();
    return { data: { session: userRes.data.user ? { user: userRes.data.user } : null }, error: userRes.error };
  } catch (err: any) {
    console.error('SupabaseSession unexpected error:', err);
    return { data: { session: null }, error: err };
  }
};

export const SupabaseUser = async () => {
  try {
    const client = await supabase();
    const userRes = await client.auth.getUser();
    return userRes.data.user || null;
  } catch (err: any) {
    console.error('SupabaseUser unexpected error:', err);
    return null;
  }
};
