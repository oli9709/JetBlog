'use client';

import { useState } from 'react';
import configuration from '@/lib/config/dashboard';
import { ProductI } from '@/lib/types/types';
import { IntervalE } from '@/lib/types/enums';
import { cn } from '@/lib/utils/helpers';
import { Link } from '@/i18n/navigation';
import { Check, Sparkles } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ScrollReveal } from '@/components/ScrollReveal';

interface PriceCardProps {
  product: ProductI;
  timeInterval: IntervalE;
}

const PriceCard = ({ product, timeInterval }: PriceCardProps) => {
  const { name, description, features, plans } = product;

  const activePlan = plans.find((p) => p.interval === timeInterval) || plans[0];
  const isPopular = name === 'Pro';
  const isFree = name === 'Free Trial';

  return (
    <div
      className={cn(
        'flex flex-col justify-between w-full max-w-sm rounded-3xl border transition-all duration-500 relative p-6 h-full',
        isPopular
          ? 'border-[#FB3640]/60 bg-[#000F08] z-10'
          : 'border-white/10 bg-[#000F08] hover:border-white/20'
      )}
      style={
        isPopular
          ? { boxShadow: '0 0 30px rgba(251,54,64,0.2)' }
          : undefined
      }
    >
      {isPopular && (
        <div className="inline-flex items-center gap-1.5 px-4 py-1 text-xs font-bold text-white bg-[#FB3640] rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2 shadow-lg">
          <Sparkles className="w-3.5 h-3.5" /> Tavsiya Etiladi
        </div>
      )}

      <div>
        <div className="p-0 space-y-2 text-center sm:text-left mb-6">
          <h3 className="text-xl font-extrabold text-white">{name}</h3>
          <p className="text-xs text-zinc-400 min-h-[40px] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-0 space-y-6">
          <div className="flex items-baseline gap-1 justify-center sm:justify-start">
            <span className="text-4xl font-extrabold text-white flex items-center">
              $<NumberTicker value={Number(activePlan.price)} />
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {isFree
                ? ''
                : `/ ${timeInterval === IntervalE.MONTHLY ? 'oy' : 'oy (yillik)'}`}
            </span>
          </div>

          <ul className="space-y-3.5 pt-4 border-t border-white/5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FB3640' }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-0 mt-8">
        <Link
          href="/auth/signup"
          className={cn(
            'w-full font-bold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center',
            isFree
              ? 'border border-white/20 bg-transparent hover:bg-white/5 text-white'
              : isPopular
              ? 'text-white shadow-lg hover:opacity-90'
              : 'border border-white/10 bg-white/5 hover:bg-white/10 text-white'
          )}
          style={
            isPopular
              ? {
                  background: 'linear-gradient(135deg, #FB3640 0%, #c41f28 100%)',
                  boxShadow: '0 0 20px rgba(251,54,64,0.3)',
                }
              : undefined
          }
        >
          {isFree ? 'Bepul Boshlash' : 'Tarifni tanlash'}
        </Link>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [timeInterval, setTimeInterval] = useState(IntervalE.MONTHLY);
  const { products } = configuration;

  const toggleBilling = () => {
    setTimeInterval((prev) =>
      prev === IntervalE.MONTHLY ? IntervalE.YEARLY : IntervalE.MONTHLY
    );
  };

  const isYearly = timeInterval === IntervalE.YEARLY;

  return (
    <div className="relative overflow-hidden pt-12 pb-24">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none opacity-10 blur-[120px] bg-[#FB3640] rounded-full -z-10" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">

        {/* Title */}
        <ScrollReveal>
          <div className="mx-auto flex w-full flex-col gap-4 max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Tarif rejalarimiz va{' '}
              <span className="text-[#FB3640]">
                Narxlar
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-sm md:text-base leading-relaxed">
              Biznesingiz yoki shaxsiy blogingiz uchun eng mos bo'lgan tarifni tanlang. Istalgan vaqtda boshqa tarifga o'tishingiz mumkin.
            </p>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay="100">
          <div className="flex items-center justify-center gap-4">
            <span
              className={cn(
                'text-xs font-bold transition-colors',
                !isYearly ? 'text-white' : 'text-zinc-500'
              )}
            >
              Oylik To'lov
            </span>
            <button
              onClick={toggleBilling}
              className="w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center shadow-inner focus:outline-none"
              style={{
                backgroundColor: isYearly ? '#FB3640' : '#27272a',
              }}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 absolute',
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                )}
              />
            </button>
            <span
              className={cn(
                'text-xs font-bold transition-colors flex items-center gap-1.5',
                isYearly ? 'text-white' : 'text-zinc-500'
              )}
            >
              Yillik To'lov{' '}
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-extrabold border"
                style={{
                  backgroundColor: 'rgba(251,54,64,0.1)',
                  color: '#FB3640',
                  borderColor: 'rgba(251,54,64,0.3)',
                }}
              >
                Save 20%
              </span>
            </span>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid */}
        <ScrollReveal delay="200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto items-center">
            {products.map((prod, idx) => (
              <div key={idx} className="flex justify-center h-full w-full">
                <PriceCard product={prod} timeInterval={timeInterval} />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Footer note */}
        <ScrollReveal delay="300">
          <div className="max-w-3xl mx-auto text-center bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <p className="text-xs text-zinc-500 leading-relaxed">
              * Barcha to'lovlar manual invoice tizimi orqali amalga oshiriladi. Hisobingiz yaratilgach, siz xohlagan paketni tanlab invoice olishingiz mumkin. Yillik tariflarda qo'shimcha 2 oylik bepul muddat taqdim etiladi.
            </p>
          </div>
        </ScrollReveal>

      </section>
    </div>
  );
};

export default Pricing;
