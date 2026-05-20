'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { SiteT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

/**
 * Foydalanuvchining barcha bog'langan WordPress saytlarini olish
 */
export const GetSitesByUser = async (
  userId: string
): Promise<PostgrestSingleResponse<SiteT[]>> => {
  const client = await supabase();
  const res = await client
    .from('sites')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<SiteT[]>;
};

/**
 * ID bo'yicha aniq bitta WordPress sayt ma'lumotlarini olish
 */
export const GetSiteById = async (
  siteId: string,
  userId: string
): Promise<PostgrestSingleResponse<SiteT>> => {
  const client = await supabase();
  const res = await client
    .from('sites')
    .select()
    .eq('id', siteId)
    .eq('user_id', userId)
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<SiteT>;
};
