'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

interface ProfileUpdatePropsI {
  id: string;
  display_name: string;
}

export const SupabaseProfileUpdate = async ({
  id,
  display_name
}: ProfileUpdatePropsI): Promise<PostgrestSingleResponse<null>> => {
  const client = await supabase();
  const res = await client.from('profiles').upsert({ id, display_name });

  return res;
};

export const SupabaseCompleteOnboarding = async (
  id: string
): Promise<PostgrestSingleResponse<null>> => {
  const client = await supabase();
  const res = await client.from('profiles').update({ onboarding_completed: true }).eq('id', id);

  return res;
};
