'use server';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { SubscriptionT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

export const GetSubscriptionById = async (
  id: string
): Promise<PostgrestSingleResponse<SubscriptionT[]>> => {
  const client = await supabase();
  const res: PostgrestSingleResponse<SubscriptionT[]> = await client
    .from('subscriptions')
    .select()
    .eq('id', id);

  if (res.error) SupabaseDBError(res.error);

  return res;
};
