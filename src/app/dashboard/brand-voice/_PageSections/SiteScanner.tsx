import { useRef, useState, useEffect } from 'react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Globe, Sparkles, Building2, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { BrandVoiceData } from './BrandForm';

interface SiteScannerProps {
  onScanComplete: (brandVoice: BrandVoiceData) => void;
  isScanning: boolean;
  onScan: (url: string) => void;
}

export function SiteScanner({ onScanComplete, isScanning, onScan }: SiteScannerProps) {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [mockResult, setMockResult] = useState<BrandVoiceData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      setProgress(0);
      setShowResult(false);
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (progress === 100 && isScanning) {
      setTimeout(() => {
        const generatedData: BrandVoiceData = {
          voice_description: "Klinikamiz zamonaviy texnologiyalar yordamida bemorlarga eng yaxshi xizmatni ko'rsatishga qaratilgan.",
          tone: 'professional',
          target_audience: ['bemorlar', 'kattalar', 'bolalar'],
          language: 'uz',
          always_use: ['sifat', 'ishonch', 'kafolat'],
          never_use: ['arzon', 'past sifat']
        };
        setMockResult(generatedData);
        setShowResult(true);
      }, 500);
    }
  }, [progress, isScanning]);

  const handleScan = () => {
    if (!url) return;
    onScan(url);
  };

  const handleApply = () => {
    if (mockResult) {
      onScanComplete(mockResult);
    }
  };

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]" ref={containerRef}>
      
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center space-y-3 mb-12 relative z-10">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          AI Brend Ovozi Skaneri
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Sayt URL ni kiriting — AI brendingiz uslubini, ohangini va auditoriyasini avtomatik aniqlaydi.
        </p>
      </div>

      {/* Animated Beam Section */}
      <div className="relative flex w-full max-w-2xl items-center justify-between mb-12 px-4 z-10">
        <div ref={div1Ref} className="z-10 bg-[#111] p-4 rounded-full border border-white/10 shadow-xl relative">
          <Globe className="h-8 w-8 text-blue-400" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500 whitespace-nowrap">Veb-sayt</div>
        </div>
        
        <div ref={div2Ref} className={cn(
          "relative z-10 bg-[#111] p-5 rounded-full border shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-700",
          isScanning ? "border-indigo-500/50 scale-110" : "border-white/10"
        )}>
          <Sparkles className={cn("h-10 w-10 transition-colors", isScanning ? "text-indigo-400 animate-pulse" : "text-zinc-600")} />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-500 whitespace-nowrap">JetBlog AI</div>
        </div>

        <div ref={div3Ref} className={cn(
          "relative z-10 bg-[#111] p-4 rounded-full border transition-all duration-700 shadow-xl",
          showResult ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "border-white/10"
        )}>
          <Building2 className={cn("h-8 w-8", showResult ? "text-emerald-400" : "text-purple-400")} />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500 whitespace-nowrap">Brend DNK</div>
        </div>

        <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div2Ref} curvature={-40} endYOffset={-10} gradientStartColor="#60a5fa" gradientStopColor="#818cf8" />
        <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div3Ref} curvature={40} endYOffset={10} gradientStartColor="#818cf8" gradientStopColor="#c084fc" reverse={showResult} />
      </div>

      {/* Input & Action Area */}
      {!showResult ? (
        <div className="w-full max-w-xl flex flex-col items-center gap-4 z-10 relative transition-all duration-500">
          <div className="relative w-full group">
            <div className={cn(
              "absolute inset-0 rounded-xl blur-md transition-opacity duration-300",
              isScanning ? "bg-indigo-500/30 opacity-100" : "bg-white/5 opacity-0 group-hover:opacity-100"
            )} />
            <div className="relative flex items-center bg-[#111] border border-[#333] rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
              <span className="pl-4 text-zinc-500 font-medium">🌐 https://</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yoursite.com"
                disabled={isScanning}
                className="w-full bg-transparent text-white p-4 outline-none placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          <div className="w-full flex justify-center mt-2">
            {!isScanning ? (
              <ShimmerButton
                onClick={handleScan}
                disabled={!url}
                className="px-8 py-3 h-auto text-sm font-bold flex items-center gap-2"
                background="rgba(255, 255, 255, 0.05)"
              >
                <Search className="h-4 w-4 text-white" />
                <span className="text-white">🔍 Saytni Skanerlash</span>
              </ShimmerButton>
            ) : (
              <div className="w-full space-y-3 flex flex-col items-center">
                <div className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ⚡ AI saytni tahlil qilmoqda... {progress}%
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
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
              <h3 className="text-lg font-bold text-white mb-1">Muvaffaqiyatli aniqlandi!</h3>
              <p className="text-zinc-400 text-sm">
                AI aniqlagan uslub: <strong className="text-white">Rasmiy (Professional)</strong>
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-zinc-300">Target: Bemorlar</span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">Til: UZ</span>
            </div>

            <ShimmerButton
              onClick={handleApply}
              className="mt-6 px-8 py-2.5 h-auto text-sm font-bold w-full max-w-xs"
              background="linear-gradient(90deg, #10b981 0%, #059669 100%)"
            >
              <span className="text-white whitespace-nowrap">BrandForm ga yuklash</span>
            </ShimmerButton>
            
            <button onClick={() => setShowResult(false)} className="text-xs text-zinc-500 hover:text-white mt-2">
              Qayta skanerlash
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
