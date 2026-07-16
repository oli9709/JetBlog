'use client';

import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { PlatformSelector, type PlatformType } from './PlatformSelector';
import { ConnectionForm, type ConnectionFormData } from './ConnectionForm';
import { ConnectionTest } from './ConnectionTest';

const STEPS = ['Platform', 'Ma\'lumotlar', 'Test', 'Tayyor'];

interface AddConnectionWizardProps {
  onComplete: (site: any) => void;
}

export function AddConnectionWizard({ onComplete }: AddConnectionWizardProps) {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<PlatformType | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    platform: 'wordpress',
    siteUrl: '',
    defaultLanguage: 'uz',
  });
  const [createdSite, setCreatedSite] = useState<any>(null);

  const handlePlatformSelect = (p: PlatformType) => {
    setPlatform(p);
    setFormData({ platform: p, siteUrl: '', defaultLanguage: formData.defaultLanguage ?? 'uz' });
  };

  const handleFormChange = (data: ConnectionFormData) => setFormData(data);

  const handleTestSuccess = (site: any) => {
    setCreatedSite(site);
    setTimeout(() => setStep(3), 600);
  };

  const canNext = () => {
    if (step === 0) return platform !== null;
    if (step === 1) {
      if (!formData.siteUrl) return false;
      if (formData.platform === 'wordpress') return !!(formData.wpUsername && formData.wpPassword);
      if (formData.platform === 'ghost') return !!formData.ghostApiKey;
      if (formData.platform === 'webflow') {
        return !!(
          formData.webflowToken &&
          formData.webflowSiteId &&
          formData.webflowCollectionId &&
          formData.webflowFieldMap?.body
        );
      }
      if (formData.platform === 'webhook') return !!(formData.webhookEndpoint && formData.webhookSecret);
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-500',
                  i < step && 'bg-emerald-500 scale-90',
                  i === step && 'bg-[#FB3640] scale-125 shadow-[0_0_10px_rgba(251,54,64,0.5)]',
                  i > step && 'bg-zinc-700'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-300 hidden sm:block',
                  i === step ? 'text-[#FB3640]' : i < step ? 'text-emerald-500' : 'text-zinc-600'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-8 sm:w-12 transition-colors duration-500 mb-4',
                  i < step ? 'bg-emerald-500/50' : 'bg-zinc-800'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400">Qaysi platforma bilan ulanmoqchisiz?</p>
            <PlatformSelector selected={platform} onSelect={handlePlatformSelect} />
          </div>
        )}

        {step === 1 && platform && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400">
              <span className="capitalize font-semibold text-white">{platform}</span> ulanish ma&apos;lumotlarini kiriting
            </p>
            <ConnectionForm platform={platform} data={formData} onChange={handleFormChange} />
          </div>
        )}

        {step === 2 && (
          <ConnectionTest formData={formData} onSuccess={handleTestSuccess} />
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Muvaffaqiyatli ulandi!</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-sm">
                Saytingiz TextPilot.AI ga bog&apos;landi. Endi AI maqolalarni avtomatik nashr qilishni boshlashingiz mumkin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onComplete(createdSite)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300',
                'bg-gradient-to-r from-[#FB3640] to-rose-500',
                'hover:shadow-[0_0_30px_rgba(251,54,64,0.3)] hover:scale-[1.02] active:scale-95'
              )}
            >
              <Sparkles className="w-5 h-5" />
              Birinchi maqolani yaratish →
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
              'border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700',
              step === 0 && 'opacity-0 pointer-events-none'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>

          {step < 2 && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                'bg-gradient-to-r from-[#FB3640] to-rose-500 text-white',
                'hover:shadow-[0_0_20px_rgba(251,54,64,0.2)] hover:scale-[1.02] active:scale-95',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100'
              )}
            >
              Keyingi
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
