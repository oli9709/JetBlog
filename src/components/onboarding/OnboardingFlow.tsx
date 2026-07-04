'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cn } from '@/lib/utils/helpers';
import { StepPlatform } from './steps/StepPlatform';
import { StepConnect } from './steps/StepConnect';
import { StepKeyword } from './steps/StepKeyword';
import { StepSuccess } from './steps/StepSuccess';
import type { PlatformType } from '@/components/connections/PlatformSelector';

const STEPS = [
  'Platformani tanlang',
  'Saytingizni ulang',
  "Kalit so'z qo'shing",
  'Birinchi maqolani yarating',
] as const;

type Step = 1 | 2 | 3 | 4;

interface OnboardingFlowProps {
  userId: string;
  initialStep?: Step;
}

export function OnboardingFlow({ userId, initialStep = 1 }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [animating, setAnimating] = useState(false);

  // Shared state — child larga prop orqali
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [connectedSite, setConnectedSite] = useState<Record<string, unknown> | null>(null);
  const [generatedKeyword, setGeneratedKeyword] = useState('');

  const supabase = createClientComponentClient();

  const go = (next: Step) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 280);
  };

  const completeOnboarding = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);
    } catch {
      // non-blocking — user still reaches dashboard
    }
  };

  const saveOnboardingPlatform = async (platform: PlatformType) => {
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_platform: platform })
        .eq('id', userId);
    } catch {
      // non-blocking
    }
  };

  const handleSkip = async () => {
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    window.location.href = '/dashboard/main';
  };

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform);
  };

  const handlePlatformNext = async () => {
    if (!selectedPlatform) return;
    await saveOnboardingPlatform(selectedPlatform);
    go(2);
  };

  const handleConnectSuccess = (site: Record<string, unknown>) => {
    setConnectedSite(site);
    go(3);
  };

  const handleKeywordComplete = (keyword: string) => {
    setGeneratedKeyword(keyword);
    go(4);
  };

  const handleSuccessFinish = async () => {
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    window.location.href = '/dashboard/main';
  };

  const endpointUrl =
    connectedSite?.webhook_endpoint as string | undefined ??
    (connectedSite?.url as string | undefined);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl shadow-2xl min-h-[540px] flex flex-col">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#FB3640]/5 to-black pointer-events-none" />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-[#FB3640] to-rose-400 transition-all duration-500 ease-in-out"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step dots + labels */}
      <div className="flex items-center justify-center gap-3 pt-8 pb-6 px-6">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const isPast = step > n;
          const isCurrent = step === n;
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-500',
                    isPast && 'bg-emerald-500 scale-90',
                    isCurrent && 'bg-[#FB3640] scale-125 shadow-[0_0_8px_rgba(251,54,64,0.6)]',
                    !isPast && !isCurrent && 'bg-zinc-800'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap hidden sm:block transition-colors duration-300',
                    isCurrent ? 'text-[#FB3640]' : isPast ? 'text-emerald-500/70' : 'text-zinc-700'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-10 transition-colors duration-500 mb-4',
                    isPast ? 'bg-emerald-500/40' : 'bg-zinc-800'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step counter */}
      <div className="text-center mb-4">
        <span className="inline-block py-0.5 px-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-500">
          Qadam {step} / {STEPS.length}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 px-6 pb-8 sm:px-10 transition-all duration-280',
          animating ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'
        )}
      >
        {step === 1 && (
          <StepPlatform
            selected={selectedPlatform}
            onSelect={handlePlatformSelect}
            onNext={handlePlatformNext}
            onSkip={handleSkip}
          />
        )}

        {step === 2 && selectedPlatform && (
          <StepConnect
            platform={selectedPlatform}
            onSuccess={handleConnectSuccess}
            onBack={() => go(1)}
            onSkip={() => go(3)}
          />
        )}

        {step === 3 && (
          <StepKeyword
            onComplete={handleKeywordComplete}
            onBack={() => go(2)}
            onSkip={handleSuccessFinish}
          />
        )}

        {step === 4 && selectedPlatform && (
          <StepSuccess
            platform={selectedPlatform}
            endpointUrl={endpointUrl}
            keyword={generatedKeyword}
          />
        )}
      </div>
    </div>
  );
}
