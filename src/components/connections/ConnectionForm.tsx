'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Globe, Key, User, Loader2, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PlatformType } from './PlatformSelector';
import { AIBuilderPrompt } from './AIBuilderPrompt';

const WEBHOOK_RECEIVE_URL = 'https://jetblog.app/api/webhooks/receive';

function generateSecret(): string {
  // 32 byte = 64 hex char — server crypto.randomBytes(32) bilan mos
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface WebflowFieldMap {
  body: string;
  title?: string;
  summary?: string;
  image?: string;
}

export interface ConnectionFormData {
  platform: PlatformType;
  siteUrl: string;
  wpUsername?: string;
  wpPassword?: string;
  ghostApiKey?: string;
  // Webflow
  webflowToken?: string;
  webflowSiteId?: string;
  webflowSiteDomain?: string;
  webflowCollectionId?: string;
  webflowCollectionSlug?: string;
  webflowFieldMap?: WebflowFieldMap;
  // Webhook
  webhookEndpoint?: string;
  webhookSecret?: string;
}

interface ConnectionFormProps {
  platform: PlatformType;
  data: ConnectionFormData;
  onChange: (data: ConnectionFormData) => void;
}

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  required,
  placeholder,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FB3640] transition-colors z-20">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder ?? ' '}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'peer block w-full pt-4 pb-2 bg-black/50 border border-zinc-800 rounded-xl text-white',
          'focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all duration-300 placeholder-transparent z-10 relative',
          icon ? 'pl-11' : 'pl-4',
          suffix ? 'pr-12' : 'pr-4'
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          'absolute text-sm text-zinc-500 duration-300 transform -translate-y-3 scale-75 top-4 z-20 origin-[0]',
          'peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0',
          'peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#FB3640] pointer-events-none',
          icon ? 'left-11' : 'left-4'
        )}
      >
        {label}
      </label>
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-20">{suffix}</div>
      )}
    </div>
  );
}

function HintBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400">
      <span className="text-[#FB3640] font-bold mt-0.5">i</span>
      <span>{children}</span>
    </div>
  );
}


// ── Webflow maydon xaritasi tanlagi ─────────────────────────────────────────

interface WfField { slug: string; displayName: string; type: string; }
interface WfCollection { id: string; displayName: string; slug: string; fields: WfField[]; }
interface WfSite { id: string; displayName: string; domain: string; }

function FieldSelect({
  label,
  value,
  onChange,
  fields,
  required,
  filterTypes,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fields: WfField[];
  required?: boolean;
  filterTypes?: string[];
}) {
  const filtered = filterTypes ? fields.filter((f) => filterTypes.includes(f.type)) : fields;
  // system maydonlari (name, slug) ni ko'rsatmaslik
  const options = filtered.filter((f) => f.slug !== 'name' && f.slug !== 'slug');

  return (
    <div className="relative">
      <label className="block text-xs text-zinc-400 mb-1.5">
        {label} {required && <span className="text-[#FB3640]">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none px-4 py-2.5 pr-10 rounded-xl text-sm',
            'bg-black/50 border border-zinc-800 text-white',
            'focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640]',
            !value && 'text-zinc-500'
          )}
        >
          <option value="">{required ? '-- Maydon tanlang --' : '-- (ixtiyoriy) --'}</option>
          {options.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.displayName} ({f.slug}) — {f.type}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}

