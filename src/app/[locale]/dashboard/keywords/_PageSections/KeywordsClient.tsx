'use client';

import { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Search, 
  Filter, 
  Globe, 
  Check, 
  Trash2, 
  Sparkles, 
  ArrowUpRight, 
  Volume2, 
  AlertCircle,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { SiteT, KeywordT } from '@/lib/types/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { GetKeywordsBySite } from '@/lib/API/Database/keywords/queries';
import { SupabaseInsertKeywords, SupabaseUpdateKeyword, SupabaseDeleteKeyword } from '@/lib/API/Database/keywords/mutations';
import { toast } from 'react-toastify';
import { KeywordTable } from './KeywordTable';
import { KeywordFilters } from './KeywordFilters';
import { KeywordForm } from './KeywordForm';
import { getDisplayHost } from '@/lib/utils/siteUrl';

interface KeywordsClientPropsI {
  initialSites: SiteT[];
  userId: string;
}

const MOCK_KEYWORDS: Record<string, KeywordT[]> = {
  default: []
};

export default function KeywordsClient({ initialSites, userId }: KeywordsClientPropsI) {
  const [sites, setSites] = useState<SiteT[]>(initialSites);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSites.length > 0 ? initialSites[0].id : 'default'
  );
  
  const [keywords, setKeywords] = useState<KeywordT[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'uz' | 'ru' | 'en'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');
  
  const [newKeyword, setNewKeyword] = useState('');
  const [newLang, setNewLang] = useState<'uz' | 'ru' | 'en'>('uz');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);

  // Sayt o'zgarganda kalit so'zlarni yuklash
  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== 'default') {
      setIsSubmitting(true);
      GetKeywordsBySite(selectedSiteId)
        .then((res) => {
          if (res.data) {
            setKeywords(res.data);
          }
        })
        .catch((err) => console.error('Kalit so\'zlarni yuklashda xatolik:', err))
        .finally(() => setIsSubmitting(false));
    } else {
      setKeywords(MOCK_KEYWORDS.default || []);
    }
  }, [selectedSiteId]);

  // Kalit so'z qo'shish
  const handleAddKeyword = async (newKeywordText: string, newLangCode: string) => {
    if (!newKeywordText.trim() || selectedSiteId === 'default') return;

    setIsSubmitting(true);
    try {
      // 1. Tahlil natijasini API orqali olish
      const fetchRes = await fetch('/api/keywords/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeywordText.trim(), language: newLangCode })
      });
      const fetchedData = await fetchRes.json();

      if (fetchedData.error) {
        throw new Error(fetchedData.error);
      }

      // 2. Supabase-ga saqlash
      const dbRes = await SupabaseInsertKeywords([{
        site_id: selectedSiteId,
        keyword: newKeywordText.trim(),
        language: newLangCode as 'uz' | 'ru' | 'en',
        search_volume: fetchedData.searchVolume || 350,
        difficulty: fetchedData.difficulty || 15,
        status: 'pending',
        approved_by_user: false
      }]);

      if (dbRes.data && dbRes.data.length > 0) {
        setKeywords((prev) => [dbRes.data![0], ...prev]);
      }
    } catch (err) {
      console.error('Kalit so\'z qo\'shishda xatolik:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk (ommaviy) yuklash
  const handleBulkAdd = async () => {
    if (!bulkText.trim() || selectedSiteId === 'default') return;
    setIsSubmitting(true);

    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      const insertedKws: any[] = [];
      for (const kw of lines) {
        const fetchRes = await fetch('/api/keywords/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: kw, language: newLang })
        });
        const fetchedData = await fetchRes.json();
        
        insertedKws.push({
          site_id: selectedSiteId,
          keyword: kw,
          language: newLang,
          search_volume: fetchedData.searchVolume || 200,
          difficulty: fetchedData.difficulty || 12,
          status: 'pending',
          approved_by_user: false
        });
      }

      const dbRes = await SupabaseInsertKeywords(insertedKws);
      if (dbRes.data) {
        setKeywords((prev) => [...dbRes.data!, ...prev]);
      }
      setBulkText('');
      setIsBulkOpen(false);
    } catch (err) {
      console.error('Ommaviy yuklashda xatolik:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tasdiqlash (Approve)
  const handleApprove = async (id: string) => {
    try {
      const dbRes = await SupabaseUpdateKeyword(id, {
        status: 'approved',
        approved_by_user: true
      });
      if (dbRes.data) {
        setKeywords((prev) =>
          prev.map((kw) => (kw.id === id ? dbRes.data! : kw))
        );

        // AI maqola generatsiyasini boshlash
        setGeneratingIds((prev) => [...prev, id]);
        toast.info("Sun'iy intellekt maqola va muqova rasmini generatsiya qilishni boshladi... Iltimos kutib turing ⏳", {
          autoClose: 8000
        });

        try {
          const genRes = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywordId: id })
          });
          const genData = await genRes.json();

          if (!genRes.ok || genData.error) {
            throw new Error(genData.error || "Generatsiya xatoligi");
          }

          if (genData.success && genData.article) {
            // Kalit so'z holatini local darajada 'completed' va article_id bilan yangilash
            setKeywords((prev) =>
              prev.map((kw) =>
                kw.id === id
                  ? { ...kw, status: 'completed', article_id: genData.article.id }
                  : kw
              )
            );
            toast.success("AI Maqola va Muqova rasm muvaffaqiyatli yaratildi! U Content Queue bo'limiga qo'shildi. 🎉");
          }
        } catch (genErr: any) {
          console.error("AI maqola generatsiya xatoligi:", genErr);
          toast.error(`Maqola yaratishda xatolik yuz berdi: ${genErr.message || 'Kutilmagan xatolik'}`);
        } finally {
          setGeneratingIds((prev) => prev.filter((gid) => gid !== id));
        }
      }
    } catch (err) {
      console.error('Kalit so\'zni tasdiqlashda xatolik:', err);
      toast.error("Kalit so'zni tasdiqlashda xatolik yuz berdi.");
    }
  };

  // Kalit so'zni o'chirish
  const handleDelete = async (id: string) => {
    try {
      await SupabaseDeleteKeyword(id);
      setKeywords((prev) => prev.filter((kw) => kw.id !== id));
    } catch (err) {
      console.error('Kalit so\'zni o\'chirishda xatolik:', err);
    }
  };

  // Filtrlash jarayoni
  const filteredKeywords = keywords.filter((kw) => {
    const matchesSearch = kw.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = langFilter === 'all' || kw.language === langFilter;
    const matchesStatus = statusFilter === 'all' || kw.status === statusFilter;
    return matchesSearch && matchesLang && matchesStatus;
  });

  // Stats
  const totalVolume = keywords.reduce((sum, kw) => sum + kw.search_volume, 0);
  const approvedCount = keywords.filter((kw) => kw.status === 'approved').length;
  const completedCount = keywords.filter((kw) => kw.status === 'completed').length;
  const easyKeywordsCount = keywords.filter((kw) => kw.difficulty < 35).length;

  return (
    <div className="w-full max-w-7xl px-4 space-y-6">
      
      {/* Sarlavha va Sayt tanlagich */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 bg-gradient-to-r from-[#FB3640] to-[#FB3640] bg-clip-text text-transparent">
            <Key className="h-8 w-8 text-[#FB3640]" />
            Kalit so'zlar avtopiloti
          </h1>
          <p className="text-muted-foreground mt-1">
            SEO kalit so'zlarni tahlil qiling va WordPress autopilotingizni boshqaring.
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
              <Plus className="mr-1.5 h-4 w-4" /> Sayt Bog'lash
            </Button>
          </Link>
        )}
      </div>

      {sites.length === 0 && (
        <Card className="border-dashed border-2 py-10 text-center">
          <CardContent className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-[#FB3640]/10 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#FB3640]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <CardTitle>WordPress sayt bog'lanmagan</CardTitle>
              <CardDescription>
                Kalit so'zlar bilan ishlash va AI SEO autopilotini ishga tushirish uchun avval kamida bitta WordPress saytini ulashingiz kerak.
              </CardDescription>
            </div>
            <Link href="/dashboard/connections">
              <Button className="bg-[#FB3640] hover:bg-[#e02d36] mt-2">
                <Plus className="mr-1.5 h-4 w-4" /> Hozir bog'lash
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {sites.length > 0 && (
        <>
          {/* Glassmorphic Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md border border-white/5 shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Jami kalit so'zlar</p>
                  <Key className="h-4 w-4 text-[#FB3640]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{keywords.length}</span>
                  <span className="text-xs text-muted-foreground">dona</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md border border-white/5 shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">SEO Trafik Potensiali</p>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{(totalVolume / 1000).toFixed(1)}k</span>
                  <span className="text-xs text-muted-foreground">oyiga qidiruv</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md border border-white/5 shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Tasdiqlanganlar</p>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{approvedCount}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    yozilmoqda
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md border border-white/5 shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Oson kalit so'zlar</p>
                  <Check className="h-4 w-4 text-[#FB3640]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {keywords.length > 0 ? Math.round((easyKeywordsCount / keywords.length) * 100) : 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">qiyinchilik &lt; 35</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Kalit so'z qo'shish paneli (Form) */}
            <div className="space-y-6">
              <KeywordForm 
                onSubmit={handleAddKeyword} 
                isLoading={isSubmitting} 
                siteId={selectedSiteId} 
              />
              
              <Button 
                variant="outline" 
                className="w-full border-dashed border-[#222222] bg-[#111111]/80 hover:bg-black text-zinc-400 h-12 rounded-xl"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-[#FB3640]" />
                Ommaviy yuklash (Bulk Upload)
              </Button>

              {isBulkOpen && (
                <div className="space-y-3 border border-[#222222] p-5 rounded-2xl bg-[#111111]/80 backdrop-blur-xl shadow-xl">
                  <label className="text-xs font-semibold text-zinc-500 block">
                    Kalit so'zlar ro'yxati (Har bir qatorga bitta)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="AI maqola yozish&#10;WordPress avtomatlashtirish&#10;SEO maslahatlar"
                    className="w-full text-sm p-4 rounded-xl bg-black/40 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#FB3640] text-white placeholder-zinc-700 transition-all duration-300"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white" onClick={() => setIsBulkOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={isSubmitting || !bulkText.trim()}
                      onClick={handleBulkAdd}
                      className="bg-[#FB3640] hover:bg-[#e02d36] rounded-lg px-4"
                    >
                      {isSubmitting ? 'Kiritilmoqda...' : 'Yuklash'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Informative Guidance Card */}
              <Card className="bg-[#111111]/80 backdrop-blur-xl border border-[#222222] shadow-xl rounded-2xl">
                <CardContent className="pt-6 flex gap-4">
                  <AlertCircle className="h-5 w-5 text-[#FB3640] shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-zinc-200">Autopilot qanday ishlaydi?</h4>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Siz kalit so'zlarni tasdiqlaganingizdan so'ng, JetBlog autopilot tizimi belgilangan kunda avtomatik ravishda SEO maqola generatsiya qiladi va uni WordPress ga nashr etadi.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kalit so'zlar jadvali va filtrlari */}
            <div className="lg:col-span-2 space-y-6">
              
              <KeywordFilters
                selectedLanguage={langFilter}
                selectedStatus={statusFilter}
                onLanguageChange={(lang) => setLangFilter(lang as any)}
                onStatusChange={(status) => setStatusFilter(status as any)}
                totalCount={keywords.length}
                approvedCount={approvedCount}
              />

              <div className="relative w-full">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 z-10" />
                <Input
                  placeholder="Kalit so'zlar bo'yicha izlash..."
                  className="pl-12 bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-xl text-white focus:ring-1 focus:ring-[#FB3640] focus-visible:ring-[#FB3640] h-12 shadow-xl border-none outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Kalit so'zlar jadvali - Yaratilgan WOW komponent */}
              <KeywordTable 
                keywords={filteredKeywords as any} 
                onApprove={handleApprove} 
                onDelete={handleDelete} 
                onViewArticle={(id) => { window.location.href = '/dashboard/content' }} 
              />

            </div>

          </div>
        </>
      )}

    </div>
  );
}
