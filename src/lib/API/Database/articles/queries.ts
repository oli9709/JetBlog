'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { ArticleT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

/**
 * Saytga tegishli barcha maqolalarni olish
 */
export const GetArticlesBySite = async (
  siteId: string
): Promise<PostgrestSingleResponse<ArticleT[]>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .select()
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<ArticleT[]>;
};

/**
 * ID bo'yicha aniq bitta maqolani olish
 */
export const GetArticleById = async (
  articleId: string
): Promise<PostgrestSingleResponse<ArticleT>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .select()
    .eq('id', articleId)
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<ArticleT>;
};

/**
 * Rejalashtirilgan nashr navbatidagi (scheduled statusidagi) maqolalarni olish
 */
export const GetScheduledArticles = async (
  siteId: string
): Promise<PostgrestSingleResponse<ArticleT[]>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .select()
    .eq('site_id', siteId)
    .eq('status', 'scheduled')
    .order('scheduled_for', { ascending: true });

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<ArticleT[]>;
};