function WebflowForm({
  data,
  onChange,
  showToken,
  setShowToken,
}: {
  data: ConnectionFormData;
  onChange: (d: ConnectionFormData) => void;
  showToken: boolean;
  setShowToken: (v: boolean | ((p: boolean) => boolean)) => void;
}) {
  const [sites, setSites]           = useState<WfSite[]>([]);
  const [collections, setCollections] = useState<WfCollection[]>([]);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'sites' | 'collections'>('idle');
  const [loadError, setLoadError]   = useState('');

  const update = (patch: Partial<ConnectionFormData>) => onChange({ ...data, ...patch });

  // Token girilganda saytlarni yuklash
  const loadSites = useCallback(async () => {
    const token = data.webflowToken?.trim() ?? '';
    if (!token) return;
    setLoadingStage('sites');
    setLoadError('');
    setSites([]);
    setCollections([]);
    update({ webflowSiteId: '', webflowCollectionId: '', webflowFieldMap: undefined });
    try {
      const res = await fetch(`/api/sites/webflow/collections?token=${encodeURIComponent(token)}`);
      const json = await res.json() as { sites?: WfSite[]; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? 'Xatolik');
      setSites(json.sites ?? []);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Saytlarni yuklab bo\'lmadi');
    } finally {
      setLoadingStage('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.webflowToken]);

  // Sayt tanlanganda kolleksiyalarni yuklash
  const loadCollections = useCallback(async (siteId: string) => {
    const token = data.webflowToken?.trim() ?? '';
    if (!token || !siteId) return;
    setLoadingStage('collections');
    setLoadError('');
    setCollections([]);
    update({ webflowCollectionId: '', webflowFieldMap: undefined });
    const site = sites.find((s) => s.id === siteId);
    update({ webflowSiteId: siteId, webflowSiteDomain: site?.domain ?? '', siteUrl: `https://${site?.domain ?? ''}` });
    try {
      const res = await fetch(`/api/sites/webflow/collections?token=${encodeURIComponent(token)}&siteId=${siteId}`);
      const json = await res.json() as { collections?: WfCollection[]; domain?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? 'Xatolik');
      setCollections(json.collections ?? []);
      if (json.domain) update({ webflowSiteDomain: json.domain, siteUrl: `https://${json.domain}` });
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Kolleksiyalarni yuklab bo'lmadi");
    } finally {
      setLoadingStage('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.webflowToken, sites]);

  const selectedCollection = collections.find((c) => c.id === data.webflowCollectionId);
  const allFields = selectedCollection?.fields ?? [];

  const updateFieldMap = (patch: Partial<WebflowFieldMap>) => {
    update({ webflowFieldMap: { ...(data.webflowFieldMap ?? { body: '' }), ...patch } });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Token */}
      <FloatingInput
        id="wf-token"
        label="Webflow API Token"
        type={showToken ? 'text' : 'password'}
        value={data.webflowToken ?? ''}
        onChange={(v) => update({ webflowToken: v })}
        icon={<Key className="w-5 h-5" />}
        required
        suffix={
          <button
            type="button"
            onClick={() => setShowToken((p) => !p)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
      />

      {/* Token yuklash tugmasi */}
      <button
        type="button"
        disabled={!data.webflowToken?.trim() || loadingStage === 'sites'}
        onClick={loadSites}
        className={cn(
          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
          'border border-zinc-700 text-zinc-300 hover:border-[#FB3640] hover:text-white',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {loadingStage === 'sites'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saytlar yuklanmoqda...</>
          : sites.length > 0
            ? <><Check className="w-4 h-4 text-emerald-400" /> Saytlar yuklandi — qayta yuklash</>
            : 'Saytlarni yuklash →'
        }
      </button>

      {loadError && (
        <p className="text-xs text-red-400 px-1">{loadError}</p>
      )}

      {/* Sayt tanlash */}
      {sites.length > 0 && (
        <div className="relative">
          <label className="block text-xs text-zinc-400 mb-1.5">Webflow saytini tanlang <span className="text-[#FB3640]">*</span></label>
          <div className="relative">
            <select
              value={data.webflowSiteId ?? ''}
              onChange={(e) => loadCollections(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl text-sm bg-black/50 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640]"
            >
              <option value="">-- Saytni tanlang --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.displayName} ({s.domain})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Kolleksiya tanlash */}
      {loadingStage === 'collections' && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Kolleksiyalar yuklanmoqda...
        </div>
      )}
      {collections.length > 0 && (
        <div className="relative">
          <label className="block text-xs text-zinc-400 mb-1.5">CMS Kolleksiyasi <span className="text-[#FB3640]">*</span></label>
          <div className="relative">
            <select
              value={data.webflowCollectionId ?? ''}
              onChange={(e) => {
                const col = collections.find((c) => c.id === e.target.value);
                update({ webflowCollectionId: e.target.value, webflowCollectionSlug: col?.slug ?? '', webflowFieldMap: undefined });
              }}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl text-sm bg-black/50 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640]"
            >
              <option value="">-- Kolleksiyani tanlang --</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Maydon xaritasi */}
      {selectedCollection && allFields.length > 0 && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Maydon xaritasi</p>

          {/* Kontent (RichText / PlainText) — MAJBURIY */}
          <FieldSelect
            label="Maqola kontenti (HTML)"
            value={data.webflowFieldMap?.body ?? ''}
            onChange={(v) => updateFieldMap({ body: v })}
            fields={allFields}
            filterTypes={['RichText', 'PlainText']}
            required
          />

          {/* Sarlavha (qo'shimcha) */}
          <FieldSelect
            label="Sarlavha maydoni (ixtiyoriy — 'name' tizim maydoni doim to'ldiriladi)"
            value={data.webflowFieldMap?.title ?? ''}
            onChange={(v) => updateFieldMap({ title: v || undefined })}
            fields={allFields}
            filterTypes={['PlainText', 'RichText']}
          />

          {/* Xulosa */}
          <FieldSelect
            label="Xulosa / Tavsif (ixtiyoriy)"
            value={data.webflowFieldMap?.summary ?? ''}
            onChange={(v) => updateFieldMap({ summary: v || undefined })}
            fields={allFields}
            filterTypes={['PlainText', 'RichText']}
          />

          {/* Rasm */}
          <FieldSelect
            label="Muqova rasm maydoni (ixtiyoriy)"
            value={data.webflowFieldMap?.image ?? ''}
            onChange={(v) => updateFieldMap({ image: v || undefined })}
            fields={allFields}
            filterTypes={['Image']}
          />

          <HintBox>
            <strong>name</strong> (sarlavha) va <strong>slug</strong> tizim maydonlari doim avtomatik to&apos;ldiriladi.
            Faqat HTML kontent maydonini tanlash majburiy.
          </HintBox>
        </div>
      )}

      <HintBox>
        Webflow Dashboard → Project Settings → Integrations → API Access. Token CMS:read va CMS:write ruxsatlariga ega bo&apos;lishi kerak.
      </HintBox>
    </div>
  );
}

export function ConnectionForm({ platform, data, onChange }: ConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken]       = useState(false);
  const [showApiKey, setShowApiKey]     = useState(false);
  const [secretKey]                     = useState(() => generateSecret());

  const update = (patch: Partial<ConnectionFormData>) => onChange({ ...data, ...patch });

  // Webhook platformi tanlanganida faqat secretKey ni avtomatik to'ldirish.
  // webhookEndpoint foydalanuvchi o'zi kiritadi (quyidagi input orqali).
  useEffect(() => {
    if (platform === 'webhook') {
      update({ webhookSecret: secretKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  if (platform === 'wordpress') {
    return (
      <div className="flex flex-col gap-4">
        <FloatingInput
          id="wp-url"
          label="Site URL (https://...)"
          type="url"
          value={data.siteUrl}
          onChange={(v) => update({ siteUrl: v })}
          icon={<Globe className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="wp-username"
          label="WP Username"
          value={data.wpUsername ?? ''}
          onChange={(v) => update({ wpUsername: v })}
          icon={<User className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="wp-password"
          label="WP Application Password"
          type={showPassword ? 'text' : 'password'}
          value={data.wpPassword ?? ''}
          onChange={(v) => update({ wpPassword: v })}
          icon={<Key className="w-5 h-5" />}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
      </div>
    );
  }

  if (platform === 'ghost') {
    return (
      <div className="flex flex-col gap-4">
        <FloatingInput
          id="ghost-url"
          label="Ghost URL (https://...)"
          type="url"
          value={data.siteUrl}
          onChange={(v) => update({ siteUrl: v })}
          icon={<Globe className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="ghost-key"
          label="Admin API Key"
          type={showApiKey ? 'text' : 'password'}
          value={data.ghostApiKey ?? ''}
          onChange={(v) => update({ ghostApiKey: v })}
          icon={<Key className="w-5 h-5" />}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowApiKey((p) => !p)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
        <HintBox>
          Settings → Integrations → Add custom integration — &quot;Admin API Key&quot; ni nusxa oling.
        </HintBox>
      </div>
    );
  }

  if (platform === 'webflow') {
    return (
      <WebflowForm data={data} onChange={onChange} showToken={showToken} setShowToken={setShowToken} />
    );
  }

  // webhook → endpoint URL input + AI Builder Prompt
  return (
    <div className="flex flex-col gap-4">
      <FloatingInput
        id="webhook-endpoint"
        label="Receiver endpoint URL (https://...)"
        type="url"
        value={data.webhookEndpoint ?? ''}
        onChange={(v) => update({ webhookEndpoint: v, siteUrl: v })}
        icon={<Globe className="w-5 h-5" />}
        required
        placeholder="https://your-site.com"
      />
      <HintBox>
        Deploy qilingan saytingiz URL manzilini kiriting. Masalan: https://audit-dashboard.onrender.com
        &nbsp;—&nbsp;saytda <code>/api/jetblog</code> endpoint bo&apos;lishi kerak.
      </HintBox>
      <AIBuilderPrompt
        webhookUrl={WEBHOOK_RECEIVE_URL}
        secretKey={secretKey}
      />
    </div>
  );
}
