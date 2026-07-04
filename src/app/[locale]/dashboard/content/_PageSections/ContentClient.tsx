'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Eye, 
  Globe, 
  Send, 
  Sparkles, 
  Trash2, 
  Search, 
  ChevronRight, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  Link as LinkIcon, 
  Code,
  Save,
  Hourglass,
  Plus
} from 'lucide-react';
import { SiteT, ArticleT } from '@/lib/types/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';
import { GetArticlesBySite } from '@/lib/API/Database/articles/queries';
import { SupabaseUpdateArticle, SupabaseDeleteArticle } from '@/lib/API/Database/articles/mutations';
import { TipTapEditor } from '@/components/ui/TipTapEditor';
import { ContentQueue } from './ContentQueue';
import { ArticleEditor } from './ArticleEditor';
import { GenerationProgressModal } from '@/components/content/GenerationProgressModal';
import { getDisplayHost } from '@/lib/utils/siteUrl';

interface ContentClientPropsI {
  initialSites: SiteT[];
  userId: string;
}

const MOCK_ARTICLES: Record<string, ArticleT[]> = {
  default: []
};

export default function ContentClient({ initialSites, userId }: ContentClientPropsI) {
  const [sites, setSites] = useState<SiteT[]>(initialSites);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSites.length > 0 ? initialSites[0].id : 'default'
  );

  const [articles, setArticles] = useState<ArticleT[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleT | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'error'>('all');
  
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [generatingArticleId, setGeneratingArticleId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Sayt maqolalarini yuklash
  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== 'default') {
      setIsSaving(true);
      GetArticlesBySite(selectedSiteId)
        .then((res) => {
          if (res.data) {
            setArticles(res.data);
            if (res.data.length > 0) {
              handleSelectArticle(res.data[0]);
            } else {
              setSelectedArticle(null);
            }
          }
        })
        .catch((err) => console.error('Maqolalarni yuklashda xatolik:', err))
        .finally(() => setIsSaving(false));
    } else {
      setArticles(MOCK_ARTICLES.default || []);
      if (MOCK_ARTICLES.default.length > 0) {
        handleSelectArticle(MOCK_ARTICLES.default[0]);
      } else {
        setSelectedArticle(null);
      }
    }
  }, [selectedSiteId]);

  const handleSelectArticle = (art: ArticleT) => {
    setSelectedArticle(art);
    setEditTitle(art.title);
    setEditContent(art.content);
  };

  // Maqoladagi o'zgarishlarni saqlash
  // newTitle/newContent uzatilsa — o'sha qiymatlar bilan saqlaydi (stale state oldini oladi).
  const handleSaveChanges = async (newTitle?: string, newContent?: string) => {
    if (!selectedArticle) return;
    const titleToSave = newTitle ?? editTitle;
    const contentToSave = newContent ?? editContent;
    setIsSaving(true);
    try {
      const res = await SupabaseUpdateArticle(selectedArticle.id, {
        title: titleToSave,
        content: contentToSave
      });
      if (res.data) {
        setArticles((prev) =>
          prev.map((art) => (art.id === selectedArticle.id ? res.data! : art))
        );
        setSelectedArticle(res.data);
      }
    } catch (err) {
      console.error('Maqolani yangilashda xatolik:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // AI optimallashtirish simulyatsiyasi
  const handleAIOptimize = async () => {
    if (!selectedArticle) return;
    setAiGenerating(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const optimizedText = editContent + `\n\n<p><em>♻️ JetBlog AI tomonidan optimallashgan: Maqola sarlavhasi, meta-tavsiflar va kalit so'zlar zichligi (LSI) SEO talablariga mos ravishda yaxshilandi.</em></p>`;
    setEditContent(optimizedText);
    setAiGenerating(false);
  };

  const handleGenerate = async (keywordId: string) => {
    setGenerationError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generatsiya xatosi');
      if (data.articleId) {
        setGeneratingArticleId(data.articleId);
        setGenerationModalOpen(true);
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Noma\'lum xato');
    }
  };

  const handleGenerationComplete = (article: ArticleT) => {
    setGenerationModalOpen(false);
    setGeneratingArticleId(null);
    setArticles((prev) => {
      const exists = prev.find((a) => a.id === article.id);
      return exists ? prev.map((a) => (a.id === article.id ? article : a)) : [article, ...prev];
    });
    handleSelectArticle(article);
  };

  const handleGenerationError = (error: string) => {
    setGenerationModalOpen(false);
    setGeneratingArticleId(null);
    setGenerationError(error);
  };

  // Maqolani nashr qilish — platform-aware (WordPress, Ghost, Webhook, Webflow)
  const handlePublishNow = async (idToPublish?: string) => {
    const targetId = idToPublish || selectedArticle?.id;
    if (!targetId) return;
    setIsPublishing(true);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: targetId })
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.article) {
        setArticles((prev) =>
          prev.map((art) => (art.id === targetId ? data.article : art))
        );
        if (selectedArticle?.id === targetId) setSelectedArticle(data.article);
      }
    } catch (err: any) {
      console.error('Nashr qilishda xatolik yuz berdi:', err);
      // Agar xato bo'lsa, maqola statusini 'error' qilamiz
      const errRes = await SupabaseUpdateArticle(targetId, {
        status: 'error',
        error_message: err.message || 'WordPress nashr qilish xatoligi'
      });
      if (errRes.data) {
        setArticles((prev) =>
          prev.map((art) => (art.id === targetId ? errRes.data! : art))
        );
        if (selectedArticle?.id === targetId) setSelectedArticle(errRes.data);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Maqolani o'chirish
  const handleDeleteArticle = async (id: string) => {
    try {
      await SupabaseDeleteArticle(id);
      const updated = articles.filter((art) => art.id !== id);
      setArticles(updated);
      if (updated.length > 0) {
        handleSelectArticle(updated[0]);
      } else {
        setSelectedArticle(null);
      }
    } catch (err) {
      console.error('Maqolani o\'chirishda xatolik:', err);
    }
  };

  // Filtrlash
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
    <div className="w-full max-w-7xl px-4 space-y-6">
      
      {/* Sarlavha & Sayt selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 bg-gradient-to-r from-[#FB3640] to-[#FB3640] bg-clip-text text-transparent">
            <FileText className="h-8 w-8 text-[#FB3640]" />
            Content Queue & Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Rejalashtirilgan maqolalarni ko'ring, tahrirlang yoki darhol nashr qiling.
          </p>
        </div>

        {sites.length > 0 && (
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
                Maqolalar ro'yxatini va rejalarini ko'rish uchun avval WordPress saytini ulanishi kerak.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-200px)] min-h-[700px]">
          
          {/* LEFT: Content Queue ro'yxati (4 columns) */}
          <div className="lg:col-span-4 h-full">
            <ContentQueue
              articles={articles as any}
              selectedId={selectedArticle?.id || null}
              onSelect={(id) => {
                const art = articles.find(a => a.id === id);
                if (art) handleSelectArticle(art);
              }}
              onPublish={(id) => handlePublishNow(id)}
              onDelete={handleDeleteArticle}
              isLoading={isSaving && articles.length === 0}
            />
          </div>

          {/* RIGHT: TipTap Document Editor Workspace (8 columns) */}
          <div className="lg:col-span-8 h-full">
            <ArticleEditor
              article={selectedArticle as any}
              onSave={(id, title, content) => {
                setEditTitle(title);
                setEditContent(content);
                handleSaveChanges(title, content);
              }}
              onPublishNow={(id) => handlePublishNow(id)}
              isSaving={isSaving}
              isPublishing={isPublishing}
            />
          </div>

        </div>
      )}

    </div>

      {generatingArticleId && (
        <GenerationProgressModal
          open={generationModalOpen}
          articleId={generatingArticleId}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
      )}
    </>
  );
}
