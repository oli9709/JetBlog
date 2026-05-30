'use client';

import React, { useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Eye, EyeOff, RefreshCw, Globe, Key, User, Link, Hash } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PlatformType } from './PlatformSelector';

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

const NODE_SNIPPET = `// Express.js
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-textpilot-signature'];
  // Verify signature with your secret
  const payload = req.body;
  console.log('New article:', payload.title);
  res.sendStatus(200);
});`;

const PHP_SNIPPET = `<?php
// Verify signature
$sig = $_SERVER['HTTP_X_TEXTPILOT_SIGNATURE'];
$payload = file_get_contents('php://input');
$expected = hash_hmac('sha256', $payload, YOUR_SECRET);

if (!hash_equals($expected, $sig)) {
  http_response_code(401); exit;
}
$data = json_decode($payload, true);
error_log('New article: ' . $data['title']);
http_response_code(200);`;

export function ConnectionForm({ platform, data, onChange }: ConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const update = (patch: Partial<ConnectionFormData>) => onChange({ ...data, ...patch });

  const generateSecret = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    const secret = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    update({ webhookSecret: secret });
  };

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

  // webhook
  return (
    <div className="flex flex-col gap-4">
      <FloatingInput
        id="wh-endpoint"
        label="Endpoint URL"
        type="url"
        value={data.webhookEndpoint ?? ''}
        onChange={(v) => update({ webhookEndpoint: v })}
        icon={<Link className="w-5 h-5" />}
        required
      />
      <div className="relative group">
        <FloatingInput
          id="wh-secret"
          label="Secret Key"
          value={data.webhookSecret ?? ''}
          onChange={(v) => update({ webhookSecret: v })}
          icon={<Key className="w-5 h-5" />}
          suffix={
            <button
              type="button"
              onClick={generateSecret}
              className="text-zinc-500 hover:text-[#FB3640] transition-colors"
              title="Auto-generate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          }
        />
      </div>

      <div className="mt-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Namuna kod snippet
        </p>
        <TabsPrimitive.Root defaultValue="node">
          <TabsPrimitive.List className="flex gap-1 mb-3 bg-zinc-900 p-1 rounded-xl w-fit">
            {['node', 'php'].map((tab) => (
              <TabsPrimitive.Trigger
                key={tab}
                value={tab}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200',
                  'text-zinc-400 hover:text-white',
                  'data-[state=active]:bg-[#FB3640] data-[state=active]:text-white data-[state=active]:shadow'
                )}
              >
                {tab === 'node' ? 'Node.js' : 'PHP'}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          <TabsPrimitive.Content value="node">
            <pre className="text-[11px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 overflow-x-auto leading-relaxed">
              {NODE_SNIPPET}
            </pre>
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="php">
            <pre className="text-[11px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 overflow-x-auto leading-relaxed">
              {PHP_SNIPPET}
            </pre>
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </div>
    </div>
  );
}
