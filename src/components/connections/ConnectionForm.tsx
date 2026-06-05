'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Globe, Key, User, Hash } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PlatformType } from './PlatformSelector';
import { AIBuilderPrompt } from './AIBuilderPrompt';

const WEBHOOK_RECEIVE_URL = 'https://jet-blog-zeta.vercel.app/api/webhooks/receive';

function generateSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface ConnectionFormData {
  platform: PlatformType;
  siteUrl: string;
  wpUsername?: string;
  wpPassword?: string;
  ghostApiKey?: string;
  webflowToken?: string;
  webflowCollectionId?: string;
  webhookEndpoint?: string;
  webhookSecret?: string;
}

interface ConnectionFormProps {
  platform: PlatformType;
  data: ConnectionFormData;
  onChange: (data: ConnectionFormData) => void;
}

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  required,
  placeholder,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FB3640] transition-colors z-20">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder ?? ' '}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'peer block w-full pt-4 pb-2 bg-black/50 border border-zinc-800 rounded-xl text-white',
          'focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all duration-300 placeholder-transparent z-10 relative',
          icon ? 'pl-11' : 'pl-4',
          suffix ? 'pr-12' : 'pr-4'
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          'absolute text-sm text-zinc-500 duration-300 transform -translate-y-3 scale-75 top-4 z-20 origin-[0]',
          'peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0',
          'peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#FB3640] pointer-events-none',
          icon ? 'left-11' : 'left-4'
        )}
      >
        {label}
      </label>
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-20">{suffix}</div>
      )}
    </div>
  );
}

function HintBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400">
      <span className="text-[#FB3640] font-bold mt-0.5">i</span>
      <span>{children}</span>
    </div>
  );
}


export function ConnectionForm({ platform, data, onChange }: ConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken]       = useState(false);
  const [showApiKey, setShowApiKey]     = useState(false);
  const [secretKey]                     = useState(() => generateSecret());

  const update = (patch: Partial<ConnectionFormData>) => onChange({ ...data, ...patch });

  // Webhook platformi tanlanganida form maydonlarini avtomatik to'ldirish
  // (wizard canNext() validatsiyasi uchun)
  useEffect(() => {
    if (platform === 'webhook') {
      update({
        siteUrl:         WEBHOOK_RECEIVE_URL,
        webhookEndpoint: WEBHOOK_RECEIVE_URL,
        webhookSecret:   secretKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  if (platform === 'wordpress') {
    return (
      <div className="flex flex-col gap-4">
        <FloatingInput
          id="wp-url"
          label="Site URL (https://...)"
          type="url"
          value={data.siteUrl}
          onChange={(v) => update({ siteUrl: v })}
          icon={<Globe className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="wp-username"
          label="WP Username"
          value={data.wpUsername ?? ''}
          onChange={(v) => update({ wpUsername: v })}
          icon={<User className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="wp-password"
          label="WP Application Password"
          type={showPassword ? 'text' : 'password'}
          value={data.wpPassword ?? ''}
          onChange={(v) => update({ wpPassword: v })}
          icon={<Key className="w-5 h-5" />}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
      </div>
    );
  }

  if (platform === 'ghost') {
    return (
      <div className="flex flex-col gap-4">
        <FloatingInput
          id="ghost-url"
          label="Ghost URL (https://...)"
          type="url"
          value={data.siteUrl}
          onChange={(v) => update({ siteUrl: v })}
          icon={<Globe className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="ghost-key"
          label="Admin API Key"
          type={showApiKey ? 'text' : 'password'}
          value={data.ghostApiKey ?? ''}
          onChange={(v) => update({ ghostApiKey: v })}
          icon={<Key className="w-5 h-5" />}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowApiKey((p) => !p)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
        <HintBox>
          Settings → Integrations → Add custom integration — &quot;Admin API Key&quot; ni nusxa oling.
        </HintBox>
      </div>
    );
  }

  if (platform === 'webflow') {
    return (
      <div className="flex flex-col gap-4">
        <FloatingInput
          id="wf-url"
          label="Site URL"
          type="url"
          value={data.siteUrl}
          onChange={(v) => update({ siteUrl: v })}
          icon={<Globe className="w-5 h-5" />}
          required
        />
        <FloatingInput
          id="wf-token"
          label="API Token"
          type={showToken ? 'text' : 'password'}
          value={data.webflowToken ?? ''}
          onChange={(v) => update({ webflowToken: v })}
          icon={<Key className="w-5 h-5" />}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowToken((p) => !p)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
        <FloatingInput
          id="wf-collection"
          label="Collection ID"
          value={data.webflowCollectionId ?? ''}
          onChange={(v) => update({ webflowCollectionId: v })}
          icon={<Hash className="w-5 h-5" />}
          required
        />
        <HintBox>
          Webflow Dashboard → Project Settings → Integrations → API Access Token
        </HintBox>
      </div>
    );
  }

  // webhook → AI Builder Prompt
  return (
    <AIBuilderPrompt
      webhookUrl={WEBHOOK_RECEIVE_URL}
      secretKey={secretKey}
    />
  );
}
