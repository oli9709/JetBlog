'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Mail, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter Autopilot',
    price: '49',
    description: 'Kichik bloglar va yangi saytlar uchun mukammal yechim.',
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    features: [
      '1 ta WordPress sayt ulanishi',
      'Haftasiga 2 ta avtomatik maqola',
      'Standart AI yozish (GPT-4o mini)',
      'Asosiy Brand Voice sozlamalari',
      'Email orqali yordam'
    ],
    mailSubject: 'Starter Autopilot rejasiga buyurtma berish'
  },
  {
    name: 'Pro Autopilot',
    price: '99',
    description: 'Biznesingizni Google reytingida yuqoriga ko\'tarish uchun.',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    popular: true,
    features: [
      '3 ta WordPress sayt ulanishi',
      'Haftasiga 5 ta avtomatik maqola',
      'Yuqori sifatli AI yozish (GPT-4o)',
      'Kengaytirilgan Brand Voice sozlamalari',
      'Telegram guruh/kanal anonslari',
      '24/7 ustuvor yordam'
    ],
    mailSubject: 'Pro Autopilot rejasiga buyurtma berish'
  },
  {
    name: 'Agency Network',
    price: '249',
    description: 'Katta PBN tarmoqlari va SEO agentliklari uchun.',
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    features: [
      '10 ta WordPress sayt ulanishi',
      'Har kuni avtomatik maqolalar',
      'Yuqori sifatli AI yozish + RAG',
      'Cheksiz Brand Voice profillari',
      'Telegram kanallari integratsiyasi',
      'Shaxsiy menejer xizmati'
    ],
    mailSubject: 'Agency Network rejasiga buyurtma berish'
  }
];

export default function AddSubscriptionPage() {
  return (
    <div className="w-11/12 mx-auto space-y-8 py-6">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#FB3640]">
          JetBlog Rejalari va Tariflari
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
          WordPress saytlaringizni bog'lang va AI-ga maqola yozish, rejalashtirish hamda SEO optimallashtirish autopilotini topshiring.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`flex flex-col justify-between bg-zinc-900/40 backdrop-blur-md border ${
              plan.popular ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-zinc-800/80'
            } rounded-3xl p-6 relative`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-zinc-950 font-bold text-xs rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Eng ko'p tanlangan
              </span>
            )}
            
            <div>
              <CardHeader className="p-0 pb-6 border-b border-zinc-850">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs mt-1">{plan.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-zinc-500 text-sm font-semibold">/ oyiga</span>
                </div>
              </CardHeader>

              <CardContent className="p-0 py-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5 text-zinc-300 text-sm">
                      <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>

            <CardFooter className="p-0 pt-6 border-t border-zinc-850">
              <a 
                href={`mailto:billing@jetblog.app?subject=${encodeURIComponent(plan.mailSubject)}&body=${encodeURIComponent("Salom JetBlog Billing,\n\nMen " + plan.name + " tarifiga hisob-faktura (invoice) olishni xohlayman. Mening akkaunt elektron pochtam: \n\nRahmat!")}`}
                className="w-full"
              >
                <Button 
                  className={`w-full py-6 rounded-2xl font-bold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Tarifga hisob olish
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Manual payments info */}
      <div className="bg-zinc-900/20 backdrop-blur-sm border border-zinc-800/80 p-6 rounded-3xl mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">Hisob-kitob qanday amalga oshiriladi?</h4>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
              JetBlog-da to'lovlar invoice (hisob-faktura) tizimi orqali amalga oshiriladi. Tanlagan tarifingiz bo'yicha elektron pochtangizga hisob-faktura yuboriladi va u orqali xavfsiz to'lov qilishingiz mumkin.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <a href="mailto:billing@jetblog.app" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold transition-colors duration-300">
            Yordam so'rash
          </a>
        </div>
      </div>

    </div>
  );
}
