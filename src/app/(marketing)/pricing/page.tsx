'use client';

import { useState } from 'react';
import configuration from '@/lib/config/dashboard';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { ProductI } from '@/lib/types/types';
import { IntervalE } from '@/lib/types/enums';
import { cn } from '@/lib/utils/helpers';
import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ScrollReveal } from '@/components/ScrollReveal';

interface PriceCardProps {
  product: ProductI;
  timeInterval: IntervalE;
}

const PriceCard = ({ product, timeInterval }: PriceCardProps) => {
  const { name, description, features, plans } = product;
  
  // Maqsadli plan ma'lumotlarini aniqlash
  const activePlan = plans.find((p) => p.interval === timeInterval) || plans[0];
  const isPopular = name === 'Pro';

  return (
    <Card
      className={cn(
        "flex flex-col justify-between w-full max-w-sm rounded-3xl border transition-all duration-500 relative p-6 h-full",
        isPopular 
          ? "border-indigo-500 bg-zinc-900/60 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-105 z-10" 
          : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/80 hover:bg-zinc-900/40"
      )}
    >
      {isPopular && (
        <div className="inline-flex items-center gap-1.5 px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2 shadow-lg animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Tavsiya Etiladi
        </div>
      )}
      
      <div>
        <CardHeader className="p-0 space-y-2 text-center sm:text-left">
          <CardTitle className="text-xl font-extrabold text-white">{name}</CardTitle>
          <CardDescription className="text-xs text-zinc-400 min-h-[40px] leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0 mt-6 space-y-6">
          <div className="flex items-baseline gap-1 justify-center sm:justify-start">
            <span className="text-4xl font-extrabold text-white flex items-center">
              $<NumberTicker value={Number(activePlan.price)} />
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              / {timeInterval === IntervalE.MONTHLY ? 'oy' : 'yil'}
            </span>
          </div>
          
          <ul className="space-y-3.5 pt-4 border-t border-zinc-900">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      <CardFooter className="p-0 mt-8">
        <Link 
          href="/auth/signup" 
          className={cn(
            buttonVariants({ size: 'lg' }), 
            "w-full font-bold text-xs py-3 rounded-xl transition-all duration-300",
            isPopular 
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
              : "border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white"
          )}
        >
          {name === 'Free' ? 'Bepul boshlash' : 'Tarifni tanlash'}
        </Link>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const [timeInterval, setTimeInterval] = useState(IntervalE.MONTHLY);
  const { products } = configuration;

  const toggleBilling = () => {
    setTimeInterval((prev) => (prev === IntervalE.MONTHLY ? IntervalE.YEARLY : IntervalE.MONTHLY));
  };

  return (
    <div className="relative overflow-hidden pt-12 pb-24">
      {/* Background radial glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none opacity-20 blur-[120px] bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full -z-10" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Title */}
        <ScrollReveal>
          <div className="mx-auto flex w-full flex-col gap-4 max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Tarif rejalarimiz va{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
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
            <span className={cn("text-xs font-bold transition-colors", timeInterval === IntervalE.MONTHLY ? "text-white" : "text-zinc-500")}>
              Oylik To'lov
            </span>
            <button 
              onClick={toggleBilling}
              className="w-12 h-6 rounded-full bg-zinc-800 p-0.5 transition-colors relative flex items-center shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md transition-transform duration-300 absolute",
                  timeInterval === IntervalE.YEARLY ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-xs font-bold transition-colors flex items-center gap-1.5", timeInterval === IntervalE.YEARLY ? "text-white" : "text-zinc-500")}>
              Yillik To'lov <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.15)]">Save 20%</span>
            </span>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid */}
        <ScrollReveal delay="200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto justify-center items-center">
            {products.map((prod, idx) => (
              <div key={idx} className="flex justify-center h-full w-full">
                <PriceCard product={prod} timeInterval={timeInterval} />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Info text */}
        <ScrollReveal delay="300">
          <div className="max-w-3xl mx-auto text-center bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
            <p className="text-xs text-zinc-500 leading-relaxed">
              * Barcha to'lovlar manual invoice (hisob-faktura) tizimi orqali amalga oshiriladi. Hisobingiz yaratilgach, siz xohlagan vaqtda balansni to'ldirish paketlarini sotib olishingiz mumkin. Yillik tariflarda qo'shimcha 2 oylik bepul muddat taqdim etiladi.
            </p>
          </div>
        </ScrollReveal>

      </section>
    </div>
  );
};

export default Pricing;
