'use server';

import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';
import { InvoiceT } from '@/lib/types/supabase';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SupabaseDBError } from '@/lib/utils/error';

interface InsertInvoicePropsI {
  user_id: string;
  amount_usd: number;
  credits_to_add: number;
  status?: 'pending' | 'paid' | 'cancelled';
  invoice_pdf_url?: string | null;
}

/**
 * Yangi invoice (to'lov varaqasi) kiritish
 */
export const SupabaseInsertInvoice = async (
  props: InsertInvoicePropsI
): Promise<PostgrestSingleResponse<InvoiceT>> => {
  const client = await supabase();
  const res = await client
    .from('invoices')
    .insert([
      {
        user_id: props.user_id,
        amount_usd: props.amount_usd,
        credits_to_add: props.credits_to_add,
        status: props.status || 'pending',
        invoice_pdf_url: props.invoice_pdf_url || null
      }
    ])
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<InvoiceT>;
};

/**
 * Invoice to'langanlik holatini yoki PDF havolasini yangilash
 */
export const SupabaseUpdateInvoice = async (
  invoiceId: string,
  updatedFields: Partial<Omit<InvoiceT, 'id' | 'user_id' | 'created_at'>>
): Promise<PostgrestSingleResponse<InvoiceT>> => {
  const client = await supabase();
  const res = await client
    .from('invoices')
    .update(updatedFields)
    .eq('id', invoiceId)
    .select()
    .single();

  if (res.error) SupabaseDBError(res.error);

  return res as PostgrestSingleResponse<InvoiceT>;
};
