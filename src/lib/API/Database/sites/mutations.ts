'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { SiteT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

interface InsertSitePropsI {
  user_id: string;
  url: string;
  wp_username: string;
  wp_password: string;
  brand_voice?: any;
  publish_days?: string[];
  publish_time?: string;
  telegram_chat_id?: string | null;
  is_active?: boolean;
  platform_type?: 'wordpress' | 'ghost' | 'webhook';
  adapter_config?: Record<string, unknown>;
}

/**
 * Yangi WordPress sayt ulanishini qo'shish
 */
export const SupabaseInsertSite = async (
  props: InsertSitePropsI
): Promise<PostgrestSingleResponse<SiteT>> => {
  const client = await supabase();
  const res = await client
    .from('sites')
    .insert([
      {
        user_id: props.user_id,
        url: props.url,
        wp_username: props.wp_username,
        wp_password: props.wp_password,
        brand_voice: props.brand_voice || {},
        publish_days: props.publish_days || [],
        publish_time: props.publish_time || '09:00:00',
        telegram_chat_id: props.telegram_chat_id || null,
        is_active: props.is_active !== undefined ? props.is_active : true,
        platform_type: props.platform_type || 'wordpress',
        adapter_config: props.adapter_config || {}
      }
    ])
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<SiteT>;
};

/**
 * Mavjud WordPress sayt ulanishi sozlamalarini yangilash
 */
export const SupabaseUpdateSite = async (
  siteId: string,
  userId: string,
  updatedFields: Partial<Omit<SiteT, 'id' | 'user_id' | 'created_at'>>
): Promise<PostgrestSingleResponse<SiteT>> => {
  const client = await supabase();
  const res = await client
    .from('sites')
    .update(updatedFields)
    .eq('id', siteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<SiteT>;
};

/**
 * WordPress sayt ulanishini butunlay o'chirish
 */
export const SupabaseDeleteSite = async (
  siteId: string,
  userId: string
): Promise<PostgrestSingleResponse<null>> => {
  const client = await supabase();
  const res = await client
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('user_id', userId);

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<null>;
};
