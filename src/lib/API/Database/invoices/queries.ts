'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { InvoiceT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

/**
 * Foydalanuvchining barcha hisob-kitob varaqalarini olish
 */
export const GetInvoicesByUser = async (
  userId: string
): Promise<PostgrestSingleResponse<InvoiceT[]>> => {
  const client = await supabase();
  const res = await client
    .from('invoices')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<InvoiceT[]>;
};

/**
 * ID bo'yicha aniq bitta hisob-kitob varaqasini olish
 */
export const GetInvoiceById = async (
  invoiceId: string
): Promise<PostgrestSingleResponse<InvoiceT>> => {
  const client = await supabase();
  const res = await client
    .from('invoices')
    .select()
    .eq('id', invoiceId)
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<InvoiceT>;
};
