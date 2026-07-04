'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Sparkles,
  Globe,
  Plus
} from 'lucide-react';
import { SiteT } from '@/lib/types/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { BrandForm, BrandVoiceData } from './BrandForm';
import { SiteScanner } from './SiteScanner';
import { Analytics } from './Analytics';
import type { GSCStats } from '@/lib/API/Services/gsc/fetch';
import { getDisplayHost } from '@/lib/utils/siteUrl';

interface BrandVoiceClientPropsI {
  initialSites: SiteT[];
  userId: string;
}

interface GSCState {
  connected: boolean;
  loading: boolean;
  gscSiteUrl?: string;
  stats?: GSCStats;
  noSite?: boolean;
}

const EMPTY_STATS = {
  totalArticles: 0, publishedThisMonth: 0, publishedThisWeek: 0,
  avgWordsPerArticle: 0,
  topKeywords: [] as { keyword: string; count: number }[],
  publishHistory: [] as { date: string; count: number }[],
};

export default function BrandVoiceClient({ initialSites, userId }: BrandVoiceClientPropsI) {
  const [sites] = useState<SiteT[]>(initialSites);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSites.length > 0 ? initialSites[0].id : 'default'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [gsc, setGsc] = useState<GSCState>({ connected: false, loading: false });
  const [stats, setStats] = useState(EMPTY_STATS);

  const fetchStats = useCallback(async (siteId: string) => {
    if (!siteId || siteId === 'default') { setStats(EMPTY_STATS); return; }
    try {
      const res = await fetch(`/api/analytics/stats?siteId=${siteId}`).then(r => r.json());
      setStats({
        totalArticles: res.totalArticles ?? 0,
        publishedThisMonth: res.publishedThisMonth ?? 0,
        publishedThisWeek: res.publishedThisWeek ?? 0,
        avgWordsPerArticle: res.avgWordsPerArticle ?? 0,
        topKeywords: res.topKeywords ?? [],
        publishHistory: res.publishHistory ?? [],
      });
    } catch { setStats(EMPTY_STATS); }
  }, []);

  useEffect(() => { fetchStats(selectedSiteId); }, [selectedSiteId, fetchStats]);

  const searchParams = useSearchParams();

  // Show GSC callback toasts
  useEffect(() => {
    const gscParam = searchParams.get('gsc');
    if (gscParam === 'success') {
      toast.success('GSC muvaffaqiyatli ulandi! ✅');
    } else if (gscParam === 'error') {
      toast.error('GSC ulanishda xatolik ❌');
    }
  }, [searchParams]);

  const fetchGSCStats = useCallback(async (siteId: string) => {
    if (!siteId || siteId === 'default') return;
    setGsc(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/gsc/stats?siteId=${siteId}`).then(r => r.json());
      if (res.connected) {
        setGsc({
          connected: true,
          loading: false,
          gscSiteUrl: res.gscSiteUrl,
          stats: res.stats,
          noSite: res.noSite
        });
      } else {
        setGsc({ connected: false, loading: false });
      }
    } catch {
      setGsc({ connected: false, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchGSCStats(selectedSiteId);
  }, [selectedSiteId, fetchGSCStats]);

  const handleConnectGSC = () => {
    if (!selectedSiteId || selectedSiteId === 'default') {
      toast.error('Avval sayt tanlang');
      return;
    }
    window.location.href = `/api/gsc/auth?siteId=${selectedSiteId}`;
  };

  const handleDisconnectGSC = async () => {
    setGsc(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/gsc/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: selectedSiteId })
      }).then(r => r.json());
      if (res.success) {
        toast.info('GSC uzildi');
        setGsc({ connected: false, loading: false });
      } else {
        toast.error(res.error || 'Xatolik');
        setGsc(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setGsc(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveForm = async (data: BrandVoiceData) => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
  };

  const handleScanUrl = async (_url: string) => {
    setIsScanning(true);
  };

  const handleScanComplete = (_data: BrandVoiceData) => {
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-7xl px-4 space-y-6">

      {/* Header & site selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 bg-gradient-to-r from-[#FB3640] to-[#FB3640] bg-clip-text text-transparent">
            <Sparkles className="h-8 w-8 text-[#FB3640]" />
            Brend ovozi DNK
          </h1>
          <p className="text-muted-foreground mt-1">
            Sun'iy intellekt yozish uslubini biznesingiz shaxsiyatiga moslashtiring.
          </p>
        </div>

        {sites.length > 0 ? (
          <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark border rounded-xl p-1.5 shadow-sm">
            <Globe className="h-4 w-4 text-muted-foreground ml-2" />
            <select
              className="bg-transparent text-sm font-medium border-0 focus:ring-0 cursor-pointer outline-none pr-6"
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {getDisplayHost(s)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Link href="/dashboard/connections">
            <Button size="sm" className="bg-[#FB3640] hover:bg-[#e02d36]">
              Bog'lanish
            </Button>
          </Link>
        )}
      </div>

      {sites.length === 0 ? (
        <Card className="border-dashed border-2 py-10 text-center">
          <CardContent className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-[#FB3640]/10 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#FB3640]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <CardTitle>WordPress sayt bog'lanmagan</CardTitle>
              <CardDescription>
                Brend ovozi va AI yozish DNKsini o'rnatish uchun avval bitta WordPress saytini ulashingiz kerak.
              </CardDescription>
            </div>
            <Link href="/dashboard/connections">
              <Button className="bg-[#FB3640] hover:bg-[#e02d36] mt-2">
                <Plus className="mr-1.5 h-4 w-4" /> Sayt ulashtirish
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-10 pb-20">

          {/* Analytics + GSC */}
          <section>
            <Analytics
              siteId={selectedSiteId}
              stats={stats}
              gsc={gsc}
              onConnectGSC={handleConnectGSC}
              onDisconnectGSC={handleDisconnectGSC}
            />
          </section>

          {/* AI Scanner */}
          <section>
            <SiteScanner
              onScan={handleScanUrl}
              isScanning={isScanning}
              onScanComplete={handleScanComplete}
            />
          </section>

          {/* Brand DNA form */}
          <section>
            <BrandForm
              siteId={selectedSiteId}
              isSaving={isSaving}
              onSave={handleSaveForm}
            />
          </section>

        </div>
      )}
    </div>
  );
}
