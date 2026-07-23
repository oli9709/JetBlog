'use client';

import { useRef, useState } from 'react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Globe, Sparkles, Building2, Search, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { useTranslations } from 'next-intl';
import { BrandVoiceData } from './BrandForm';

interface SiteScannerProps {
  onScanComplete: (brandVoice: BrandVoiceData) => void;
  isScanning: boolean;
  onScan: (url: string) => void;
}

export function SiteScanner({ onScanComplete, isScanning: externalScanning, onScan }: SiteScannerProps) {
  const t = useTranslations('Dashboard.brandVoice');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BrandVoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);

  const isScanning = busy || externalScanning;

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleScan = async () => {
    if (!url) return;
    setError(null);
    setResult(null);
    setBusy(true);
    onScan(url);
    try {
      const res = await fetch('/api/brand-voice/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizeUrl(url) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t('scanFailedGeneric'));
        return;
      }
      setResult(json.data as BrandVoiceData);
    } catch (err: any) {
      console.error('[brand-scan] client error', err?.message);
      setError(t('scanFailedNetwork'));
    } finally {
      setBusy(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    // Scanner API tones: professional | friendly | casual | authoritative
    // BrandForm tones:  professional | friendly | expert     | casual
    // Map 'authoritative' → 'expert' (closest match) so BrandForm highlights it.
    const toneMap: Record<string, BrandVoiceData['tone']> = {
      authoritative: 'expert',
      professional: 'professional',
      friendly: 'friendly',
      casual: 'casual',
      expert: 'expert',
    };
    const mapped: BrandVoiceData = {
      ...result,
      tone: toneMap[result.tone as string] ?? 'professional',
    };
    onScanComplete(mapped);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUrl('');
  };

  const showResult = !!result;

  return (
    <div
      className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
      ref={containerRef}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FB3640]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center space-y-3 mb-12 relative z-10">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          {t('aiScannerTitle')}
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">{t('aiScannerDesc')}</p>
      </div>

      {/* Animated Beam Section */}
      <div className="relative flex w-full max-w-2xl items-center justify-between mb-12 px-4 z-10">
        <div ref={div1Ref} className="z-10 bg-[#111] p-4 rounded-full border border-white/10 shadow-xl relative">
          <Globe className="h-8 w-8 text-[#FF6B6B]" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500 whitespace-nowrap">
            {t('beamWebsite')}
          </div>
        </div>

        <div
          ref={div2Ref}
          className={cn(
            'relative z-10 bg-[#111] p-5 rounded-full border shadow-[0_0_30px_rgba(251,54,64,0.2)] transition-all duration-700',
            isScanning ? 'border-[#FB3640]/50 scale-110' : 'border-white/10'
          )}
        >
          <Sparkles
            className={cn('h-10 w-10 transition-colors', isScanning ? 'text-[#FF6B6B] animate-pulse' : 'text-zinc-600')}
          />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#FB3640] whitespace-nowrap">
            {t('beamAi')}
          </div>
        </div>

        <div
          ref={div3Ref}
          className={cn(
            'relative z-10 bg-[#111] p-4 rounded-full border transition-all duration-700 shadow-xl',
            showResult ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-white/10'
          )}
        >
          <Building2 className={cn('h-8 w-8', showResult ? 'text-emerald-400' : 'text-[#FF6B6B]')} />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500 whitespace-nowrap">
            {t('beamDna')}
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
          curvature={-40}
          endYOffset={-10}
          gradientStartColor="#60a5fa"
          gradientStopColor="#818cf8"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div3Ref}
          curvature={40}
          endYOffset={10}
          gradientStartColor="#818cf8"
          gradientStopColor="#c084fc"
          reverse={showResult}
        />
      </div>

      {/* Input / Result / Error */}
      {!showResult ? (
        <div className="w-full max-w-xl flex flex-col items-center gap-4 z-10 relative transition-all duration-500">
          <div className="relative w-full group">
            <div
              className={cn(
                'absolute inset-0 rounded-xl blur-md transition-opacity duration-300',
                isScanning ? 'bg-[#FB3640]/30 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
              )}
            />
            <div className="relative flex items-center bg-[#111] border border-[#333] rounded-xl overflow-hidden focus-within:border-[#FB3640]/50 transition-colors">
              <span className="pl-4 text-zinc-500 font-medium">🌐 https://</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('urlPlaceholder')}
                disabled={isScanning}
                className="w-full bg-transparent text-white p-4 outline-none placeholder:text-zinc-600 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScan();
                }}
              />
            </div>
          </div>

          {error && (
            <div className="w-full flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full flex justify-center mt-2">
            {!isScanning ? (
              <ShimmerButton
                onClick={handleScan}
                disabled={!url}
                className="px-8 py-3 h-auto text-sm font-bold flex items-center gap-2"
                background="rgba(255, 255, 255, 0.05)"
              >
                <Search className="h-4 w-4 text-white" />
                <span className="text-white">🔍 {t('scanBtn')}</span>
              </ShimmerButton>
            ) : (
              <div className="w-full space-y-3 flex flex-col items-center">
                <div className="text-sm font-semibold text-[#FF6B6B] flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ⚡ {t('analyzing')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Result Area */
        <div className="w-full max-w-xl z-10 relative animate-in fade-in zoom-in duration-500">
          <div className="bg-[#111] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)] flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t('scanSuccess')}</h3>
              <p className="text-zinc-400 text-sm">
                {t('detectedTone')}: <strong className="text-white capitalize">{result!.tone}</strong>
              </p>
            </div>

            {result!.voice_description && (
              <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-emerald-500/40 pl-3 text-left">
                &ldquo;{result!.voice_description}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {result!.target_audience.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-zinc-300"
                >
                  {a}
                </span>
              ))}
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 uppercase">
                {result!.language}
              </span>
            </div>

            <ShimmerButton
              onClick={handleApply}
              className="mt-6 px-8 py-2.5 h-auto text-sm font-bold w-full max-w-xs"
              background="linear-gradient(90deg, #10b981 0%, #059669 100%)"
            >
              <span className="text-white whitespace-nowrap">{t('applyBtn')}</span>
            </ShimmerButton>

            <button onClick={handleReset} className="text-xs text-zinc-500 hover:text-white mt-2">
              {t('scanAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
