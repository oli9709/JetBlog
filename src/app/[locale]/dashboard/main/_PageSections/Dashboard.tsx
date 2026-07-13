'use client';

import SummaryCard from './SummaryCard';
import { Icons } from '@/components/Icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ArticleRow } from '../page';
import { useTranslations, useLocale } from 'next-intl';

interface DashboardStats {
  credits: number;
  activeSites: number;
  totalArticles: number;
  thisMonthPublished: number;
}

interface DashboardProps {
  stats: DashboardStats;
  articlesByDay: { date: string; count: number }[];
  keywordStats: { approved: number; pending: number; rejected: number };
  recentArticles: ArticleRow[];
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  const t = useTranslations('Dashboard');
  const map: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft:     'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    error:     'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const labelMap: Record<string, string> = {
    published: t('published'),
    draft: t('draft'),
    scheduled: t('scheduled'),
    error: t('error'),
  };
  const cls = map[status ?? ''] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {labelMap[status ?? ''] ?? status ?? '—'}
    </span>
  );
}

// ─── Keywords Pie (CSS conic-gradient) ─────────────────────────────────────────
function KeywordsPie({ approved, pending, rejected }: { approved: number; pending: number; rejected: number }) {
  const t = useTranslations('Dashboard');
  const total = approved + pending + rejected;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
        <div
          className="w-32 h-32 rounded-full"
          style={{ background: 'conic-gradient(#3f3f46 0% 100%)' }}
        />
        <p className="text-xs text-muted-foreground">{t('noKeywords')}</p>
      </div>
    );
  }

  const aP = (approved / total) * 100;
  const pP = (pending / total) * 100;
  // rejected fills the rest
  const gradient = `conic-gradient(
    #22c55e 0% ${aP.toFixed(1)}%,
    #eab308 ${aP.toFixed(1)}% ${(aP + pP).toFixed(1)}%,
    #ef4444 ${(aP + pP).toFixed(1)}% 100%
  )`;

  const items = [
    { label: t('approved'), value: approved, color: '#22c55e' },
    { label: t('pending'),     value: pending,  color: '#eab308' },
    { label: t('rejected'),  value: rejected, color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative">
        <div className="w-36 h-36 rounded-full" style={{ background: gradient }} />
        {/* donut hole */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-card flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{total}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">total</span>
          </div>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom tooltip for line chart ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  const t = useTranslations('Dashboard');
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs">
      <p className="font-medium mb-0.5">{label}</p>
      <p className="text-[#FB3640] font-bold">{payload[0].value} {t('articleSuffix')}</p>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
const Dashboard = ({ stats, articlesByDay, keywordStats, recentArticles }: DashboardProps) => {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  // Shorten date labels: "2024-06-04" → "Jun 4"
  const chartData = articlesByDay.map((d) => {
    const dt = new Date(d.date);
    const label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { date: label, count: d.count };
  });

  // Show every 5th tick to avoid crowding
  const ticks = chartData.filter((_, i) => i % 5 === 0).map((d) => d.date);

  return (
    <div className="w-11/12 space-y-6">
      {/* ── 4 Stat Cards ── */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          card_title={t('totalArticles')}
          icon={<Icons.FileText />}
          content_main={stats.totalArticles}
          content_secondary={t('allArticles')}
        />
        <SummaryCard
          card_title={t('activeSites')}
          icon={<Icons.Link />}
          content_main={stats.activeSites}
          content_secondary={t('connectedActiveSites')}
        />
        <SummaryCard
          card_title={t('creditsRemaining')}
          icon={<Icons.CircleDollarSign />}
          content_main={stats.credits}
          content_secondary={t('aiCreditsDesc')}
        />
        <SummaryCard
          card_title={t('publishedThisMonth')}
          icon={<Icons.ScreenShare />}
          content_main={stats.thisMonthPublished}
          content_secondary={t('createdThisMonth')}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-4">
        {/* Line chart — last 30 days */}
        <div className="xl:col-span-3">
          <Card className="bg-background-light dark:bg-background-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('articlesLast30Days')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {articlesByDay.every((d) => d.count === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                  {t('noArticles')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      ticks={ticks}
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#FB3640"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#FB3640' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pie chart — keywords status */}
        <div className="xl:col-span-1">
          <Card className="bg-background-light dark:bg-background-dark h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('keywordsStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <KeywordsPie
                approved={keywordStats.approved}
                pending={keywordStats.pending}
                rejected={keywordStats.rejected}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Articles Table ── */}
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('recentArticles')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {t('noArticlesCreated')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted/30">
                    <th className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{t('title')}</th>
                    <th className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">{t('site')}</th>
                    <th className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{t('status')}</th>
                    <th className="text-left pb-2 text-xs font-medium text-muted-foreground hidden md:table-cell">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/20">
                  {recentArticles.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 pr-4 max-w-[200px]">
                        <span className="truncate block font-medium text-foreground text-xs">
                          {a.title ?? '—'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground truncate max-w-[120px] block">
                          {a.site_url ?? '—'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-2.5 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {a.created_at
                            ? new Date(a.created_at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'uz-UZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
