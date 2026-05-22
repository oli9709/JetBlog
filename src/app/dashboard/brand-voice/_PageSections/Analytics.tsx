'use client';

import React from 'react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { Marquee } from '@/components/magicui/marquee';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, CalendarDays, Hash, Activity, MousePointerClick, Eye, BarChart2, Search, Unlink, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { GSCStats } from '@/lib/API/Services/gsc/fetch';

interface AnalyticsProps {
  siteId: string;
  stats: {
    totalArticles: number;
    publishedThisMonth: number;
    publishedThisWeek: number;
    avgWordsPerArticle: number;
    topKeywords: Array<{keyword: string, count: number}>;
    publishHistory: Array<{date: string, count: number}>;
  };
  gsc?: {
    connected: boolean;
    loading: boolean;
    gscSiteUrl?: string;
    stats?: GSCStats;
    noSite?: boolean;
  };
  onConnectGSC?: () => void;
  onDisconnectGSC?: () => void;
}

export function Analytics({ siteId, stats, gsc, onConnectGSC, onDisconnectGSC }: AnalyticsProps) {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-zinc-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FB3640]" />
            {payload[0].value} ta maqola
          </p>
        </div>
      );
    }
    return null;
  };

  const GSCTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-zinc-400 text-xs mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-white text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}: <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* --- JetBlog Internal Analytics --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[140px]">

        {/* Big card: Publish graph */}
        <div className="lg:col-span-2 lg:row-span-2 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FB3640]/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-6 z-10">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#FF6B6B]" />
                Oylik Nashr Grafigi
              </h3>
              <p className="text-zinc-400 text-xs mt-1">Oxirgi 30 kun ichida nashr qilingan maqolalar dinamikasi</p>
            </div>
          </div>
          <div className="flex-1 w-full -ml-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.publishHistory}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small cards */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FB3640]/10 rounded-full blur-xl group-hover:bg-[#FB3640]/20 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
            <FileText className="h-4 w-4 text-[#FF6B6B]" />
            Jami Maqolalar
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-white">
              <NumberTicker value={stats.totalArticles} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" /> +12%
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
            <CalendarDays className="h-4 w-4 text-emerald-400" />
            Bu Oy Nashr
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-white">
              <NumberTicker value={stats.publishedThisMonth} />
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-500"
                  strokeWidth="4"
                  strokeDasharray={`${Math.min((stats.publishedThisMonth / 100) * 100, 100)}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  stroke="currentColor"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FB3640]/20 rounded-full blur-xl group-hover:bg-[#FB3640]/20 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
            <Hash className="h-4 w-4 text-[#FF6B6B]" />
            O'rtacha Uzunlik
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-extrabold text-white flex items-baseline gap-1">
              <NumberTicker value={stats.avgWordsPerArticle} />
              <span className="text-sm text-zinc-500 font-medium">so'z</span>
            </div>
            <div className="flex gap-1 h-3 items-end mt-2">
              {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                <div key={i} className="w-2 bg-[#FB3640]/20 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-colors lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10 pointer-events-none" />
          <div className="text-zinc-400 font-medium text-sm mb-4">Top Kalit So'zlar</div>
          <div className="relative h-24 w-full flex flex-col items-center justify-center">
            <Marquee pauseOnHover className="[--duration:20s] absolute inset-x-0 top-0">
              {stats.topKeywords.slice(0, Math.ceil(stats.topKeywords.length / 2)).map((kw, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 mx-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                  <span className="text-xs font-bold text-white">{kw.keyword}</span>
                  <span className="text-[10px] bg-white/10 px-1.5 rounded-full text-zinc-400">{kw.count}</span>
                </div>
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:25s] absolute inset-x-0 bottom-0">
              {stats.topKeywords.slice(Math.ceil(stats.topKeywords.length / 2)).map((kw, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 mx-1 bg-[#FB3640]/10 border border-[#FB3640]/20 rounded-full backdrop-blur-md">
                  <span className="text-xs font-bold text-[#FF8A8F]">{kw.keyword}</span>
                  <span className="text-[10px] bg-[#FB3640]/20 px-1.5 rounded-full text-[#FF6B6B]">{kw.count}</span>
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#0a0a0a] z-20"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#0a0a0a] z-20"></div>
          </div>
        </div>

      </div>

      {/* --- Google Search Console Section --- */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 z-10 relative">
          <div className="flex items-center gap-3">
            {/* Google GSC icon */}
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Google Search Console</h3>
              {gsc?.connected && gsc.gscSiteUrl && (
                <p className="text-zinc-500 text-xs flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {gsc.gscSiteUrl}
                </p>
              )}
            </div>
          </div>

          {gsc?.connected ? (
            <button
              onClick={onDisconnectGSC}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Unlink className="h-3 w-3" />
              Uzish
            </button>
          ) : (
            <button
              onClick={onConnectGSC}
              disabled={gsc?.loading}
              className="flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {gsc?.loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              GSC Ulash
            </button>
          )}
        </div>

        {/* Content */}
        {!gsc?.connected ? (
          /* Not connected state */
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <BarChart2 className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Google Search Console ulang</p>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                Saytingizning real qidiruv ko'rsatkichlari: kliklar, impresyalar va top kalit so'zlarni ko'ring
              </p>
            </div>
            <button
              onClick={onConnectGSC}
              disabled={gsc?.loading}
              className="flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {gsc?.loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              🔗 GSC Ulash
            </button>
          </div>
        ) : gsc.loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : gsc.noSite ? (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-sm">GSC ulandi, lekin hech qanday sayt topilmadi.</p>
            <p className="text-zinc-500 text-xs mt-1">Google Search Console da saytingizni tekshiring.</p>
          </div>
        ) : gsc.stats ? (
          /* Connected + data */
          <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                  <MousePointerClick className="h-3.5 w-3.5 text-[#FF6B6B]" />
                  Jami Kliklar
                </div>
                <div className="text-2xl font-extrabold text-white">
                  <NumberTicker value={gsc.stats.totalClicks} />
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                  <Eye className="h-3.5 w-3.5 text-[#FF6B6B]" />
                  Impresyalar
                </div>
                <div className="text-2xl font-extrabold text-white">
                  <NumberTicker value={gsc.stats.totalImpressions} />
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                  <BarChart2 className="h-3.5 w-3.5 text-emerald-400" />
                  O'rtacha CTR
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {(gsc.stats.avgCtr * 100).toFixed(1)}
                  <span className="text-sm text-zinc-500 ml-0.5">%</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                  O'rtacha Pozitsiya
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {gsc.stats.avgPosition.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Daily clicks chart */}
            {gsc.stats.dailyData.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/8">
                <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-[#FF6B6B]" />
                  Kunlik Kliklar (oxirgi 28 kun)
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gsc.stats.dailyData}>
                      <defs>
                        <linearGradient id="gscGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip content={<GSCTooltip />} />
                      <Line type="monotone" dataKey="clicks" name="Kliklar" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="impressions" name="Impresyalar" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Top keywords table */}
            {gsc.stats.topKeywords.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/8">
                <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                  <Search className="h-4 w-4 text-orange-400" />
                  Top 10 Qidiruv So'zlari
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-white/8">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">So'rov</th>
                        <th className="pb-2 pr-4 text-right">Kliklar</th>
                        <th className="pb-2 pr-4 text-right">Impresyalar</th>
                        <th className="pb-2 pr-4 text-right">CTR</th>
                        <th className="pb-2 text-right">Pozitsiya</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsc.stats.topKeywords.map((kw, i) => (
                        <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-4 text-zinc-600 text-xs">{i + 1}</td>
                          <td className="py-2 pr-4 text-white text-sm font-medium max-w-[180px] truncate">{kw.query}</td>
                          <td className="py-2 pr-4 text-[#FF6B6B] text-sm font-mono text-right">{kw.clicks}</td>
                          <td className="py-2 pr-4 text-[#FF6B6B] text-sm font-mono text-right">{kw.impressions}</td>
                          <td className="py-2 pr-4 text-emerald-400 text-sm font-mono text-right">
                            {(kw.ctr * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 text-orange-400 text-sm font-mono text-right">
                            {kw.position.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
