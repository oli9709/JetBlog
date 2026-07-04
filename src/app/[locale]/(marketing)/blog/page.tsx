'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    const supabase = createClientComponentClient();
    const { error } = await supabase.from('subscribers').insert({ email });

    if (!error) {
      setStatus('success');
      setEmail('');
    } else if (error.code === '23505') {
      setStatus('error');
      setErrorMsg('Bu email allaqachon obunada');
    } else {
      setStatus('error');
      setErrorMsg('Xatolik yuz berdi, qayta urinib ko\'ring');
    }
  };

  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#FB3640] uppercase mb-4">Blog</span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Tez kunda...</h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
            JetBlog blogi hozircha tayyorlanmoqda. Bu yerda SEO, AI va WordPress haqida amaliy maqolalar chiqadi.
          </p>
        </div>

        {/* Coming soon visual */}
        <div className="relative mb-16">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FB3640]/5 via-transparent to-transparent pointer-events-none" />

            <div className="text-6xl mb-4">✍️</div>
            <h2 className="text-xl font-bold text-white mb-3">Nima haqida yozamiz?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
              {[
                { icon: '🔍', title: 'SEO strategiyalar', desc: 'O\'zbek va rus tilidagi saytlar uchun ishlagan SEO usullari' },
                { icon: '🤖', title: 'AI & Kontent', desc: 'Claude AI bilan sifatli maqola yaratish sirlar' },
                { icon: '🌐', title: 'WordPress', desc: 'WordPressni avtomatlashtirish va optimallashtirish bo\'yicha qo\'llanmalar' },
              ].map(item => (
                <div key={item.title} className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter subscription */}
        <div className="rounded-2xl border border-[#FB3640]/20 bg-[#FB3640]/5 p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Birinchi bo'lib xabar oling</h2>
            <p className="text-zinc-400 text-sm">
              Yangi maqolalar chiqqanda email orqali xabar beramiz. Spam yo'q — faqat foydali kontent.
            </p>
          </div>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <span className="w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs">✓</span>
              Obuna bo'ldingiz! Yangi maqolalar haqida xabar beramiz.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="email@example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#FB3640]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shrink-0 bg-[#FB3640] hover:bg-[#FF6B6B] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? '...' : 'Obuna bo\'lish'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-xs text-red-400 text-center">{errorMsg}</p>
          )}
        </div>

      </div>
    </div>
  );
}
