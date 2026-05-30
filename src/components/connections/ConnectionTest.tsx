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
  { id: 'dns', label: 'DNS / URL tekshiruv', icon: <Globe className="w-4 h-4" /> },
  { id: 'auth', label: 'Autentifikatsiya', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'write', label: 'Yozish huquqi', icon: <PenLine className="w-4 h-4" /> },
];

interface StepState {
  status: StepStatus;
  error?: string;
}

interface ConnectionTestProps {
  formData: ConnectionFormData;
  onSuccess: (siteData: any) => void;
}

function StepRow({ step, state }: { step: Step; state: StepState }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-500',
          state.status === 'idle' && 'bg-zinc-800 border-zinc-700 text-zinc-500',
          state.status === 'loading' && 'bg-[#FB3640]/10 border-[#FB3640]/30 text-[#FB3640]',
          state.status === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          state.status === 'error' && 'bg-red-500/10 border-red-500/30 text-red-400'
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
            state.status === 'idle' && 'text-zinc-500',
            state.status === 'loading' && 'text-white',
            state.status === 'success' && 'text-emerald-400',
            state.status === 'error' && 'text-red-400'
          )}
        >
          {step.label}
        </div>
        {state.status === 'error' && state.error && (
          <div className="text-xs text-red-400/80 mt-0.5 truncate">{state.error}</div>
        )}
      </div>

      {state.status === 'success' && (
        <span className="text-xs text-emerald-400 font-medium">OK</span>
      )}
    </div>
  );
}

export function ConnectionTest({ formData, onSuccess }: ConnectionTestProps) {
  const [steps, setSteps] = useState<Record<string, StepState>>({
    dns: { status: 'idle' },
    auth: { status: 'idle' },
    write: { status: 'idle' },
  });
  const [isTesting, setIsTesting] = useState(false);
  const [done, setDone] = useState(false);
  const [fatalError, setFatalError] = useState('');

  const setStep = (id: string, state: StepState) =>
    setSteps((prev) => ({ ...prev, [id]: state }));

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runTest = async () => {
    setIsTesting(true);
    setDone(false);
    setFatalError('');
    setSteps({ dns: { status: 'idle' }, auth: { status: 'idle' }, write: { status: 'idle' } });

    try {
      // Step 1: DNS
      setStep('dns', { status: 'loading' });
      await delay(600);

      const res = await fetch('/api/sites/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.siteUrl,
          wp_username: formData.wpUsername,
          wp_password: formData.wpPassword,
          ghost_api_key: formData.ghostApiKey,
          webflow_token: formData.webflowToken,
          webflow_collection_id: formData.webflowCollectionId,
          webhook_endpoint: formData.webhookEndpoint,
          webhook_secret: formData.webhookSecret,
          platform: formData.platform,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        const msg = resData.error || 'URL manzilga ulanib bo\'lmadi';
        setStep('dns', { status: 'error', error: msg });
        setStep('auth', { status: 'error', error: '' });
        setStep('write', { status: 'error', error: '' });
        setFatalError(msg);
        setIsTesting(false);
        return;
      }

      setStep('dns', { status: 'success' });
      await delay(400);

      // Step 2: Auth
      setStep('auth', { status: 'loading' });
      await delay(700);
      setStep('auth', { status: 'success' });
      await delay(400);

      // Step 3: Write
      setStep('write', { status: 'loading' });
      await delay(600);
      setStep('write', { status: 'success' });

      setDone(true);
      onSuccess(resData.site ?? resData);
    } catch (err: any) {
      const msg = err.message || 'Tarmoq xatoligi';
      setStep('dns', { status: 'error', error: msg });
      setFatalError(msg);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <StepRow key={step.id} step={step} state={steps[step.id]} />
        ))}
      </div>

      {fatalError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-sm">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{fatalError}</span>
        </div>
      )}

      {!done && (
        <button
          type="button"
          onClick={runTest}
          disabled={isTesting}
          className={cn(
            'flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold tracking-wide transition-all duration-300',
            'bg-gradient-to-r from-[#FB3640] to-[#FB3640] text-white',
            'hover:shadow-[0_0_30px_rgba(251,54,64,0.2)] hover:scale-[1.02] active:scale-95',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100'
          )}
        >
          {isTesting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Tekshirilmoqda...
            </>
          ) : fatalError ? (
            'Qayta urinish'
          ) : (
            'Test connection'
          )}
        </button>
      )}
    </div>
  );
}
