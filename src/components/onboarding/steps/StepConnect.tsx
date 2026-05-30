'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { ConnectionForm, type ConnectionFormData } from '@/components/connections/ConnectionForm';
import { ConnectionTest } from '@/components/connections/ConnectionTest';
import type { PlatformType } from '@/components/connections/PlatformSelector';

const PLATFORM_HELP: Record<PlatformType, { text: string; docsSlug: string }> = {
  wordpress: {
    text: "Application Password to'g'ri kiritilganmi? WP 5.6+ talab qilinadi.",
    docsSlug: 'wordpress',
  },
  ghost: {
    text: 'Admin API Key formati: id:secret (Content API key emas!)',
    docsSlug: 'ghost',
  },
  webflow: {
    text: 'Webflow Starter plan ($14/oy) talab qilinadi. Bepul planda CMS API yo\'q.',
    docsSlug: 'webflow',
  },
  webhook: {
    text: "Endpoint URL to'g'ri va tashqaridan ochiqmi? HTTPS talab qilinadi.",
    docsSlug: 'webhook',
  },
};

interface DetectHint {
  platform: PlatformType;
  confidence: number;
}

interface StepConnectProps {
  platform: PlatformType;
  onSuccess: (site: Record<string, unknown>) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function StepConnect({ platform, onSuccess, onBack, onSkip }: StepConnectProps) {
  const [formData, setFormData] = useState<ConnectionFormData>({ platform, siteUrl: '' });
  const [detectHint, setDetectHint] = useState<DetectHint | null>(null);
  const [testFailed, setTestFailed] = useState(false);
  const [verified, setVerified] = useState(false);
  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormData({ platform, siteUrl: '' });
    setDetectHint(null);
    setTestFailed(false);
    setVerified(false);
  }, [platform]);

  // URL kiritilganda auto-detect
  useEffect(() => {
    const url = formData.siteUrl.trim();
    if (!url || url.length < 8) {
      setDetectHint(null);
      return;
    }
    if (detectTimer.current) clearTimeout(detectTimer.current);
    detectTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/sites/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.platform && data.confidence > 0.5) {
          setDetectHint({ platform: data.platform as PlatformType, confidence: data.confidence });
        }
      } catch {
        // silent — detect is best-effort
      }
    }, 600);
    return () => {
      if (detectTimer.current) clearTimeout(detectTimer.current);
    };
  }, [formData.siteUrl]);

  const handleTestSuccess = (site: Record<string, unknown>) => {
    setVerified(true);
    setTestFailed(false);
    // brief delay so user sees the green state
    setTimeout(() => onSuccess(site), 800);
  };

  const help = PLATFORM_HELP[platform];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-1 text-center">
        Saytingizni ulang
      </h2>
      <p className="text-zinc-500 text-sm text-center mb-8 capitalize">
        {platform} ulash ma&apos;lumotlarini kiriting
      </p>

      {/* Auto-detect hint */}
      {detectHint && detectHint.platform !== platform && (
        <div className="flex items-start gap-2.5 px-4 py-3 mb-5 rounded-xl bg-blue-500/8 border border-blue-500/20 text-sm text-blue-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Platform aniqlandi:</strong>{' '}
            <span className="capitalize">{detectHint.platform}</span>{' '}
            ({Math.round(detectHint.confidence * 100)}% ishonch)
          </span>
        </div>
      )}

      {/* Form */}
      <div className="mb-6">
        <ConnectionForm
          platform={platform}
          data={formData}
          onChange={setFormData}
        />
      </div>

      {/* Test — faqat URL to'ldirilganda ko'rinadi */}
      {formData.siteUrl && !verified && (
        <div className="mb-6">
          <ConnectionTest
            formData={formData}
            onSuccess={handleTestSuccess}
          />
        </div>
      )}

      {/* Verified state */}
      {verified && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-emerald-500/8 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Muvaffaqiyatli ulandi! Davom etilmoqda...
        </div>
      )}

      {/* Error help */}
      {testFailed && (
        <div className="flex items-start gap-2.5 px-4 py-3 mb-6 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {help.text}{' '}
            <Link href={`/docs/${help.docsSlug}`} className="underline hover:text-white transition-colors">
              /docs/{help.docsSlug} →
            </Link>
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Orqaga
        </button>
        <button
          type="button"
          onClick={onSkip}
          className={cn(
            'text-sm transition-colors',
            'text-zinc-600 hover:text-zinc-400 underline underline-offset-4 decoration-zinc-700'
          )}
        >
          O&apos;tkazib yuborish
        </button>
      </div>
    </div>
  );
}
