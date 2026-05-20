import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { GetInvoiceById } from '@/lib/API/Database/invoices/queries';
import { SupabaseUpdateInvoice } from '@/lib/API/Database/invoices/mutations';
import { GenerateInvoicePDFBuffer, UploadInvoicePDFToStorage } from '@/lib/API/Services/invoice/pdf';

/**
 * POST /api/admin/pay-invoice
 * To'lov varaqasini to'langan deb belgilash, kreditlarni yuklash va PDF kvitansiyani yaratish
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    
    // Foydalanuvchi seansini tekshirish
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    // Admin tekshiruvi
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: adminProfile } = await adminClient
      .from('profiles').select('is_admin').eq('id', session.user.id).single();
    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId talab qilinadi!' }, { status: 400 });
    }

    // 1. Invoice-ni olish
    const invoiceRes = await GetInvoiceById(invoiceId);
    if (!invoiceRes.data) {
      return NextResponse.json({ error: 'To\'lov varaqasi topilmadi!' }, { status: 404 });
    }
    const invoice = invoiceRes.data;

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Ushbu hisob-kitob varaqasi allaqachon to\'langan!' }, { status: 400 });
    }

    // 2. Invoice holatini 'paid' ga o'zgartirish va vaqtni belgilash
    const paidInvoiceRes = await SupabaseUpdateInvoice(invoice.id, {
      status: 'paid',
      paid_at: new Date().toISOString()
    });

    // 3. Foydalanuvchi profile-dagi credits_remaining miqdorini oshirish
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', invoice.user_id)
      .single();

    const currentCredits = profile?.credits_remaining || 0;
    const newCreditsTotal = currentCredits + invoice.credits_to_add;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ credits_remaining: newCreditsTotal })
      .eq('id', invoice.user_id);

    if (profileError) {
      return NextResponse.json({ error: 'Foydalanuvchi balansini oshirishda xatolik!' }, { status: 500 });
    }

    // 4. To'langan kvitansiya PDF-ni qayta yaratib Storage-ga joylash
    let publicPdfUrl = invoice.invoice_pdf_url;
    try {
      const userEmail = session.user.email || 'billing@jetblog.app';
      const pdfBuffer = await GenerateInvoicePDFBuffer({
        invoiceId: invoice.id,
        userEmail: userEmail,
        amountUsd: invoice.amount_usd,
        credits: invoice.credits_to_add,
        createdAt: invoice.created_at
      });

      const uploadedUrl = await UploadInvoicePDFToStorage(invoice.id, pdfBuffer);
      if (uploadedUrl) {
        publicPdfUrl = uploadedUrl;
        await SupabaseUpdateInvoice(invoice.id, {
          invoice_pdf_url: uploadedUrl
        });
      }
    } catch (pdfErr) {
      console.error('Invoice PDF update failed:', pdfErr);
    }

    return NextResponse.json({
      success: true,
      creditsLoaded: invoice.credits_to_add,
      newCreditsTotal: newCreditsTotal,
      invoicePdfUrl: publicPdfUrl,
      invoice: paidInvoiceRes.data
    });

  } catch (error: any) {
    console.error('Pay Invoice Route Global Error:', error);
    return NextResponse.json({ error: error.message || 'Tizimda kutilmagan xatolik yuz berdi.' }, { status: 500 });
  }
}
