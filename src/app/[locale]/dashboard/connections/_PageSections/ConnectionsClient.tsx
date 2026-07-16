'use client';

import React, { useState } from 'react';
import { Globe, Calendar, Plus, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SiteT } from '@/lib/types/supabase';
import { SupabaseUpdateSite, SupabaseDeleteSite } from '@/lib/API/Database/sites/mutations';
import { toast } from 'react-toastify';
import { SiteCard } from './SiteCard';
import { AddConnectionWizard } from '@/components/connections/AddConnectionWizard';
import { cn } from '@/lib/utils/helpers';
import { useTranslations } from 'next-intl';

interface ConnectionsClientPropsI {
  initialSites: SiteT[];
  userId: string;
}

// ─── Tab styles helper ────────────────────────────────────────────────────────
const tabTriggerCls = (active = false) =>
  cn(
    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
    active
      ? 'bg-zinc-800 text-white shadow-sm'
      : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
  );

export default function ConnectionsClient({ initialSites, userId }: ConnectionsClientPropsI) {
  const t = useTranslations('Dashboard');
  const [sites, setSites] = useState<SiteT[]>(initialSites);
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (site: any) => {
    if (site) {
      // DB insert.data may omit default columns if the DB default wasn't echoed back.
      // Merge safe fallbacks so SiteCard never receives null for fields it iterates.
      const safeSite: SiteT = {
        ...site,
        publish_days: site.publish_days ?? [],
        publish_time: site.publish_time ?? '09:00',
        brand_voice: site.brand_voice ?? {},
        is_active: site.is_active ?? true,
        adapter_config: site.adapter_config ?? {},
      };
      setSites((prev) => [safeSite, ...prev]);
    }
    setShowWizard(false);
    toast.success('Sayt muvaffaqiyatli ulandi! ✅');
  };

  const handleToggleActive = async (siteId: string, currentStatus: boolean) => {
    const originalSites = [...sites];
    setSites(sites.map((s) => (s.id === siteId ? { ...s, is_active: !currentStatus } : s)));
    try {
      const res = await SupabaseUpdateSite(siteId, userId, { is_active: !currentStatus });
      if (res.error) throw new Error();
    } catch {
      setSites(originalSites);
      toast.error("Holatni o'zgartirib bo'lmadi");
    }
  };

  const handleDeleteSite = async (siteId: string, siteUrl: string) => {
    if (!confirm(`Haqiqatan ham ${siteUrl} ulanishini o'chirib tashlamoqchimisiz?\nBu saytga tegishli kalit so'zlar va maqolalar o'chib ketadi!`)) return;
    try {
      const res = await SupabaseDeleteSite(siteId, userId);
      if (res.error) throw new Error();
      setSites(sites.filter((s) => s.id !== siteId));
      toast.success("Sayt o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleConnectTelegram = async (siteId: string, telegramChatId: string) => {
    const response = await fetch(`/api/sites/${siteId}/telegram`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_chat_id: telegramChatId }),
    });
    if (!response.ok) throw new Error("Kanal ID noto'g'ri");
    setSites(sites.map((s) => (s.id === siteId ? { ...s, telegram_chat_id: telegramChatId } : s)));
    toast.success('Telegram ulandi! ✅');
  };

  const handleDisconnectTelegram = async (siteId: string) => {
    const response = await fetch(`/api/sites/${siteId}/telegram`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_chat_id: null }),
    });
    if (!response.ok) throw new Error('Uzishda xatolik');
    setSites(sites.map((s) => (s.id === siteId ? { ...s, telegram_chat_id: undefined } : s)));
    toast.success('Telegram uzildi');
  };

  return (
    <div className="w-11/12 space-y-8 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#FB3640]">
            {t('connectionsTitle')}
          </h1>
          <p className="text-zinc-400 mt-2">
            {t('connectionsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#FB3640] hover:from-cyan-400 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          {t('addSite')}
        </button>
      </div>

      {/* Sites section — AI Builder tab olib tashlandi (endi Webhook oqimi ichida ko'rsatiladi) */}
      <div className="space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
              <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('totalConnections')}</div>
              <div className="text-4xl font-extrabold text-white mt-2">{sites.length} {t('count')}</div>
            </div>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
              <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('activeAutopilots')}</div>
              <div className="text-4xl font-extrabold text-cyan-400 mt-2">
                {sites.filter((s) => s.is_active).length} {t('count')}
              </div>
            </div>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl">
              <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('nextPublishDay')}</div>
              <div className="text-lg font-semibold text-zinc-300 mt-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF6B6B]" />
                {t('everyDayAt')} 03:00 UTC
              </div>
            </div>
          </div>

          {/* SITES LIST */}
          {sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/20 backdrop-blur-md border border-zinc-800/60 rounded-3xl text-center">
              <Globe className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-zinc-300">{t('noSitesTitle')}</h3>
              <p className="text-zinc-500 mt-2 max-w-md">
                {t('noSitesDesc')}
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                {t('connectFirstSite')}
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
        </div>

      {/* WIZARD DIALOG */}
      <DialogPrimitive.Root open={showWizard} onOpenChange={setShowWizard}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className={cn(
              'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-xl max-h-[90vh] overflow-y-auto',
              'bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
            )}
          >
            {/* Glow accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FB3640]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between pb-5 border-b border-zinc-800 mb-6">
              <DialogPrimitive.Title className="text-xl font-bold text-white">
                Yangi sayt ulash
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors">
                <X className="w-5 h-5" />
              </DialogPrimitive.Close>
            </div>

            <AddConnectionWizard onComplete={handleWizardComplete} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
