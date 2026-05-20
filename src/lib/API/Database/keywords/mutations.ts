'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { KeywordT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

interface InsertKeywordPropsI {
  site_id: string;
  keyword: string;
  language: 'uz' | 'ru' | 'en';
  search_volume?: number;
  difficulty?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by_user?: boolean;
}

/**
 * Yangi kalit so'zlarni ommaviy yoki yakka tartibda qo'shish
 */
export const SupabaseInsertKeywords = async (
  props: InsertKeywordPropsI[]
): Promise<PostgrestSingleResponse<KeywordT[]>> => {
  const client = await supabase();
  const res = await client
    .from('keywords')
    .insert(
      props.map((p) => ({
        site_id: p.site_id,
        keyword: p.keyword,
        language: p.language || 'uz',
        search_volume: p.search_volume || 0,
        difficulty: p.difficulty || 0,
        status: p.status || 'pending',
        approved_by_user: p.approved_by_user !== undefined ? p.approved_by_user : false
      }))
    )
    .select();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<KeywordT[]>;
};

/**
 * Kalit so'z holatini va tasdiqlash statusini yangilash
 */
export const SupabaseUpdateKeyword = async (
  keywordId: string,
  updatedFields: Partial<Omit<KeywordT, 'id' | 'site_id' | 'created_at'>>
): Promise<PostgrestSingleResponse<KeywordT>> => {
  const client = await supabase();
  const res = await client
    .from('keywords')
    .update(updatedFields)
    .eq('id', keywordId)
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<KeywordT>;
};

/**
 * Kalit so'zni o'chirish
 */
export const SupabaseDeleteKeyword = async (
  keywordId: string
): Promise<PostgrestSingleResponse<null>> => {
  const client = await supabase();
  const res = await client
    .from('keywords')
    .delete()
    .eq('id', keywordId);

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<null>;
};
