'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Globe, ShieldCheck, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { ConnectionFormData } from './ConnectionForm';

type StepStatus = 'idle' | 'loading' | 'success' | 'error';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 'dns',  label: 'DNS / URL tekshiruv', icon: <Globe       className="w-4 h-4" /> },
  { id: 'auth', label: 'Autentifikatsiya',     icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'write',label: 'Yozish huquqi',        icon: <PenLine     className="w-4 h-4" /> },
];

interface ErrorGuide {
  title: string;
  fix: string;
  example?: string;
  steps?: string[];
  docs?: string | null;
}

const ERROR_GUIDES: Record<string, ErrorGuide> = {
  dns_invalid_url: {
    title: "URL noto'g'ri kiritilgan",
    fix: "URL ni to'g'ri formatda kiriting.",
    example: 'https://saytingiz.com',
    docs: null,
  },
  dns_not_found: {
    title: 'Sayt topilmadi',
    fix: "URL to'g'ri ekanligini tekshiring. Sayt internet orqali ochilishi kerak.",
    docs: null,
  },
  wp_auth_failed: {
    title: "WordPress parol noto'g'ri",
    fix: "Application Password to'g'ri kiritilganligini tekshiring.",
    steps: [
      'WordPress admin → Foydalanuvchilar → Profilingiz',
      "Application Passwords bo'limiga o'ting",
      'Yangi parol yarating va nusxalang',
      "JetBlog ga o'sha parolni kiriting",
    ],
    docs: '/docs/wordpress',
  },
  wp_not_found: {
    title: 'WordPress REST API topilmadi',
    fix: "Saytingizda WordPress o'rnatilganmi?",
    steps: [
      'https://saytingiz.com/wp-json/ manzilini brauzerda oching',
      "JSON ma'lumot ko'rinsa — WordPress ishlayapti",
      "Ko'rinmasa — hosting bilan bog'laning",
    ],
    docs: '/docs/wordpress',
  },
  ghost_auth_failed: {
    title: "Ghost API kaliti noto'g'ri",
    fix: 'Admin API Key ni qayta tekshiring.',
    steps: [
      'Ghost Dashboard → Settings → Integrations',
      "JetBlog integratsiyasini toping",
      'Admin API Key ni nusxalab qayta kiriting',
      'Format: id:secret (ikki qism ":" bilan)',
    ],
    docs: '/docs/ghost',
  },
  webflow_auth_failed: {
    title: "Webflow token noto'g'ri",
    fix: "API token va Collection ID ni tekshiring.",
    steps: [
      'Webflow → Project Settings → Integrations',
      'API Access → Generate API token',
      "CMS → Collections → URL dagi ID ni nusxalang",
    ],
    docs: '/docs/webflow',
  },
  webflow_free_plan: {
    title: "Webflow bepul plan CMS API ni qo'llab-quvvatlamaydi",
    fix: "Webflow Starter ($14/oy) yoki yuqori planga o'ting.",
    steps: [
      "webflow.com/pricing sahifasiga o'ting",
      'Starter yoki Basic planni tanlang',
      "Keyin qayta urinib ko'ring",
    ],
    docs: '/docs/webflow',
  },
  webhook_localhost: {
    title: 'Sayt hali deploy qilinmagan',
    fix: "Webhook faqat internetda ochiq saytda ishlaydi.",
    steps: [
      "Saytingizni Vercel, Netlify yoki boshqa hostingga deploy qiling",
      "Deploy bo'lgandan keyin real URL kiriting",
      'Masalan: https://saytingiz.vercel.app',
    ],
    docs: '/docs/ai-builders',
  },
  webhook_not_found: {
    title: '/api/jetblog endpoint topilmadi',
    fix: "Webhook kod saytingizga qo'shilganmi?",
    steps: [
      'JetBlog prompt ni AI ga berdingizmi?',
      "Berib deploy qilgan bo'lsangiz — https://saytingiz.com/api/jetblog manzilini brauzerda oching",
      '"JetBlog webhook active" ko\'rinishi kerak',
      "Ko'rinmasa — promptni qayta AI ga bering",
    ],
    docs: '/docs/ai-builders',
  },
  webhook_invalid_signature: {
    title: "Signature mos kelmaydi",
    fix: "Secret key noto'g'ri o'rnatilgan.",
    steps: [
      ".env faylida JETBLOG_SECRET to'g'ri qo'yilganmi?",
      "Credentials kartasidagi kalitni nusxalab .env ga qo'ying",
      'Saytni qayta deploy qiling',
    ],
    docs: '/docs/ai-builders',
  },
  unknown: {
    title: 'Kutilmagan xato',
    fix: "Qayta urinib ko'ring yoki qo'llab-quvvatlash bilan bog'laning.",
    docs: null,
  },
};

interface StepState {
  status: StepStatus;
}

interface ConnectionTestProps {
  formData: ConnectionFormData;
  onSuccess: (siteData: unknown) => void;
  onBack?: () => void;
}

