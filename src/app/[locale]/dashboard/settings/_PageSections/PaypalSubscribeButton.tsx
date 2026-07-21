'use client';

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface Props {
  planId: string;
  planName: 'starter' | 'pro';
  label?: string;
}

/**
 * PayPal Subscribe tugmasi.
 * NEXT_PUBLIC_PAYPAL_CLIENT_ID va planId talab qilinadi. Env yo'q bo'lsa
 * "PayPal hali sozlanmagan" placeholder ko'rsatiladi.
 *
 * onApprove — /api/paypal/subscription/activate ga POST yuboradi.
 */
export function PaypalSubscribeButton({ planId, planName, label }: Props) {
  const t = useTranslations('Dashboard.billing');
  const router = useRouter();

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';

  if (!clientId) {
    return (
      <div className="w-full p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
        {t('paypalNotConfigured')}
      </div>
    );
  }

  if (!planId) {
    return (
      <div className="w-full p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
        {t('planNotConfigured', { plan: planName })}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <p className="text-xs font-semibold text-zinc-400 mb-2 text-center">{label}</p>
      )}
      <PayPalScriptProvider
        options={{
          clientId,
          vault: true,
          intent: 'subscription',
          components: 'buttons',
        }}
      >
        <PayPalButtons
          style={{
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          }}
          createSubscription={(_data, actions) =>
            actions.subscription.create({ plan_id: planId })
          }
          onApprove={async (data) => {
            try {
              const res = await fetch('/api/paypal/subscription/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscriptionId: data.subscriptionID,
                  planName,
                }),
              });
              const json = await res.json();
              if (!res.ok) {
                toast.error(json.error ?? t('subscribeError'));
                return;
              }
              toast.success(t('subscribeSuccess'));
              router.refresh();
            } catch (err: any) {
              console.error('[paypal] activate call failed', err?.message);
              toast.error(t('subscribeError'));
            }
          }}
          onError={(err) => {
            console.error('[paypal] button error', err);
            toast.error(t('subscribeError'));
          }}
          onCancel={() => {
            toast.info(t('subscribeCancelled'));
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
