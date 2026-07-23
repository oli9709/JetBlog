import React, { useState, useEffect, KeyboardEvent } from 'react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { cn } from '@/lib/utils/helpers';
import { Building2, MessageSquare, Target, Tags, X, Sparkles, Plus, Loader2 } from 'lucide-react';

export interface BrandVoiceData {
  voice_description: string;
  tone: 'professional' | 'friendly' | 'expert' | 'casual';
  target_audience: string[];
  language: 'uz' | 'ru' | 'en';
  always_use: string[];
  never_use: string[];
}

interface BrandFormProps {
  siteId: string;
  initialData?: BrandVoiceData;
  onSave: (data: BrandVoiceData) => void;
  isSaving: boolean;
}

const TONES = [
  { id: 'professional', label: 'Rasmiy', desc: 'Korporativ va professional', emoji: '🎯' },
  { id: 'friendly', label: "Do'stona", desc: 'Iliq va samimiy', emoji: '😊' },
  { id: 'expert', label: 'Ekspert', desc: 'Bilimdon va ishonchli', emoji: '🧠' },
  { id: 'casual', label: 'Qiziqarli', desc: 'Energetik va zamonaviy', emoji: '⚡' }
];

export function BrandForm({ siteId, initialData, onSave, isSaving }: BrandFormProps) {
  const [activeTab, setActiveTab] = useState(1);
  
  const [description, setDescription] = useState(initialData?.voice_description || '');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'expert' | 'casual'>(initialData?.tone || 'professional');
  const [audience, setAudience] = useState<string[]>(initialData?.target_audience || []);
  const [audienceInput, setAudienceInput] = useState('');
  
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>(initialData?.language || 'uz');
  
  const [alwaysUse, setAlwaysUse] = useState<string[]>(initialData?.always_use || []);
  const [alwaysInput, setAlwaysInput] = useState('');
  
  const [neverUse, setNeverUse] = useState<string[]>(initialData?.never_use || []);
  const [neverInput, setNeverInput] = useState('');

  // Handle Pills
  const handleAddPill = (
    e: KeyboardEvent<HTMLInputElement>, 
    input: string, 
    setInput: (v: string) => void, 
    arr: string[], 
    setArr: (v: string[]) => void
  ) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      e.preventDefault();
      if (!arr.includes(input.trim())) {
        setArr([...arr, input.trim()]);
      }
      setInput('');
    }
  };

  const removePill = (val: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.filter(item => item !== val));
  };

  const handleSubmit = () => {
    onSave({
      voice_description: description,
      tone,
      target_audience: audience,
      language,
      always_use: alwaysUse,
      never_use: neverUse
    });
  };

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.voice_description || '');
      setTone(initialData.tone || 'professional');
      setAudience(initialData.target_audience || []);
      setLanguage(initialData.language || 'uz');
      setAlwaysUse(initialData.always_use || []);
      setNeverUse(initialData.never_use || []);
    }
  }, [initialData]);

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FB3640]/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Tabs Sidebar */}
        <div className="flex flex-col gap-2 w-full lg:w-64 shrink-0">
          {[
            { id: 1, label: 'Biznes Tavsifi', icon: Building2 },
            { id: 2, label: 'Yozish Ohangi', icon: MessageSquare },
            { id: 3, label: 'Til va Auditoriya', icon: Target },
            { id: 4, label: "So'z Qoidalari", icon: Tags },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-white border border-white/10 shadow-sm" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-[#FF6B6B]" : "text-zinc-500")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-h-[400px]">
          
          {/* TAB 1: BIZNES TAVSIFI */}
          <div className={cn("space-y-4 transition-all duration-500", activeTab === 1 ? "block opacity-100" : "hidden opacity-0")}>
            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-bold text-white">Biznes Tavsifi</h3>
              <p className="text-sm text-zinc-400">Sun'iy intellekt biznesingiz nima haqida ekanligini bilishi kerak.</p>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FB3640]/20 to-[#FB3640]/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-[#111111] border border-[#333333] group-focus-within:border-[#FB3640]/50 rounded-xl overflow-hidden transition-colors">
                {!description && (
                  <div className="absolute top-4 left-4 pointer-events-none text-zinc-500">
                    <TypingAnimation
                      duration={30}
                      className="text-sm font-normal text-left"
                    >Biznesingiz haqida yozing... Masalan: Biz Toshkentdagi stomatologiya klinikasimiz...</TypingAnimation>
                  </div>
                )}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  className="w-full h-48 bg-transparent text-white p-4 focus:outline-none resize-none z-10 relative text-sm leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-xs text-zinc-500 font-medium">
                  {description.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: YOZISH OHANGI */}
          <div className={cn("space-y-4 transition-all duration-500", activeTab === 2 ? "block opacity-100" : "hidden opacity-0")}>
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-bold text-white">Yozish Ohangi</h3>
              <p className="text-sm text-zinc-400">Maqolalar va postlar qanday uslubda yozilishini tanlang.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TONES.map((t) => {
                const isSelected = tone === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={cn(
                      "relative p-5 rounded-2xl cursor-pointer transition-all duration-300 group border",
                      isSelected 
                        ? "bg-[#FB3640]/10 border-[#FB3640]/50 shadow-[0_0_20px_rgba(251,54,64,0.2)]" 
                        : "bg-[#111111] border-[#333333] hover:border-[#444444] hover:bg-[#151515]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-black/50 border transition-colors",
                        isSelected ? "border-[#FB3640]/30" : "border-white/5"
                      )}>
                        {t.emoji}
                      </div>
                      <div>
                        <h4 className={cn("font-bold", isSelected ? "text-[#FF6B6B]" : "text-white")}>
                          {t.label}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TAB 3: TIL VA AUDITORIYA */}
          <div className={cn("space-y-4 transition-all duration-500", activeTab === 3 ? "block opacity-100" : "hidden opacity-0")}>
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-bold text-white">Til va Auditoriya</h3>
              <p className="text-sm text-zinc-400">Kim uchun va qaysi tilda kontent yaratamiz?</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#111111] p-5 rounded-xl border border-[#333333]">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                  Asosiy Til
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'uz', label: "O'zbek", icon: "🇺🇿" },
                    { id: 'en', label: "English", icon: "🇺🇸" }
                    // RU vaqtincha yashirilgan — kod type language: 'uz'|'ru'|'en' saqlangan
                  ].map((lang) => {
                    const isSelected = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLanguage(lang.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 border",
                          isSelected 
                            ? "bg-[#FB3640]/15 text-[#FF8A8F] border-[#FB3640]/50 shadow-[0_0_15px_rgba(251,54,64,0.2)]" 
                            : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span className="text-lg leading-none">{lang.icon}</span>
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#111111] p-5 rounded-xl border border-[#333333]">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                  Maqsadli Auditoriya
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {audience.map((a, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#FB3640]/10 text-[#FF6B6B] border border-[#FB3640]/20 rounded-full text-xs font-medium">
                      {a}
                      <button onClick={() => removePill(a, audience, setAudience)} className="hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <InputPill
                    value={audienceInput}
                    onChange={setAudienceInput}
                    onKeyDown={(e) => handleAddPill(e, audienceInput, setAudienceInput, audience, setAudience)}
                    placeholder="Kim uchun yozyapsiz? (Masalan: yoshlar, onalar) + Enter"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 4: SO'Z QOIDALARI */}
          <div className={cn("space-y-4 transition-all duration-500", activeTab === 4 ? "block opacity-100" : "hidden opacity-0")}>
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-bold text-white">So'z Qoidalari</h3>
              <p className="text-sm text-zinc-400">AI qaysi so'zlarni ishlatishi yoki ishlatmasligini belgilang.</p>
            </div>
            
            <div className="space-y-6">
              {/* Always use */}
              <div className="bg-[#111111] p-5 rounded-xl border border-[#333333] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3 pl-2">
                  Har doim ishlatilsin
                </label>
                <div className="flex flex-wrap gap-2 mb-3 pl-2">
                  {alwaysUse.map((word, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                      {word}
                      <button onClick={() => removePill(word, alwaysUse, setAlwaysUse)} className="hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="pl-2">
                  <InputPill
                    value={alwaysInput}
                    onChange={setAlwaysInput}
                    onKeyDown={(e) => handleAddPill(e, alwaysInput, setAlwaysInput, alwaysUse, setAlwaysUse)}
                    placeholder="Kerakli so'z... + Enter"
                  />
                </div>
              </div>

              {/* Never use */}
              <div className="bg-[#111111] p-5 rounded-xl border border-[#333333] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3 pl-2">
                  Hech qachon ishlatilmasin
                </label>
                <div className="flex flex-wrap gap-2 mb-3 pl-2">
                  {neverUse.map((word, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-medium">
                      {word}
                      <button onClick={() => removePill(word, neverUse, setNeverUse)} className="hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="pl-2">
                  <InputPill
                    value={neverInput}
                    onChange={setNeverInput}
                    onKeyDown={(e) => handleAddPill(e, neverInput, setNeverInput, neverUse, setNeverUse)}
                    placeholder="Taqiqlangan so'z... + Enter"
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* BOTTOM ACTION */}
      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
        <ShimmerButton
          onClick={handleSubmit}
          disabled={isSaving}
          className="shadow-2xl px-8 py-2 h-auto text-sm font-bold flex items-center gap-2"
          background="linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Sparkles className="h-4 w-4 text-white" />
          )}
          <span className="whitespace-nowrap z-10 relative text-white">
            {isSaving ? 'Saqlanmoqda...' : '✨ Brend DNKsini Saqlash'}
          </span>
        </ShimmerButton>
      </div>

    </div>
  );
}

function InputPill({ value, onChange, onKeyDown, placeholder }: any) {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-[#333333] focus:border-[#FB3640]/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FB3640]/50 transition-all"
      />
      <div className="absolute right-2 flex items-center gap-1 bg-[#222222] px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
        <span className="text-xs">↵</span> Enter
      </div>
    </div>
  );
}
