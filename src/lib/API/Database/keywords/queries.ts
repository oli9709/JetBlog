'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { KeywordT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

/**
 * Saytga tegishli barcha kalit so'zlarni olish
 */
export const GetKeywordsBySite = async (
  siteId: string
): Promise<PostgrestSingleResponse<KeywordT[]>> => {
  const client = await supabase();
  const res = await client
    .from('keywords')
    .select()
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<KeywordT[]>;
};

/**
 * ID bo'yicha aniq bitta kalit so'zni olish
 */
export const GetKeywordById = async (
  keywordId: string
): Promise<PostgrestSingleResponse<KeywordT>> => {
  const client = await supabase();
  const res = await client
    .from('keywords')
    .select()
    .eq('id', keywordId)
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<KeywordT>;
};
