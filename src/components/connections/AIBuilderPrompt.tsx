'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { generateUniversalPrompt } from '@/lib/ai-builder-prompts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIBuilderPromptProps {
  /** Dashboard tab rejimi — API dan webhook olinadi */
  userId?: string;
  /** Wizard rejimi — to'g'ridan-to'g'ri props, API chaqirilmaydi */
  webhookUrl?: string;
  secretKey?: string;
}

interface WebhookData {
  id: string;
  endpoint_url: string;
  secret_key: string;
  connection_tested: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RECEIVE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/receive`
    : '/api/webhooks/receive';

const AI_BUILDERS: { name: string; url: string; icon: string; color: string }[] = [
  { name: 'Bolt',     url: 'https://bolt.new',     icon: '⚡', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-300' },
  { name: 'Lovable',  url: 'https://lovable.dev',  icon: '💜', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300' },
  { name: 'v0',       url: 'https://v0.dev',       icon: '▲',  color: 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-200' },
  { name: 'Cursor',   url: 'https://cursor.sh',    icon: '🖱️', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300' },
];

const STEPS: { num: string; title: string; desc: string }[] = [
  { num: '1', title: 'Promptni nusxalang',              desc: 'Yuqoridagi "Nusxalash" tugmasini bosing' },
  { num: '2', title: 'AI Builder ni oching',             desc: 'Bolt, Cursor, v0 yoki Lovable' },
  { num: '3', title: 'Promptni paste qiling',            desc: 'Nusxalangan matnni to\'g\'ridan-to\'g\'ri yuboring' },
  { num: '4', title: 'AI fayllarni yaratadi',            desc: 'Barcha fayllar avtomatik sozlanadi — tasdiqlang' },
  { num: '5', title: 'Secret keyni .env.local ga qo\'shing', desc: 'Pastdagi credentials bo\'limidan nusxalang' },
  { num: '6', title: 'Saytni deploy qiling',             desc: 'Vercel, Netlify... (localhost da ishlamaydi!)' },
  { num: '7', title: 'Ulanishni sinab ko\'ring',         desc: 'Quyidagi "Test so\'rov" tugmasi bilan tekshiring' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AIBuilderPrompt({ userId, webhookUrl, secretKey: secretKeyProp }: AIBuilderPromptProps) {
  const isStaticMode = !!(webhookUrl && secretKeyProp);

  const [webhook, setWebhook] = useState<WebhookData | null>(
    isStaticMode
      ? { id: 'wizard', endpoint_url: webhookUrl!, secret_key: secretKeyProp!, connection_tested: false }
      : null
  );
  const [loading, setLoading]   = useState(!isStaticMode);
  const [testing, setTesting]   = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [tested, setTested]     = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Dashboard rejimida — mount da webhook avtomatik olinadi / yaratiladi
  useEffect(() => {
    if (isStaticMode) return;
    void initWebhook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initWebhook = async () => {
    setLoading(true);
    setInitError(null);
    try {
      const listRes  = await fetch('/api/webhooks');
      const listJson = await listRes.json() as { webhooks?: WebhookData[] };
      const existing = (listJson.webhooks ?? []).find(
        (w) => w.endpoint_url === RECEIVE_URL
      );

      if (existing) {
        setWebhook(existing);
        setTested(existing.connection_tested ?? false);
        return;
      }

      const sitesRes  = await fetch('/api/sites');
      const sitesJson = await sitesRes.json() as { sites?: { id: string }[] };
      const firstSite = sitesJson.sites?.[0];

      if (!firstSite) {
        setInitError('Avval kamida bitta sayt uling (Connections → Sayt qo\'shish)');
        return;
      }

      const createRes  = await fetch('/api/webhooks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id:      firstSite.id,
          endpoint_url: RECEIVE_URL,
          events:       ['article.published'],
        }),
      });
      const createJson = await createRes.json() as { webhook?: WebhookData; error?: string };

      if (!createRes.ok || !createJson.webhook) {
        setInitError(createJson.error ?? 'Webhook yaratishda xatolik');
        return;
      }
      setWebhook(createJson.webhook);
    } catch (e: unknown) {
      setInitError(e instanceof Error ? e.message : 'Kutilmagan xatolik');
    } finally {
      setLoading(false);
    }
  };

  const prompt = webhook
    ? generateUniversalPrompt(webhook.endpoint_url, webhook.secret_key)
    : '';

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);

    if (!isStaticMode && webhook && webhook.id !== 'wizard') {
      await fetch('/api/webhooks', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:                  webhook.id,
          prompt_generated_at: new Date().toISOString(),
        }),
      }).catch(() => null);
    }

    setTimeout(() => setCopied(false), 2500);
  }, [prompt, webhook, isStaticMode]);

  const handleTest = async () => {
    if (!webhook) return;
    setTesting(true);
    setTestError(null);
    try {
      const body = JSON.stringify({
        event: 'article.published',
        data: {
          id:               'test-article-id',
          title:            'Test maqola — JetBlog AI Builder',
          keyword:          'test keyword',
          content:          '<h1>Test</h1><p>Bu test so\'rov.</p>',
          featuredImageUrl: null,
          publishedAt:      new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      const res = await fetch(webhook.endpoint_url, {
        method:  'POST',
        headers: {
          'Content-Type':         'application/json',
          'X-JetBlog-Webhook-Id': webhook.id,
        },
        body,
      });

      if (res.ok) {
        setTested(true);
        setWebhook((prev) => prev ? { ...prev, connection_tested: true } : prev);
      } else {
        setTestError(`HTTP ${res.status} — serveringizda xatolik`);
      }
    } catch {
      setTestError('Server javob bermadi. Deploy qilinganmi?');
    } finally {
      setTesting(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#FB3640]/30 border-t-[#FB3640] rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Init error ───────────────────────────────────────────────────────────────
  if (initError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
        <p className="text-red-400 text-sm">{initError}</p>
        <button
          onClick={initWebhook}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
        >
          Qayta urinib ko&apos;rish
        </button>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <div className="p-2 rounded-xl bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FB3640] shrink-0 mt-0.5">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Builder Prompts</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Quyidagi universal promptni AI Builder ga bering — loyihangizni avtomatik
            skanlab, blog tizimini to&apos;liq sozlab beradi. WordPress kerak emas.
          </p>
        </div>
      </div>

      {/* ── Prompt box ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Tayyor prompt
          </p>
          <button
            onClick={handleCopy}
            disabled={!webhook}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40
              ${copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#FB3640] hover:bg-[#FF6B6B] text-white shadow-[0_0_15px_rgba(251,54,64,0.25)]'
              }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Nusxalandi!' : 'Nusxalash'}
          </button>
        </div>

        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          {/* Window bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="text-[10px] text-zinc-500 font-mono ml-2">
              AI Builder Prompt — JetBlog Universal
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-[11px] text-zinc-300 font-mono leading-relaxed max-h-[280px] whitespace-pre-wrap">
            <code>{prompt || 'Yuklanmoqda…'}</code>
          </pre>
          {/* Fade bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── AI Builder links ── */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Qaysi AI Builder ga joylashtirasiz?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AI_BUILDERS.map(({ name, url, icon, color }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border bg-gradient-to-b ${color} font-semibold text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{name}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
      </div>

      {/* ── 6-qadam yo'riqnoma ── */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
          Qanday ishlaydi?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STEPS.map(({ num, title, desc }) => (
            <div
              key={num}
              className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30"
            >
              <span className="w-6 h-6 rounded-full bg-[#FB3640]/20 border border-[#FB3640]/30 text-[#FF8A8F] text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {num}
              </span>
              <div>
                <p className="text-xs font-bold text-white">{title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Credentials karta ── */}
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4 space-y-3">
        <p className="text-xs text-gray-400">
          🔑 Sizning maxfiy kalitingiz — <code className="bg-zinc-800 px-1 rounded text-zinc-300">.env.local</code> ga qo&apos;shing:
        </p>
        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs">
          <span className="text-gray-300 truncate mr-3">
            JETBLOG_SECRET={webhook?.secret_key ?? '…'}
          </span>
          <button
            onClick={() => {
              if (!webhook?.secret_key) return;
              navigator.clipboard.writeText(`JETBLOG_SECRET=${webhook.secret_key}`).catch(() => null);
              setCopiedEnv(true);
              setTimeout(() => setCopiedEnv(false), 2000);
            }}
            disabled={!webhook?.secret_key}
            className="flex-shrink-0 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-40"
          >
            {copiedEnv ? '✓ Nusxalandi' : 'Nusxalash'}
          </button>
        </div>
        <div className="flex items-start gap-2 text-xs text-amber-400/80">
          <span className="shrink-0">⚠️</span>
          <p>
            Webhook faqat deploy qilingan saytda ishlaydi.
            Localhost da test qilib bo&apos;lmaydi.
          </p>
        </div>
      </div>

      {/* ── Test tugmasi — faqat dashboard rejimida ── */}
      {!isStaticMode && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Ulanishni sinab ko&apos;ring
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleTest}
              disabled={testing || !webhook}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#FB3640] hover:from-cyan-400 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              {testing
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Zap className="w-4 h-4" />
              }
              {testing ? 'Yuborilmoqda…' : 'Test so\'rov yuborish'}
            </button>

            {tested && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Ulanish muvaffaqiyatli!
              </span>
            )}
          </div>

          {testError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {testError}
            </p>
          )}

          <p className="text-[11px] text-zinc-500">
            Serveringiz 200 javob qaytarsa, ulanish tayyor.{' '}
            <a
              href="/docs/ai-builders"
              target="_blank"
              className="text-[#FB3640] hover:underline inline-flex items-center gap-0.5"
            >
              To&apos;liq qo&apos;llanma <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      )}

      {/* Wizard rejimida — faqat docs link ── */}
      {isStaticMode && (
        <p className="text-[11px] text-zinc-500">
          To&apos;liq qo&apos;llanma:{' '}
          <a
            href="/docs/ai-builders"
            target="_blank"
            className="text-[#FB3640] hover:underline inline-flex items-center gap-0.5"
          >
            docs/ai-builders <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
      )}

    </div>
  );
}
