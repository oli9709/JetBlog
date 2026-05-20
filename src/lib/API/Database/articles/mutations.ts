'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { ArticleT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

interface InsertArticlePropsI {
  site_id: string;
  keyword_id: string;
  title: string;
  content: string;
  featured_image_url?: string | null;
  wp_post_id?: number | null;
  status?: 'draft' | 'scheduled' | 'published' | 'error';
  scheduled_for?: string | null;
  published_at?: string | null;
  ai_tokens_used?: number;
  error_message?: string | null;
}

/**
 * Yangi yaratilgan maqolani bazaga saqlash
 */
export const SupabaseInsertArticle = async (
  props: InsertArticlePropsI
): Promise<PostgrestSingleResponse<ArticleT>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .insert([
      {
        site_id: props.site_id,
        keyword_id: props.keyword_id,
        title: props.title,
        content: props.content,
        featured_image_url: props.featured_image_url || null,
        wp_post_id: props.wp_post_id || null,
        status: props.status || 'draft',
        scheduled_for: props.scheduled_for || null,
        published_at: props.published_at || null,
        ai_tokens_used: props.ai_tokens_used || 0,
        error_message: props.error_message || null
      }
    ])
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<ArticleT>;
};

/**
 * Maqola ma'lumotlarini (masalan, sarlavha, matn yoki holat) yangilash
 */
export const SupabaseUpdateArticle = async (
  articleId: string,
  updatedFields: Partial<Omit<ArticleT, 'id' | 'site_id' | 'keyword_id' | 'created_at'>>
): Promise<PostgrestSingleResponse<ArticleT>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .update(updatedFields)
    .eq('id', articleId)
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<ArticleT>;
};

/**
 * Maqolani butunlay o'chirish
 */
export const SupabaseDeleteArticle = async (
  articleId: string
): Promise<PostgrestSingleResponse<null>> => {
  const client = await supabase();
  const res = await client
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<null>;
};
