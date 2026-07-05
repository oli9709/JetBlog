'use client';

import { useState } from 'react';
import config from '@/lib/config/marketing';
import { Link } from '@/i18n/navigation';
import { MainLogoText } from '@/components/MainLogo';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const { footer_nav } = config;
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
      // unique violation
      setStatus('error');
      setErrorMsg(t('errorDuplicate'));
    } else {
      setStatus('error');
      setErrorMsg(t('errorGeneral'));
    }
  };

  return (
    <footer className="bg-[#000F08] border-t border-white/5 mt-8">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">

          {/* Left: Logo + nav columns */}
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            {/* About */}
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white/80">{footer_nav.about.title}</h3>
                <ul className="mt-4 space-y-3">
                  {footer_nav.about.routes.map((item) => (
                    <li key={item.title}>
                      <Link href={item.link} className="text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-white/80">{footer_nav.resources.title}</h3>
                <ul className="mt-4 space-y-3">
                  {footer_nav.resources.routes.map((item) => (
                    <li key={item.title}>
                      <Link href={item.link} className="text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal */}
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white/80">{footer_nav.legal.title}</h3>
                <ul className="mt-4 space-y-3">
                  {footer_nav.legal.routes.map((item) => (
                    <li key={item.title}>
                      <Link href={item.link} className="text-sm text-zinc-500 hover:text-white transition-colors">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Newsletter */}
          <div className="mt-10 xl:mt-0">
            <h3 className="text-sm font-semibold text-white/80">{t('newsletterTitle')}</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              {t('newsletterSubtitle')}
            </p>

            {status === 'success' ? (
              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs">✓</span>
                {t('subscribeSuccess')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-6">
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                    placeholder={t('subscribePlaceholder')}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#FB3640]/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="shrink-0 bg-[#FB3640] hover:bg-[#FF6B6B] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {status === 'loading' ? t('subscribing') : t('subscribeButton')}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <MainLogoText />
          <p className="text-xs text-zinc-600">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
