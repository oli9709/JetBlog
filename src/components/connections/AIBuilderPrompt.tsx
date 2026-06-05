'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Zap, RefreshCw, ExternalLink, ChevronRight } from 'lucide-react';
import { generatePrompt, PLATFORM_META, type AIPlatform } from '@/lib/ai-builder-prompts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIBuilderPromptProps {
  userId: string;
}

interface WebhookData {
  id: string;
  endpoint_url: string;
  secret_key: string;
  source_platform: AIPlatform;
  connection_tested: boolean;
}

const RECEIVE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/receive`
    : '/api/webhooks/receive';

const PLATFORMS: AIPlatform[] = ['nextjs', 'laravel', 'django', 'nuxt'];

const STEPS = [
  'Platformani tanlang',
  'Kodni nusxalang',
  'Serveringizga joylashtiring',
  'Ulanishni sinab ko\'ring',
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AIBuilderPrompt({ userId }: AIBuilderPromptProps) {
  const [platform, setPlatform] = useState<AIPlatform>('nextjs');
  const [webhook, setWebhook]   = useState<WebhookData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [testing, setTesting]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [tested, setTested]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Auto-create webhook on mount
  useEffect(() => {
    void initWebhook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initWebhook = async () => {
    setLoading(true);
    setError(null);
    try {
      // Avval mavjud AI builder webhookini tekshirish
      const listRes = await fetch('/api/webhooks');
      const listJson = await listRes.json();
      const existing = (listJson.webhooks ?? []).find(
        (w: any) => w.endpoint_url === RECEIVE_URL
      );

      if (existing) {
        setWebhook({
          id:                existing.id,
          endpoint_url:      existing.endpoint_url,
          secret_key:        existing.secret_key,
          source_platform:   existing.source_platform ?? 'nextjs',
          connection_tested: existing.connection_tested ?? false,
        });
        setPlatform(existing.source_platform ?? 'nextjs');
        setTested(existing.connection_tested ?? false);
        return;
      }

      // Yangi webhook yaratish — avval birinchi saytni topish kerak
      const sitesRes = await fetch('/api/sites');
      const sitesJson = await sitesRes.json();
      const firstSite = sitesJson.sites?.[0];

      if (!firstSite) {
        setError('Avval kamida bitta sayt uling (Connections → Sayt qo\'shish)');
        return;
      }

      const createRes = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id:         firstSite.id,
          endpoint_url:    RECEIVE_URL,
          events:          ['article.published'],
          source_platform: platform,
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.webhook) {
        setError(createJson.error ?? 'Webhook yaratishda xatolik');
        return;
      }

      setWebhook({
        id:                createJson.webhook.id,
        endpoint_url:      createJson.webhook.endpoint_url,
        secret_key:        createJson.webhook.secret_key,
        source_platform:   createJson.webhook.source_platform ?? platform,
        connection_tested: false,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Kutilmagan xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!webhook) return;
    const code = generatePrompt({
      platform,
      webhookUrl:  webhook.endpoint_url,
      secretKey:   webhook.secret_key,
      webhookId:   webhook.id,
    });
    await navigator.clipboard.writeText(code);
    setCopied(true);

    // platform ni webhookda yangilash
    await fetch('/api/webhooks', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id:                 webhook.id,
        source_platform:    platform,
        prompt_generated_at: new Date().toISOString(),
      }),
    }).catch(() => null);

    setTimeout(() => setCopied(false), 2000);
  }, [webhook, platform]);

  const handleTest = async () => {
    if (!webhook) return;
    setTesting(true);
    try {
      const testBody = JSON.stringify({
        event: 'article.published',
        data: {
          id:              'test-article-id',
          title:           'Test maqola — JetBlog AI Builder',
          keyword:         'test keyword',
          content:         '<h1>Test</h1><p>Bu test so\'rov.</p>',
          featuredImageUrl: null,
          publishedAt:     new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      const res = await fetch(webhook.endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type':          'application/json',
          'X-JetBlog-Webhook-Id':  webhook.id,
        },
        body: testBody,
      });

      if (res.ok) {
        setTested(true);
        setWebhook((prev) => prev ? { ...prev, connection_tested: true } : prev);
      } else {
        setError(`Test so'rov xatolik: HTTP ${res.status}`);
      }
    } catch {
      setError('Test so\'rov yuborib bo\'lmadi. Server ishlamayapti?');
    } finally {
      setTesting(false);
    }
  };

  const prompt = webhook
    ? generatePrompt({
        platform,
        webhookUrl:  webhook.endpoint_url,
        secretKey:   webhook.secret_key,
        webhookId:   webhook.id,
      })
    : '';

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#FB3640]/40 border-t-[#FB3640] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={initWebhook}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
        >
          Qayta urinib ko&apos;rish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Intro */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FB3640] shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Builder Prompts nima?</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Maxsus kod snippet yordamida JetBlog bilan o&apos;z serveringizni ulang. Maqola nashr bo&apos;lganda sizning
            serveringiz avtomatik xabardor qilinadi — WordPress kerak emas.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border
                  ${i === 0 ? 'bg-[#FB3640]/20 border-[#FB3640]/40 text-[#FF8A8F]' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                {i + 1}
              </span>
              <span className={`text-xs font-semibold whitespace-nowrap ${i === 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-zinc-700 mx-2 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Platform selector */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">1. Platformangizni tanlang</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const meta = PLATFORM_META[p];
            const active = platform === p;
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 font-semibold text-sm
                  ${active
                    ? 'border-[#FB3640]/50 bg-[#FB3640]/10 text-white shadow-[0_0_15px_rgba(251,54,64,0.1)]'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
              >
                <span className="text-2xl">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code block */}
      {webhook && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">2. Kodni nusxalang</p>
            <div className="flex items-center gap-2">
              {webhook.id && (
                <span className="text-[10px] text-zinc-500 font-mono">ID: {webhook.id.slice(0, 8)}…</span>
              )}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                  ${copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] text-zinc-500 font-mono ml-2">
                {platform === 'nextjs'  && 'app/api/jetblog/route.ts'}
                {platform === 'laravel' && 'app/Http/Controllers/JetBlogController.php'}
                {platform === 'django'  && 'views.py'}
                {platform === 'nuxt'    && 'server/api/jetblog/receive.post.ts'}
              </span>
            </div>
            <pre className="overflow-x-auto p-5 text-xs text-zinc-300 font-mono leading-relaxed max-h-[360px]">
              <code>{prompt}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Env hint */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
        <span className="text-amber-400 text-lg shrink-0">⚠️</span>
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-300">Secret keyni muhit o&apos;zgaruvchisiga ko&apos;chiring</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Kod ichidagi secret keyni to&apos;g&apos;ridan-to&apos;g&apos;ri ishlatmang.{' '}
            <code className="bg-zinc-800 px-1 rounded text-zinc-300">.env</code> faylga{' '}
            <code className="bg-zinc-800 px-1 rounded text-zinc-300">JETBLOG_SECRET={webhook?.secret_key ?? '...'}</code>{' '}
            ko&apos;rinishida saqlang.
          </p>
        </div>
      </div>

      {/* Test */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">4. Ulanishni sinab ko&apos;ring</p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTest}
            disabled={testing || !webhook}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#FB3640] hover:from-cyan-400 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {testing ? 'Yuborilmoqda…' : 'Test so\'rov yuborish'}
          </button>

          {tested && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
              <Check className="w-4 h-4" /> Ulanish muvaffaqiyatli!
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          Serveringiz 200 javob qaytarsa, ulanish tayyor. Docs da to&apos;liq qo&apos;llanma:{' '}
          <a
            href="/docs/ai-builders"
            target="_blank"
            className="text-[#FB3640] hover:underline inline-flex items-center gap-0.5"
          >
            docs/ai-builders <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
      </div>

    </div>
  );
}
