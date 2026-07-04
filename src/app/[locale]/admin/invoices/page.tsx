'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Invoice {
  id: string;
  user_id: string;
  amount_usd: number;
  credits_to_add: number;
  status: 'pending' | 'paid' | 'cancelled';
  invoice_pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
  user_email?: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setLoading(true);
    const res = await fetch('/api/admin/invoices').then(r => r.json());
    setInvoices(res.invoices || []);
    setLoading(false);
  }

  async function payInvoice(id: string) {
    setActionId(id);
    const res = await fetch('/api/admin/pay-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: id })
    }).then(r => r.json());
    setActionId(null);
    if (res.success) {
      toast.success(`✅ To'landi! +${res.creditsLoaded} kredit qo'shildi`);
      fetchInvoices();
    } else {
      toast.error(res.error || 'Xatolik');
    }
  }

  async function cancelInvoice(id: string) {
    setActionId(id);
    const res = await fetch('/api/admin/cancel-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: id })
    }).then(r => r.json());
    setActionId(null);
    if (res.success) {
      toast.info('❌ Invoice bekor qilindi');
      fetchInvoices();
    } else {
      toast.error(res.error || 'Xatolik');
    }
  }

  const pending = invoices.filter(i => i.status === 'pending');
  const done = invoices.filter(i => i.status !== 'pending');

  function InvoiceRow({ inv, showActions }: { inv: Invoice; showActions: boolean }) {
    return (
      <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
        <td className="py-3 px-4 text-sm text-white/60">{inv.user_email || inv.user_id.slice(0, 8) + '...'}</td>
        <td className="py-3 px-4 text-sm font-mono text-green-400">${inv.amount_usd}</td>
        <td className="py-3 px-4 text-sm font-mono text-blue-400">+{inv.credits_to_add}</td>
        <td className="py-3 px-4 text-xs text-white/40">{new Date(inv.created_at).toLocaleDateString('uz-UZ')}</td>
        <td className="py-3 px-4">
          {inv.invoice_pdf_url ? (
            <a href={inv.invoice_pdf_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline">PDF</a>
          ) : <span className="text-xs text-white/20">—</span>}
        </td>
        <td className="py-3 px-4">
          {inv.status === 'paid' && (
            <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full">
              ✅ {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('uz-UZ') : 'To\'landi'}
            </span>
          )}
          {inv.status === 'cancelled' && (
            <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded-full">❌ Bekor</span>
          )}
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => payInvoice(inv.id)}
                disabled={actionId === inv.id}
                className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
              >
                {actionId === inv.id ? '...' : '✅ To\'landi'}
              </button>
              <button
                onClick={() => cancelInvoice(inv.id)}
                disabled={actionId === inv.id}
                className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
              >
                ❌ Bekor
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  }

  function InvoiceTable({ rows, showActions, empty }: { rows: Invoice[]; showActions: boolean; empty: string }) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-white/30 text-sm p-6">{empty}</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/30 uppercase tracking-wide">
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Summa</th>
                <th className="py-3 px-4">Kredit</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">PDF</th>
                <th className="py-3 px-4">Amal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(inv => <InvoiceRow key={inv.id} inv={inv} showActions={showActions} />)}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Invoicelar</h1>
        <p className="text-white/40 text-sm mt-1">To&apos;lov so&apos;rovlarini boshqarish</p>
      </div>

      {loading ? (
        <p className="text-white/30">Yuklanmoqda...</p>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              ⏳ Pending
              {pending.length > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
              )}
            </h2>
            <InvoiceTable rows={pending} showActions={true} empty="Pending invoice yo'q" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/50 mb-3">📋 Tarix</h2>
            <InvoiceTable rows={done} showActions={false} empty="Tarix bo'sh" />
          </div>
        </>
      )}
    </div>
  );
}
