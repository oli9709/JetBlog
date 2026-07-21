'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { PaypalSubscribeButton } from './PaypalSubscribeButton';

interface SubStatus {
  subscriptionId: string | null;
  status: 'active' | 'suspended' | 'cancelled' | 'expired' | 'none';
  plan: 'starter' | 'pro' | 'none';
  startedAt: string | null;
  nextBilling: string | null;
  credits: number;
}

interface Props {
  starterPlanId: string;
  proPlanId: string;
}

export function SubscriptionPlans({ starterPlanId, proPlanId }: Props) {
  const t = useTranslations('Dashboard.billing');
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/paypal/subscription/status');
      if (res.ok) {
        setStatus((await res.json()) as SubStatus);
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    if (!confirm(t('cancelConfirm'))) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/paypal/subscription/cancel', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? t('subscribeError'));
        return;
      }
      toast.success(t('cancelBtn') + ' ✓');
      await load();
    } catch {
      toast.error(t('subscribeError'));
    } finally {
      setIsCancelling(false);
    }
  };

  const isActive = status?.status === 'active';
  const activePlanLabel = status?.plan === 'pro' ? t('proPlanName') : t('starterPlanName');

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#FB3640]" /> {t('subscriptionsTitle')}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {t('subscriptionsSubtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-xs text-zinc-500 p-4 text-center">…</div>
        ) : isActive ? (
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                {t('activePlan')}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{activePlanLabel}</p>
            {status?.nextBilling && (
              <p className="text-xs text-zinc-500 mb-4">
                {t('nextBilling')}: {new Date(status.nextBilling).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
            >
              {isCancelling ? t('cancelling') : t('cancelBtn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starter */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col gap-3">
              <div>
                <h4 className="text-lg font-bold text-zinc-200">{t('starterPlanName')}</h4>
                <p className="text-2xl font-bold text-white mt-1">{t('starterPrice')}</p>
                <p className="text-xs text-zinc-500 mt-2">{t('starterFeatures')}</p>
              </div>
              <div className="mt-auto">
                <PaypalSubscribeButton planId={starterPlanId} planName="starter" />
              </div>
            </div>

            {/* Pro */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-[#FB3640]/30 flex flex-col gap-3 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FB3640] text-white">
                <Sparkles className="w-3 h-3 inline mr-1" />
                {t('recommended')}
              </span>
              <div>
                <h4 className="text-lg font-bold text-zinc-200">{t('proPlanName')}</h4>
                <p className="text-2xl font-bold text-white mt-1">{t('proPrice')}</p>
                <p className="text-xs text-zinc-500 mt-2">{t('proFeatures')}</p>
              </div>
              <div className="mt-auto">
                <PaypalSubscribeButton planId={proPlanId} planName="pro" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
