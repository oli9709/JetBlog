export interface GSCStats {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  dailyData: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topKeywords: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export async function getGSCStats(
  accessToken: string,
  siteUrl: string,
  days: number = 28
): Promise<GSCStats> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const apiBase = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const [perfRes, kwRes] = await Promise.all([
    fetch(apiBase, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 28
      })
    }),
    fetch(apiBase, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10
      })
    })
  ]);

  const [perf, kw] = await Promise.all([perfRes.json(), kwRes.json()]);

  const rows: any[] = perf.rows ?? [];
  const kwRows: any[] = kw.rows ?? [];

  const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0);
  const totalImpressions = rows.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = rows.length
    ? rows.reduce((s: number, r: any) => s + (r.position ?? 0), 0) / rows.length
    : 0;

  return {
    totalClicks,
    totalImpressions,
    avgCtr,
    avgPosition,
    dailyData: rows.map((r: any) => ({
      date: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0
    })),
    topKeywords: kwRows.map((r: any) => ({
      query: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0
    }))
  };
}
