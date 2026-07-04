'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, Globe, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/helpers';

interface SiteFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const SiteForm: React.FC<SiteFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({ url: '', wp_username: '', app_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setIsSuccess(false);
    
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setFormData({ url: '', wp_username: '', app_password: '' });
    } catch (error) {
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex flex-col gap-6 bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-300",
        isError && "animate-[shake_0.5s_ease-in-out]"
      )}
    >
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Yangi Sayt Qo'shish</h2>
        <p className="text-sm text-zinc-500">WordPress saytingizni JetBlog bilan bog'lang</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Floating Label Input - URL */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FF6B6B] transition-colors z-20">
            <Globe className="h-5 w-5" />
          </div>
          <input
            type="url"
            id="url"
            required
            placeholder=" "
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="peer block w-full pl-11 pr-4 pt-4 pb-2 bg-black/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all duration-300 placeholder-transparent z-10 relative"
          />
          <label 
            htmlFor="url"
            className="absolute text-sm text-zinc-500 duration-300 transform -translate-y-3 scale-75 top-4 z-20 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#FF6B6B] pointer-events-none"
          >
            Sayt URL manzili
          </label>
        </div>

        {/* Floating Label Input - Username */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FF6B6B] transition-colors z-20">
            <User className="h-5 w-5" />
          </div>
          <input
            type="text"
            id="wp_username"
            required
            placeholder=" "
            value={formData.wp_username}
            onChange={(e) => setFormData({ ...formData, wp_username: e.target.value })}
            className="peer block w-full pl-11 pr-4 pt-4 pb-2 bg-black/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all duration-300 placeholder-transparent z-10 relative"
          />
          <label 
            htmlFor="wp_username"
            className="absolute text-sm text-zinc-500 duration-300 transform -translate-y-3 scale-75 top-4 z-20 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#FF6B6B] pointer-events-none"
          >
            WP Username
          </label>
        </div>

        {/* Floating Label Input - Password */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FF6B6B] transition-colors z-20">
            <Lock className="h-5 w-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="app_password"
            required
            placeholder=" "
            value={formData.app_password}
            onChange={(e) => setFormData({ ...formData, app_password: e.target.value })}
            className="peer block w-full pl-11 pr-12 pt-4 pb-2 bg-black/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all duration-300 placeholder-transparent z-10 relative"
          />
          <label 
            htmlFor="app_password"
            className="absolute text-sm text-zinc-500 duration-300 transform -translate-y-3 scale-75 top-4 z-20 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#FF6B6B] pointer-events-none"
          >
            Application Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors z-20"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading || isSuccess}
        className={cn(
          "relative w-full h-12 mt-2 rounded-xl overflow-hidden group border-0 font-bold tracking-wide transition-all duration-500",
          isSuccess ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-[#FB3640] to-[#FB3640] text-white hover:shadow-[0_0_30px_rgba(251,54,64,0.2)] hover:scale-[1.02] active:scale-95"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Ulanmoqda...</>
          ) : isSuccess ? (
            <><CheckCircle2 className="w-5 h-5" /> Ulangan!</>
          ) : (
            "Saytni Bog'lash"
          )}
        </span>
        
        {/* Glow effect on hover */}
        {!isLoading && !isSuccess && (
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Button>

      {/* Shake Keyframes injected via generic style block (safe fallback since standard tailwind doesn't have shake) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}} />
    </form>
  );
};
