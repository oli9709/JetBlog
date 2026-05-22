'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Webhook {
  id: string;
  site_id: string;
  endpoint_url: string;
  events: string[];
  is_active: boolean;
  last_status: number | null;
  last_triggered_at: string | null;
  retry_count: number;
  created_at: string;
  secret_key?: string;
}

interface Site {
  id: string;
  url: string;
}

const ALL_EVENTS = ['article.published', 'article.generated'];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    site_id: '',
    endpoint_url: '',
    events: ['article.published'] as string[]
  });
  const [newSecret, setNewSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [whRes, sitesRes] = await Promise.all([
      fetch('/api/webhooks').then(r => r.json()),
      fetch('/api/sites').then(r => r.json()).catch(() => ({ sites: [] }))
    ]);
    setWebhooks(whRes.webhooks || []);
    setSites(sitesRes.sites || sitesRes.data || []);
    setLoading(false);
  }

  async function createWebhook() {
    if (!form.site_id || !form.endpoint_url) {
      toast.error('Sayt va URL talab qilinadi');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(r => r.json());
    setCreating(false);

    if (res.success) {
      setNewSecret(res.webhook.secret_key);
      setForm({ site_id: '', endpoint_url: '', events: ['article.published'] });
      fetchData();
      toast.success('Webhook yaratildi!');
    } else {
      toast.error(res.error || 'Xatolik yuz berdi');
    }
  }

  async function deleteWebhook(id: string) {
    const res = await fetch('/api/webhooks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json());

    if (res.success) {
      setWebhooks(w => w.filter(wh => wh.id !== id));
      toast.success('Webhook o\'chirildi');
    } else {
      toast.error(res.error);
    }
  }

  async function testWebhook(id: string) {
    setTestingId(id);
    const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' }).then(r => r.json());
    setTestingId(null);
    if (res.success) {
      toast.success(`Test yuborildi! HTTP ${res.status}`);
      fetchData();
    } else {
      toast.error(res.message || 'Test muvaffaqiyatsiz');
    }
  }

  function toggleEvent(event: string) {
    setForm(f => ({
      ...f,
      events: f.events.includes(event)
        ? f.events.filter(e => e !== event)
        : [...f.events, event]
    }));
  }

  function copySecret() {
    if (newSecret) {
      navigator.clipboard.writeText(newSecret);
      toast.success('Secret key nusxalandi!');
    }
  }

  function statusBadge(status: number | null) {
    if (!status) return <span className="text-gray-400 text-xs">—</span>;
    const ok = status >= 200 && status < 300;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${ok ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Webhooks</h2>
        <p className="text-sm text-muted-foreground">
          Maqola publish bo&apos;lganda tashqi tizimga avtomatik signal yuboradi.
        </p>
      </div>

      {/* Yangi webhook yaratish */}
      <div className="border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-medium">Yangi Webhook</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Sayt</label>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={form.site_id}
              onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))}
            >
              <option value="">Sayt tanlang...</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.url}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Endpoint URL</label>
            <input
              type="url"
              placeholder="https://your-server.com/webhook"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={form.endpoint_url}
              onChange={e => setForm(f => ({ ...f, endpoint_url: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Eventlar</label>
            <div className="flex gap-4">
              {ALL_EVENTS.map(ev => (
                <label key={ev} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.events.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                    className="rounded"
                  />
                  <code className="text-xs">{ev}</code>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={createWebhook}
            disabled={creating}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {creating ? 'Yaratilmoqda...' : '+ Webhook yaratish'}
          </button>
        </div>

        {newSecret && (
          <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <p className="text-xs text-yellow-400 mb-2 font-medium">
              ⚠️ Secret key faqat bir marta ko&apos;rsatiladi — hozir nusxa oling!
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-black/30 px-2 py-1 rounded flex-1 break-all">
                {newSecret}
              </code>
              <button
                onClick={copySecret}
                className="text-xs bg-yellow-600 text-white px-3 py-1 rounded shrink-0"
              >
                Nusxa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Webhook ro'yxati */}
      <div className="space-y-3">
        <h3 className="font-medium">Mavjud Webhooklar</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        ) : webhooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hech qanday webhook yo&apos;q.</p>
        ) : (
          webhooks.map(wh => (
            <div key={wh.id} className="border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{wh.endpoint_url}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(wh.last_status)}
                  <button
                    onClick={() => testWebhook(wh.id)}
                    disabled={testingId === wh.id}
                    className="text-xs bg-[#FB3640] text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    {testingId === wh.id ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="text-xs bg-red-900 text-red-300 px-3 py-1 rounded hover:bg-red-800"
                  >
                    O&apos;chir
                  </button>
                </div>
              </div>

              {wh.last_triggered_at && (
                <p className="text-xs text-muted-foreground">
                  Oxirgi: {new Date(wh.last_triggered_at).toLocaleString('uz-UZ')}
                  {wh.retry_count > 0 && <span className="text-yellow-500 ml-2">Retry: {wh.retry_count}</span>}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
