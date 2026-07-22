'use server';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { ProfileT } from '@/lib/types/supabase';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

/** Ixtiyoriy `client` — impersonation vaqtida service-role client uzatiladi. */
export const GetProfileByUserId = async (
  id: string,
  client?: SupabaseClient
): Promise<PostgrestSingleResponse<ProfileT[]>> => {
  const db = client ?? (await supabase());
  const res: PostgrestSingleResponse<ProfileT[]> = await db
    .from('profiles')
    .select()
    .eq('id', id);

  if (res.error) SupabaseDBError(res.error);

  return res;
};
