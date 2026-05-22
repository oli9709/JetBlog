'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Calendar, 
  Receipt, 
  MessageSquare, 
  Plus, 
  Coins, 
  Download, 
  CreditCard,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { InvoiceT } from '@/lib/types/supabase';
import { SupabaseInsertInvoice } from '@/lib/API/Database/invoices/mutations';

interface BillingPropsI {
  initialInvoices: InvoiceT[];
  userId: string;
  initialCredits: number;
}

const TOPUP_PACKAGES = [
  { name: 'Starter Pack', credits: 1000, price: 9.99, desc: 'Kichik bloglar uchun 1,000 AI SEO maqola kreditlari' },
  { name: 'Autopilot Pro', credits: 5000, price: 39.99, desc: 'O\'rta tarmoqlar uchun 5,000 AI SEO maqola kreditlari' },
  { name: 'Premium Autopilot', credits: 15000, price: 99.99, desc: 'Katta saytlar va agentliklar uchun 15,000 kredit' }
];

const Billing = ({ initialInvoices, userId, initialCredits }: BillingPropsI) => {
  const [invoices, setInvoices] = useState<InvoiceT[]>(initialInvoices);
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  // Yangi to'lov varaqasi (invoice) generatsiya qilish
  const handleCreateInvoice = async (pkg: typeof TOPUP_PACKAGES[0]) => {
    setIsGenerating(true);
    try {
      // 1. Bazaga yangi pending invoice qo'shish
      const dbRes = await SupabaseInsertInvoice({
        user_id: userId,
        amount_usd: pkg.price,
        credits_to_add: pkg.credits,
        status: 'pending'
      });

      if (!dbRes.data) throw new Error('Invoice yaratib bo\'lmadi');
      const newInvoice = dbRes.data;

      // 2. PDF faylini generatsiya qilish va Storage-ga yuklash endpointini chaqirish
      const pdfRes = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: newInvoice.id })
      });
      const pdfData = await pdfRes.json();

      if (pdfData.success && pdfData.invoice) {
        setInvoices((prev) => [pdfData.invoice, ...prev]);
      } else {
        setInvoices((prev) => [newInvoice, ...prev]);
      }
    } catch (error) {
      console.error('Invoice generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulyatsiya qilingan to'lovni tasdiqlash
  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    try {
      const res = await fetch('/api/admin/pay-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();

      if (data.success && data.invoice) {
        // Balansni va ro'yxatni yangilash
        setCredits(data.newCreditsTotal);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? data.invoice : inv))
        );
      }
    } catch (error) {
      console.error('To\'lovda xatolik yuz berdi:', error);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      
      {/* Balans va kreditlar holati */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              <CardTitle className="text-xl font-bold text-white">Hisob Balansi</CardTitle>
            </div>
            <CardDescription className="text-zinc-400 mt-2">
              AI SEO Autopilot maqolalari yozish uchun sizning joriy hisobingiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2 bg-zinc-950/60 border border-zinc-800/80 p-6 rounded-2xl">
              <span className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {credits.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-zinc-400">maqola krediti qoldi</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Autopilot tizimida tasdiqlangan har bir kalit so'z bo'yicha Claude 3.5 Sonnet to'liq SEO maqola yozib, WordPress-ga yuklaganda balansdan 1 kredit yechiladi.
            </p>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#FF6B6B]" />
              <CardTitle className="text-lg font-bold text-white">Manual Invoice Billing</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Billing is fully automated via manual invoices and balance top-ups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FB3640]" />
                Active Plan: PRO Autopilot
              </div>
              <p className="text-[10px] text-zinc-500">
                PRO priority Claude content generation and infinite connected WP blogs.
              </p>
            </div>
            <a
              href="mailto:billing@jetblog.app"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Contact Billing Support
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Kredit sotib olish paketlari */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#FB3640]" /> Balansni To'ldirish Paketlari
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Biznesingiz yoki blogingiz hajmidan kelib chiqib hisobni chiroyli avtomatik hisob-faktura varaqasi orqali to'ldiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {TOPUP_PACKAGES.map((pkg, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="text-md font-bold text-zinc-200">{pkg.name}</h4>
                <p className="text-xs text-zinc-500 leading-normal">{pkg.desc}</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">${pkg.price}</span>
                  <span className="text-xs text-zinc-500">USD jami</span>
                </div>
                <Button
                  onClick={() => handleCreateInvoice(pkg)}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-[#FB3640] to-[#FB3640] hover:from-[#FF6B6B] hover:to-[#FB3640] text-white text-xs font-bold py-2.5 rounded-xl shadow-lg transition-all"
                >
                  {isGenerating ? 'Yaratilmoqda...' : 'Invoice Yaratish'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FB3640]" /> To'lov kvitansiyalari va hisob-fakturalar
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Yaratilgan hisob varaqalari va amalga oshirilgan to'lovlar tarixi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Summa (USD)</th>
                    <th className="py-3 px-4 text-center">Kreditlar</th>
                    <th className="py-3 px-4 text-center">Holati</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-zinc-400 max-w-[120px] truncate">{inv.id}</td>
                      <td className="py-3.5 px-4 text-zinc-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-white">${inv.amount_usd.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-500">+{inv.credits_to_add.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-2.5 h-2.5" /> To'langan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-2.5 h-2.5" /> Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {inv.status === 'pending' && (
                            <Button
                              size="sm"
                              disabled={payingInvoiceId === inv.id}
                              onClick={() => handlePayInvoice(inv.id)}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 rounded-lg flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3 h-3" />
                              {payingInvoiceId === inv.id ? 'To\'lov...' : 'To\'lash (Simulyatsiya)'}
                            </Button>
                          )}
                          
                          {inv.invoice_pdf_url && (
                            <a
                              href={inv.invoice_pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all"
                            >
                              <Download className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">PDF Yuklash</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-sm">
              Hech qanday hisob-kitob varaqalari yaratilmagan.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Billing;
