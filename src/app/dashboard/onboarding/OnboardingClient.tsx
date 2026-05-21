'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { Check, Copy, Key, Link as LinkIcon, Loader2, RefreshCw } from 'lucide-react';
import { SupabaseCompleteOnboarding } from '@/lib/API/Database/profile/mutations';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Step 2 States
  const [tab, setTab] = useState<'wp' | 'webhook'>('wp');
  const [wpUrl, setWpUrl] = useState('');
  const [wpUser, setWpUser] = useState('');
  const [wpPass, setWpPass] = useState('');
  
  // Step 3 States
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>('uz');
  const [genLoadingStep, setGenLoadingStep] = useState(0); // 0: input, 1: AI, 2: Image, 3: Publishing

  const handleSkip = async () => {
    await SupabaseCompleteOnboarding(userId);
    router.push('/dashboard/main');
    router.refresh();
  };

  const nextStep = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 300);
  };

  const handleConnectSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate connection delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Muvaffaqiyatli ulandi!");
      nextStep();
    }, 3000);
  };

  const generateLoadingTexts = [
    "✍️ AI yozmoqda...",
    "📸 Rasm yaratilmoqda...",
    "📤 Saytga yuborilmoqda...",
  ];

  const handleGenerate = async () => {
    if (!keyword) {
      toast.error("Kalit so'zni kiriting!");
      return;
    }
    
    setLoading(true);
    setGenLoadingStep(1);

    // Simulate different steps of generation
    const interval = setInterval(() => {
      setGenLoadingStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    // After total 9 seconds simulate success
    setTimeout(async () => {
      clearInterval(interval);
      setLoading(false);
      setGenLoadingStep(0);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#ec4899']
      });

      // Update profile
      await SupabaseCompleteOnboarding(userId);
      
      toast.success("Ajoyib! Birinchi maqolangiz tayyor!");
      
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    }, 9000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nusxa olindi!");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 sm:p-10 transition-all duration-300 min-h-[500px] flex flex-col">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black -z-10 pointer-events-none" />
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500 ease-in-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="text-center mb-8">
        <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-purple-300 mb-4">
          Qadam {step} / 3
        </span>
      </div>

      <div className={`flex-1 transition-all duration-300 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
              JetBlog ga xush kelibsiz! 🚀
            </h1>
            <p className="text-gray-400 max-w-lg text-lg">
              Saytingizni ulashdan boshlaylik. JetBlog sizning WordPress saytingiz uchun har kuni avtomatik SEO maqolalar yozadi. Bir marta sozlang — qolganini biz qilamiz!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <RefreshCw className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Avto Nashr</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="font-semibold text-white">SEO Optimizatsiya</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">To'liq Xavfsizlik</h3>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-4">
              <ShimmerButton className="shadow-2xl" onClick={nextStep}>
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                  Boshlash &rarr;
                </span>
              </ShimmerButton>
              <button
                onClick={handleSkip}
                className="text-sm text-zinc-500 hover:text-zinc-300 border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full transition-all duration-200"
              >
                Keyinroq →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONNECT */}
        {step === 2 && (
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Saytingizni qanday ulamoqchisiz?</h2>
            
            <div className="flex space-x-2 bg-white/5 p-1 rounded-lg w-fit mx-auto mb-8 border border-white/10">
              <button 
                onClick={() => setTab('wp')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${tab === 'wp' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                WordPress
              </button>
              <button 
                onClick={() => setTab('webhook')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${tab === 'webhook' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Webhook API
              </button>
            </div>

            {tab === 'wp' ? (
              <form onSubmit={handleConnectSite} className="space-y-4 max-w-md mx-auto w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">WordPress URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input 
                      type="url" 
                      required
                      value={wpUrl}
                      onChange={(e) => setWpUrl(e.target.value)}
                      placeholder="https://mysite.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username (Admin)</label>
                  <input 
                    type="text" 
                    required
                    value={wpUser}
                    onChange={(e) => setWpUser(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Application Password</label>
                  <input 
                    type="password" 
                    required
                    value={wpPass}
                    onChange={(e) => setWpPass(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">WP Admin -&gt; Users -&gt; Profile pastki qismida "Application Passwords" orqali yarating.</p>
                </div>
                
                <div className="flex justify-between items-center pt-6">
                  <button type="button" onClick={prevStep} className="text-sm text-gray-400 hover:text-white transition-colors">
                    &larr; Orqaga
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="text-sm text-gray-500 hover:text-gray-300 underline decoration-gray-600 underline-offset-4 mr-4"
                  >
                    O'tkazib yuborish
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-white text-black px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Saytni Ulash
                  </button>
                </div>
              </form>
            ) : (
              <div className="max-w-xl mx-auto w-full space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Sizning Maxfiy Kalitingiz (Secret Key):</p>
                  <div className="flex items-center justify-between bg-black/60 rounded p-2">
                    <code className="text-green-400 text-sm">wh_sec_jetblog_example_key_999</code>
                    <button onClick={() => copyToClipboard('wh_sec_jetblog_example_key_999')} className="text-gray-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Endpoint URL (POST):</p>
                  <div className="flex items-center justify-between bg-black/60 rounded p-2">
                    <code className="text-blue-400 text-sm">https://jetblog.app/api/webhook/receive</code>
                    <button onClick={() => copyToClipboard('https://jetblog.app/api/webhook/receive')} className="text-gray-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={prevStep} className="text-sm text-gray-400 hover:text-white transition-colors">
                    &larr; Orqaga
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="text-sm text-gray-500 hover:text-gray-300 underline decoration-gray-600 underline-offset-4 mr-4"
                  >
                    O'tkazib yuborish
                  </button>
                  <button 
                    onClick={(e) => handleConnectSite(e as any)}
                    disabled={loading}
                    className="bg-white text-black px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Saqlash
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: FIRST KEYWORD */}
        {step === 3 && (
          <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Birinchi maqolangizni yozamizmi?</h2>
            <p className="text-gray-400 text-center mb-8 text-sm">Sinab ko'rish uchun mavzu yoki kalit so'z kiriting.</p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <div className="h-8 flex items-center justify-center">
                  <TypingAnimation className="text-xl font-medium text-white">
                    {generateLoadingTexts[genLoadingStep - 1] || "Kutilyapti..."} 
                  </TypingAnimation>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {["Sun'iy intellekt kelajagi", "Sog'lom ovqatlanish sirlari", "Kriptovalyuta nima?"].map((k) => (
                    <button
                      key={k}
                      onClick={() => setKeyword(k)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-400">Kalit so'z yoki sarlavha</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="bg-black/40 border border-white/10 text-gray-300 text-xs rounded px-2 py-1 outline-none"
                    >
                      <option value="uz">O'zbek (UZ)</option>
                      <option value="ru">Русский (RU)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Masalan: Uyda pul ishlash usullari"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 outline-none transition-all text-lg"
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={prevStep} className="text-sm text-gray-400 hover:text-white transition-colors">
                    &larr; Orqaga
                  </button>
                  <ShimmerButton className="shadow-2xl" onClick={handleGenerate}>
                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-base">
                      🚀 Maqola Yaratish
                    </span>
                  </ShimmerButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
