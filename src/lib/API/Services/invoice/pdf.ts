import 'server-only';
import PDFDocument from 'pdfkit';
import { SupabaseServerClient as supabase } from '@/lib/API/Services/init/supabase';

interface GenerateInvoicePDFPropsI {
  invoiceId: string;
  userEmail: string;
  amountUsd: number;
  credits: number;
  createdAt: string;
}

/**
 * PDFKit yordamida chiroyli dizayndagi hisob-kitob varaqasi (PDF) faylini buffer sifatida yaratish
 */
export const GenerateInvoicePDFBuffer = async ({
  invoiceId,
  userEmail,
  amountUsd,
  credits,
  createdAt
}: GenerateInvoicePDFPropsI): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Sarlavha & Logo
      doc.fillColor('#4f46e5').fontSize(24).text('JetBlog.app', 50, 50);
      doc.fillColor('#4b5563').fontSize(10).text('Avtomatlashtirilgan AI SEO Autopilot Platformasi', 50, 78);
      
      doc.fillColor('#111827').fontSize(18).text('INVOICE / TO\'LOV VARAQASI', 300, 50, { align: 'right' });
      doc.moveDown(2);

      // 2. Invoice Metadatalari
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 105).lineTo(550, 105).stroke();
      
      doc.fillColor('#111827').fontSize(10).text(`To'lov varaqasi ID:`, 50, 120);
      doc.fillColor('#4b5563').text(invoiceId, 160, 120);

      doc.fillColor('#111827').text(`Sana:`, 50, 135);
      doc.fillColor('#4b5563').text(new Date(createdAt).toLocaleString(), 160, 135);

      doc.fillColor('#111827').text(`Mijoz Email:`, 50, 150);
      doc.fillColor('#4b5563').text(userEmail, 160, 150);
      
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 175).lineTo(550, 175).stroke();
      doc.moveDown(3);

      // 3. Mahsulotlar Jadvali
      doc.fillColor('#111827').fontSize(11).text('Tavsif (Description)', 50, 200);
      doc.text('Miqdor (Qty)', 350, 200, { width: 80, align: 'right' });
      doc.text('Narx (USD)', 450, 200, { width: 100, align: 'right' });

      doc.strokeColor('#9ca3af').lineWidth(1.5).moveTo(50, 218).lineTo(550, 218).stroke();

      // Qator 1
      doc.fillColor('#4b5563').fontSize(10).text('JetBlog AI balansini to\'ldirish (Maqolalar uchun kreditlar)', 50, 235);
      doc.text(`${credits.toLocaleString()} token`, 350, 235, { width: 80, align: 'right' });
      doc.fillColor('#111827').text(`$${amountUsd.toFixed(2)}`, 450, 235, { width: 100, align: 'right' });

      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 255).lineTo(550, 255).stroke();
      doc.moveDown(2);

      // 4. Jami summani hisoblash
      doc.fillColor('#111827').fontSize(12).text(`Jami to'lov (Total Amount):`, 300, 280, { width: 150, align: 'right' });
      doc.fillColor('#4f46e5').fontSize(14).text(`$${amountUsd.toFixed(2)} USD`, 450, 278, { width: 100, align: 'right' });

      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 310).lineTo(550, 310).stroke();
      doc.moveDown(3);

      // 5. To'lov Qo'llanmasi
      doc.fillColor('#111827').fontSize(12).text('To\'lov bo\'yicha muhim ko\'rsatma:', 50, 330);
      doc.fillColor('#4b5563').fontSize(10).text(
        'Ushbu to\'lov varaqasi avtomatik ravishda yaratilgan. Hisobni to\'lash uchun saytdagi admin tasdiqlovidan o\'ting yoki qo\'llab-quvvatlash xizmatiga murojaat qiling.',
        50,
        350,
        { width: 500, align: 'left', lineGap: 4 }
      );

      // 6. Footer (Sahifa oxiri)
      doc.fillColor('#9ca3af').fontSize(8).text(
        'Savollaringiz bormi? billing@jetblog.app orqali bog\'laning.',
        50,
        700,
        { align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Yaratilgan Invoice PDF bufferini Supabase Storage (invoices bucket) ga yuklash va havolasini olish
 */
export const UploadInvoicePDFToStorage = async (
  invoiceId: string,
  pdfBuffer: Buffer
): Promise<string> => {
  try {
    const client = await supabase();
    
    // Invoices fayllar savatiga (bucket) yuklash
    const { data, error } = await client.storage
      .from('invoices')
      .upload(`${invoiceId}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      // Agar invoices bucket mavjud bo'lmasa, yoki xatolik bo'lsa
      console.warn('Supabase Storage-ga yuklashda xatolik (davom etamiz):', error.message);
      return '';
    }

    // Public URL-ni shakllantirish
    const { data: publicUrlData } = client.storage
      .from('invoices')
      .getPublicUrl(`${invoiceId}.pdf`);

    return publicUrlData.publicUrl || '';
  } catch (err: any) {
    console.error('Storage Upload Error:', err);
    return '';
  }
};
