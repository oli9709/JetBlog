import { NextResponse } from 'next/server';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { GetInvoiceById } from '@/lib/API/Database/invoices/queries';
import { SupabaseUpdateInvoice } from '@/lib/API/Database/invoices/mutations';
import { GenerateInvoicePDFBuffer, UploadInvoicePDFToStorage } from '@/lib/API/Services/invoice/pdf';

/**
 * POST /api/invoice/generate
 * To'lov varaqasi (PDF) faylini yaratish, Storage-ga yuklash va unga havola berish
 */
export async function POST(req: Request) {
  try {
    const supabase = await SupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId talab qilinadi!' }, { status: 400 });
    }

    // 1. Invoice ma'lumotlarini olish
    const invoiceRes = await GetInvoiceById(invoiceId);
    if (!invoiceRes.data) {
      return NextResponse.json({ error: 'To\'lov varaqasi topilmadi!' }, { status: 404 });
    }
    const invoice = invoiceRes.data;

    // 2. Foydalanuvchi profili va email manzilini olish
    const userEmail = user.email || 'billing@jetblog.app';

    // 3. PDF Kit orqali PDF fayl bufferini generatsiya qilish
    const pdfBuffer = await GenerateInvoicePDFBuffer({
      invoiceId: invoice.id,
      userEmail: userEmail,
      amountUsd: invoice.amount_usd,
      credits: invoice.credits_to_add,
      createdAt: invoice.created_at
    });

    // 4. Supabase Storage-ga yuklash va havolasini olish
    const publicPdfUrl = await UploadInvoicePDFToStorage(invoice.id, pdfBuffer);

    // 5. Bazada invoice row-ni public PDF URL bilan yangilash
    const updatedInvoiceRes = await SupabaseUpdateInvoice(invoice.id, {
      invoice_pdf_url: publicPdfUrl || `/invoices/${invoice.id}.pdf` // Local zaxira havolasi
    });

    return NextResponse.json({
      success: true,
      invoicePdfUrl: updatedInvoiceRes.data?.invoice_pdf_url,
      invoice: updatedInvoiceRes.data
    });

  } catch (error: any) {
    console.error('Invoice Generate Route Global Error:', error);
    return NextResponse.json({ error: error.message || 'Tizimda kutilmagan xatolik yuz berdi.' }, { status: 500 });
  }
}
