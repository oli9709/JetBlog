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
 * Ichki havolalar uchun nashr etilgan maqolalar (title + published_url) ni olish.
 * Faqat published_url mavjud bo'lgan yozuvlar qaytariladi.
 * Generatsiya vaqtida Claude promptiga uzatiladi.
 */
export const GetPublishedArticlesBySite = async (
  siteId: string,
  limit = 20
): Promise<PostgrestSingleResponse<Array<Pick<ArticleT, 'title' | 'published_url'>>>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .select('title, published_url')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .not('published_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<Array<Pick<ArticleT, 'title' | 'published_url'>>>;
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
