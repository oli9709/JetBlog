'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Send, 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Power,
  ExternalLink
} from 'lucide-react';
import { SiteT } from '@/lib/types/supabase';
import { SupabaseUpdateSite, SupabaseDeleteSite } from '@/lib/API/Database/sites/mutations';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { SiteCard } from './SiteCard';
import { SiteForm } from './SiteForm';
import { SchedulePicker } from './SchedulePicker';

interface ConnectionsClientPropsI {
  initialSites: SiteT[];
  userId: string;
}

export default function ConnectionsClient({ initialSites, userId }: ConnectionsClientPropsI) {
  const [sites, setSites] = useState<SiteT[]>(initialSites);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form holatlari
  const [url, setUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpPassword, setWpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // 1. Yangi WordPress sayt bog'lash
  const handleConnectSiteData = async (data: { url: string; wp_username: string; wp_password: string }) => {
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch('/api/sites/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'WordPress ulanishini tekshirishda xatolik yuz berdi.');
      }

      setFormSuccess('Saytingiz muvaffaqiyatli tekshirildi va ulandi!');
      setSites([resData.site, ...sites]);
      
      // Formani tozalash
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Ulanish muvaffaqiyatsiz tugadi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Saytni faollashtirish / vaqtincha to'xtatib turish
  const handleToggleActive = async (siteId: string, currentStatus: boolean) => {
    const originalSites = [...sites];
    
    // UI-ni tezkor yangilash (Optimistic UI)
    setSites(sites.map(site => site.id === siteId ? { ...site, is_active: !currentStatus } : site));

    try {
      const res = await SupabaseUpdateSite(siteId, userId, { is_active: !currentStatus });
      if (res.error) {
        throw new Error('Statusni o\'zgartirib bo\'lmadi');
      }
    } catch (err) {
      // Xatolik yuz bersa, asliga qaytarish
      setSites(originalSites);
      alert('Xatolik yuz berdi, ulanish holatini o\'zgartirib bo\'lmadi.');
    }
  };

  // 3. Sayt ulanishini o'chirish (Unlink)
  const handleDeleteSite = async (siteId: string, siteUrl: string) => {
    if (!confirm(`Haqiqatan ham ${siteUrl} sayt ulanishini o'chirib tashlamoqchimisiz?\nBu saytga tegishli kalit so'zlar va maqolalar o'chib ketadi!`)) {
      return;
    }

    try {
      const res = await SupabaseDeleteSite(siteId, userId);
      if (res.error) {
        throw new Error('O\'chirishda xatolik yuz berdi');
      }
      setSites(sites.filter(site => site.id !== siteId));
    } catch (err) {
      alert('WordPress sayt ulanishini o\'chirib bo\'lmadi.');
    }
  };

  // 4. Telegram kanalni bog'lash
  const handleConnectTelegram = async (siteId: string, telegramChatId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_chat_id: telegramChatId })
      });

      if (!response.ok) {
        throw new Error("Kanal ID noto'g'ri");
      }

      // UI ni yangilash
      setSites(sites.map(site => site.id === siteId ? { ...site, telegram_chat_id: telegramChatId } : site));
      toast.success("Telegram ulandi! ✅");
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
      throw err; // Modal yopilmasligi uchun
    }
  };

  // 5. Telegram kanalni uzish
  const handleDisconnectTelegram = async (siteId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_chat_id: null })
      });

      if (!response.ok) {
        throw new Error("Uzishda xatolik");
      }

      setSites(sites.map(site => site.id === siteId ? { ...site, telegram_chat_id: undefined } : site));
      toast.success("Telegram uzildi");
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="w-11/12 space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            WordPress Connections
          </h1>
          <p className="text-zinc-400 mt-2">
            Avtomatik nashr qilish (Autopilot) uchun WordPress saytlaringizni bog'lang va boshqaring.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Yangi sayt ulash
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
          <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Jami ulanishlar</div>
          <div className="text-4xl font-extrabold text-white mt-2">{sites.length} ta</div>
        </div>
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
          <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Faol autopilotlar</div>
          <div className="text-4xl font-extrabold text-cyan-400 mt-2">
            {sites.filter(s => s.is_active).length} ta
          </div>
        </div>
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
          <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Navbatdagi nashr kuni</div>
          <div className="text-lg font-semibold text-zinc-300 mt-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Har kuni soat 03:00 UTC
          </div>
        </div>
      </div>

      {/* SITES LIST */}
      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/20 backdrop-blur-md border border-zinc-800/60 rounded-3xl text-center">
          <Globe className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-zinc-300">Hech qanday sayt ulanmagan</h3>
          <p className="text-zinc-500 mt-2 max-w-md">
            JetBlog yordamida WordPress saytingizga avtomatik AI SEO maqolalarni yuklash uchun birinchi WordPress saytingizni bog'lang.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Birinchi saytni ulash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sites.map((site) => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onDelete={handleDeleteSite} 
              onToggle={handleToggleActive}
              onConnectTelegram={handleConnectTelegram}
              onDisconnectTelegram={handleDisconnectTelegram}
            />
          ))}
        </div>
      )}

      {/* 4. MODAL DIALOG: CONNECT NEW WordPress SITE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
            
            {/* Glow background accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Yangi WordPress sayt ulash
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setFormError('');
                  setFormSuccess('');
                }}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6">
              {/* API Feedback Alert Messages */}
              {formError && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              
              <SiteForm onSubmit={handleConnectSiteData} isLoading={isSubmitting} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
