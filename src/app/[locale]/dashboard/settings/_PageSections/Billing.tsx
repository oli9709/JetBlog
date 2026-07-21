'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BillingPropsI {
  initialCredits: number;
}

/**
 * Account balance card — the only remaining piece of the old manual-invoice
 * settings block. Subscription plans (PayPal) sit in SubscriptionPlans.tsx.
 */
const Billing = ({ initialCredits }: BillingPropsI) => {
  const t = useTranslations('Dashboard');

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-amber-400" />
          <CardTitle className="text-xl font-bold text-white">{t('accountBalance')}</CardTitle>
        </div>
        <CardDescription className="text-zinc-400 mt-2">
          {t('balanceDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2 bg-zinc-950/60 border border-zinc-800/80 p-6 rounded-2xl">
          <span className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {initialCredits.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-zinc-400">{t('articleCreditsLeft')}</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t('creditDeductDesc')}
        </p>
      </CardContent>
    </Card>
  );
};

export default Billing;
