'use server';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { ProfileT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

export const GetProfileByUserId = async (
  id: string
): Promise<PostgrestSingleResponse<ProfileT[]>> => {
  const client = await supabase();
  const res: PostgrestSingleResponse<ProfileT[]> = await client
    .from('profiles')
    .select()
    .eq('id', id);

  if (res.error) SupabaseDBError(res.error);

  return res;
};
