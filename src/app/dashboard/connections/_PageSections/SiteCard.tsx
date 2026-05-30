'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Send, Globe, X, MessageCircle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils/helpers';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

const PLATFORM_BADGE: Record<string, { label: string; className: string }> = {
  wordpress: { label: 'WordPress', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  ghost: { label: 'Ghost', className: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  webflow: { label: 'Webflow', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
  webhook: { label: 'Webhook', className: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/40' },
};

interface SiteCardProps {
  site: {
    id: string;
    url: string;
    wp_username: string;
    platform_type?: string;
    is_active: boolean;
    publish_days: string[];
    publish_time: string;
    brand_voice: { tone?: string };
    telegram_chat_id?: string;
  };
  onDelete: (id: string, url: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onConnectTelegram?: (id: string, chatId: string) => Promise<void>;
  onDisconnectTelegram?: (id: string) => Promise<void>;
}

const DAYS_MAP: Record<string, string> = {
  Mon: 'Du', Tue: 'Se', Wed: 'Ch', Thu: 'Pa', Fri: 'Ju', Sat: 'Sh', Sun: 'Ya'
};

export const SiteCard: React.FC<SiteCardProps> = ({ site, onDelete, onToggle, onConnectTelegram, onDisconnectTelegram }) => {
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgChatId, setTgChatId] = useState('');
  const [isTgSubmitting, setIsTgSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTgSubmit = async () => {
    if (!tgChatId || !onConnectTelegram) return;
    setIsTgSubmitting(true);
    try {
      await onConnectTelegram(site.id, tgChatId);
      setShowTgModal(false);
      setTgChatId('');
    } catch (error) {
      // Xatolik ConnectionsClient dagi toast orqali chiqadi
    } finally {
      setIsTgSubmitting(false);
    }
  };

  const handleTgDisconnect = async () => {
    if (!onDisconnectTelegram) return;
    if (confirm("Haqiqatan ham Telegram kanalni uzmoqchimisiz?")) {
      await onDisconnectTelegram(site.id);
    }
  };

  return (
    <div className="group relative flex flex-col bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-white/10 overflow-hidden">
      
      {/* Background Gradient Glow on Hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-[#FB3640]/10 via-[#FB3640]/20 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 shadow-inner">
            <Globe className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 truncate max-w-[200px]">
              {site.url.replace(/^https?:\/\//, '')}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-zinc-500">@{site.wp_username}</p>
              {site.platform_type && PLATFORM_BADGE[site.platform_type] && (
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                  PLATFORM_BADGE[site.platform_type].className
                )}>
                  {PLATFORM_BADGE[site.platform_type].label}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Toggle */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <span className="relative flex h-2 w-2 mr-1">
            {site.is_active ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
            )}
          </span>
          <span className="text-xs font-medium text-zinc-400 mr-2">{site.is_active ? 'Faol' : 'Pauza'}</span>
          <Switch 
            checked={site.is_active}
            onCheckedChange={(checked) => onToggle(site.id, checked)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 mb-6 z-10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Nashr kunlari</span>
          <div className="flex gap-1">
            {site.publish_days.map(day => (
              <span key={day} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FB3640]/10 text-[#FF6B6B] border border-[#FB3640]/20 rounded-md shadow-sm">
                {DAYS_MAP[day] || day}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Nashr vaqti</span>
          <span className="text-zinc-300 font-mono bg-zinc-800/50 px-2 py-0.5 rounded border border-white/5 shadow-inner">
            {site.publish_time}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Ohang</span>
          <span className="text-zinc-300 capitalize">{site.brand_voice?.tone || 'Neutral'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto z-10">
        {site.telegram_chat_id ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/20 shadow-[0_0_10px_rgba(34,158,217,0.1)]">
              <Send className="w-3.5 h-3.5" />
              {site.telegram_chat_id}
            </div>
            <button 
              onClick={handleTgDisconnect}
              className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              Uzish
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowTgModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all duration-300 group-hover:border-white/10"
          >
            <Send className="w-3.5 h-3.5" />
            Telegram ulash
          </button>
        )}

        <button 
          onClick={() => onDelete(site.id, site.url)}
          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300"
          title="Saytni o'chirish"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Telegram Modal via Portal */}
      {mounted && showTgModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            
            {/* Glow Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#229ED9]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/20">
                    <MessageCircle className="w-5 h-5 text-[#229ED9]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Telegram Kanalini Ulash</h3>
                </div>
                <button 
                  onClick={() => setShowTgModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Kanal ID
                  </label>
                  <input
                    type="text"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="-100XXXXXXXXX"
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#229ED9]/50 focus:ring-1 focus:ring-[#229ED9]/50 transition-all"
                  />
                  <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#229ED9]" />
                    @userinfobot dan kanal ID ni oling
                  </p>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Qanday olish mumkin?</h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex gap-2">
                      <span className="text-[#229ED9] font-bold">1.</span>
                      <span>Botni kanalga admin qilib qo'shing</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#229ED9] font-bold">2.</span>
                      <span>@userinfobot ga kanaldan istalgan xabarni forward qiling</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#229ED9] font-bold">3.</span>
                      <span>Kelgan ID ni (-100 bilan boshlanadi) yuqoriga kiriting</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowTgModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <div className="flex-1">
                    <ShimmerButton
                      onClick={handleTgSubmit}
                      disabled={isTgSubmitting || !tgChatId}
                      className="w-full h-[42px] shadow-lg text-sm font-bold flex items-center justify-center gap-2"
                      background="linear-gradient(90deg, #229ED9 0%, #1a7bb0 100%)"
                    >
                      {isTgSubmitting ? 'Ulanmoqda...' : 'Ulash'}
                    </ShimmerButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