function buildApiBody(formData: ConnectionFormData) {
  const url = formData.siteUrl.trim();
  const platform = formData.platform;

  if (platform === 'wordpress') {
    return {
      platform_type: 'wordpress',
      url,
      wp_username: formData.wpUsername ?? '',
      wp_password: formData.wpPassword ?? '',
    };
  }
  if (platform === 'ghost') {
    return {
      platform_type: 'ghost',
      url,
      adapter_config: {
        apiUrl: url,
        adminApiKey: formData.ghostApiKey ?? '',
      },
    };
  }
  if (platform === 'webflow') {
    return {
      platform_type: 'webflow',
      url,
      adapter_config: {
        apiToken:       formData.webflowToken ?? '',
        siteId:         formData.webflowSiteId ?? '',
        collectionId:   formData.webflowCollectionId ?? '',
        collectionSlug: formData.webflowCollectionSlug ?? 'posts',
        siteDomain:     formData.webflowSiteDomain ?? '',
        fieldMap:       formData.webflowFieldMap ?? { body: '' },
      },
    };
  }
  const endpointUrl = formData.webhookEndpoint ?? url;
  return {
    platform_type: 'webhook',
    url: endpointUrl,
    adapter_config: {
      endpointUrl,
      secretKey: formData.webhookSecret ?? '',
    },
  };
}

function StepRow({ step, state }: { step: Step; state: StepState }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-500',
          state.status === 'idle'    && 'bg-zinc-800 border-zinc-700 text-zinc-500',
          state.status === 'loading' && 'bg-[#FB3640]/10 border-[#FB3640]/30 text-[#FB3640]',
          state.status === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          state.status === 'error'   && 'bg-red-500/10 border-red-500/30 text-red-400',
        )}
      >
        {state.status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state.status === 'success' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : state.status === 'error' ? (
          <XCircle className="w-4 h-4" />
        ) : (
          step.icon
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm font-medium transition-colors duration-300',
            state.status === 'idle'    && 'text-zinc-500',
            state.status === 'loading' && 'text-white',
            state.status === 'success' && 'text-emerald-400',
            state.status === 'error'   && 'text-red-400',
          )}
        >
          {step.label}
        </div>
      </div>

      {state.status === 'success' && (
        <span className="text-xs text-emerald-400 font-medium">OK</span>
      )}
    </div>
  );
}

export function ConnectionTest({ formData, onSuccess, onBack }: ConnectionTestProps) {
  const [steps, setSteps] = useState<Record<string, StepState>>({
    dns:   { status: 'idle' },
    auth:  { status: 'idle' },
    write: { status: 'idle' },
  });
  const [isTesting, setIsTesting] = useState(false);
  const [done, setDone]           = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const setStep = (id: string, state: StepState) =>
    setSteps((prev) => ({ ...prev, [id]: state }));

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runTest = async () => {
    setIsTesting(true);
    setDone(false);
    setErrorCode(null);
    setSteps({ dns: { status: 'idle' }, auth: { status: 'idle' }, write: { status: 'idle' } });

    try {
      setStep('dns', { status: 'loading' });
      await delay(600);

      const res = await fetch('/api/sites/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildApiBody(formData)),
      });

      const resData = await res.json() as {
        ok?: boolean;
        success?: boolean;
        errorCode?: string;
        error?: string;
        site?: unknown;
      };

      if (!res.ok || !resData.ok) {
        const code = resData.errorCode ?? 'unknown';
        setStep('dns',  { status: 'error' });
        setStep('auth', { status: 'error' });
        setStep('write',{ status: 'error' });
        setErrorCode(code);
        return;
      }

      setStep('dns', { status: 'success' });
      await delay(400);

      setStep('auth', { status: 'loading' });
      await delay(700);
      setStep('auth', { status: 'success' });
      await delay(400);

      setStep('write', { status: 'loading' });
      await delay(600);
      setStep('write', { status: 'success' });

      setDone(true);
      onSuccess(resData.site ?? resData);
    } catch {
      setStep('dns', { status: 'error' });
      setErrorCode('unknown');
    } finally {
      setIsTesting(false);
    }
  };

  const guide = errorCode ? (ERROR_GUIDES[errorCode] ?? ERROR_GUIDES.unknown) : null;

  return (
    <div className="flex flex-col gap-5">

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <StepRow key={step.id} step={step} state={steps[step.id]} />
        ))}
      </div>

      {/* Error guide */}
      {guide && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-400 mb-2">{guide.title}</p>
          <p className="text-xs text-gray-400 mb-3">{guide.fix}</p>

          {guide.example && (
            <p className="text-xs text-zinc-500 mb-3">
              Masalan:{' '}
              <code className="bg-zinc-800 px-1 rounded text-zinc-300">{guide.example}</code>
            </p>
          )}

          {guide.steps && (
            <ol className="space-y-1 mb-3">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-400">
                  <span className="text-[#FB3640] font-medium flex-shrink-0">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
          )}

          {guide.docs && (
            <a href={guide.docs} className="text-xs text-[#FB3640] hover:underline">
              Batafsil qo&apos;llanma →
            </a>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!done && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runTest}
            disabled={isTesting}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold tracking-wide transition-all duration-300',
              'bg-gradient-to-r from-[#FB3640] to-[#FB3640] text-white',
              'hover:shadow-[0_0_30px_rgba(251,54,64,0.2)] hover:scale-[1.02] active:scale-95',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100',
            )}
          >
            {isTesting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Tekshirilmoqda...</>
            ) : errorCode ? (
              'Qayta urinish'
            ) : (
              'Test connection'
            )}
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 h-12 rounded-xl border border-white/20 text-sm text-gray-400 hover:bg-white/5 transition-colors"
            >
              ← Orqaga
            </button>
          )}
        </div>
      )}

    </div>
  );
}
