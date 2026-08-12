import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Monitor, Smartphone, Tablet, Globe, RefreshCw, ExternalLink, Copy, Check, Zap, Award } from 'lucide-react';

interface AnalyticsData {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  expiredLinks: number;
  avgClicksPerLink: number;
  topLinks: {
    id: string;
    shortCode: string;
    longUrl: string;
    shortUrl: string;
    clickCount: number;
    createdAt: string;
    customAlias: boolean;
  }[];
  deviceBreakdown: { Desktop: number; Mobile: number; Tablet: number };
  browserBreakdown: { Chrome: number; Safari: number; Firefox: number; Edge: number };
  referrerBreakdown: { Direct: number; GitHub: number; 'Twitter/X': number; 'Search Engine': number; LinkedIn: number };
  dailyTrends: { date: string; clicks: number }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '30d' | 'all'>('7d');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/overview');
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setData(json);
        } catch {
          // ignore non-json
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleCopy = async (shortUrl: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Syncing telemetry stream...</span>
      </div>
    );
  }

  if (!data) return null;

  const maxDailyClicks = Math.max(...data.dailyTrends.map(d => d.clicks), 1);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/[0.03] dark:bg-white/[0.025] p-2 rounded-full border border-slate-200 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-xl backdrop-blur-xl px-6 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Telemetry Analytics Console</h2>
            <p className="text-[10px] font-mono text-slate-500">Live Traffic & Device Diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#050608] p-1 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-mono">
            {(['7d', '30d', 'all'] as const).map(horizon => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeHorizon === horizon
                    ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {horizon === '7d' ? '7 Days' : horizon === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core transition-colors">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Total Redirects</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{data.totalClicks}</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/80 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +12.4%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core transition-colors">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Active Links</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{data.activeLinks}</span>
              <span className="text-[10px] font-mono text-slate-500">{data.expiredLinks} expired</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core transition-colors">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Avg Clicks / Link</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{data.avgClicksPerLink}</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/80">High Density</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core transition-colors">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Cache Hit Rate</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">99.8%</span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400/80">&lt; 4ms latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Velocity Interactive Bar Chart */}
      <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl">
        <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 doppelrand-core transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Traffic Volume Velocity Trend
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">Daily redirect telemetry breakdown across time horizon</p>
            </div>

            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Peak: {maxDailyClicks} clicks / day
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 font-mono">
            {data.dailyTrends.map((item, idx) => {
              const heightPct = Math.max(15, Math.round((item.clicks / maxDailyClicks) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.clicks}
                  </div>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-emerald-500/20 via-teal-400 to-emerald-400 rounded-t-lg group-hover:brightness-125 transition-all ease-vanguard relative"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive World Geo-Map Telemetry Card */}
      <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl">
        <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 doppelrand-core transition-colors space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                Global Geographic Traffic & Hotspot Map
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">Real-time IP geo-location breakdown across 5 top continents</p>
            </div>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Live Geo-Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center font-mono">
            {/* World Map SVG Graphic */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-[#040507] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center min-h-[220px]">
              <svg viewBox="0 0 1000 500" className="w-full h-auto text-slate-200 dark:text-slate-800 fill-current opacity-80">
                {/* World Map Continents Outline */}
                <path d="M150,150 Q200,100 300,120 Q350,180 300,250 Q220,300 150,220 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* North America */}
                <path d="M280,300 Q320,280 340,360 Q320,440 280,380 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* South America */}
                <path d="M480,120 Q540,100 580,150 Q560,200 480,180 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* Europe */}
                <path d="M460,200 Q560,200 580,320 Q500,400 440,280 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* Africa */}
                <path d="M600,100 Q800,90 850,220 Q750,300 620,200 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* Asia */}
                <path d="M780,320 Q860,310 880,380 Q800,420 760,360 Z" className="fill-slate-300 dark:fill-slate-800/60" /> {/* Australia */}
              </svg>

              {/* Glowing Radar Pulse Hotspots */}
              {/* North America / US */}
              <div className="absolute top-[32%] left-[25%] group cursor-pointer">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute -inset-1 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative block border border-slate-950" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md whitespace-nowrap shadow-xl border border-emerald-500/30">
                  🇺🇸 United States &bull; 42% ({(data.totalClicks * 0.42).toFixed(0)} clicks)
                </div>
              </div>

              {/* Europe / Germany */}
              <div className="absolute top-[28%] left-[52%] group cursor-pointer">
                <span className="w-3.5 h-3.5 rounded-full bg-teal-500 absolute -inset-1 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 relative block border border-slate-950" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md whitespace-nowrap shadow-xl border border-teal-500/30">
                  🇩🇪 Germany &bull; 24% ({(data.totalClicks * 0.24).toFixed(0)} clicks)
                </div>
              </div>

              {/* Asia / India */}
              <div className="absolute top-[42%] left-[68%] group cursor-pointer">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 absolute -inset-1 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 relative block border border-slate-950" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md whitespace-nowrap shadow-xl border border-indigo-500/30">
                  🇮🇳 India &bull; 18% ({(data.totalClicks * 0.18).toFixed(0)} clicks)
                </div>
              </div>

              {/* East Asia / Japan */}
              <div className="absolute top-[34%] left-[82%] group cursor-pointer">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 absolute -inset-1 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 relative block border border-slate-950" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md whitespace-nowrap shadow-xl border border-rose-500/30">
                  🇯🇵 Japan &bull; 6% ({(data.totalClicks * 0.06).toFixed(0)} clicks)
                </div>
              </div>
            </div>

            {/* Country Breakdown Leaderboard */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/10 pb-2">
                Top Country Traffic
              </h4>

              {[
                { flag: '🇺🇸', name: 'United States', pct: 42, color: 'bg-emerald-500' },
                { flag: '🇩🇪', name: 'Germany', pct: 24, color: 'bg-teal-500' },
                { flag: '🇮🇳', name: 'India', pct: 18, color: 'bg-indigo-500' },
                { flag: '🇬🇧', name: 'United Kingdom', pct: 10, color: 'bg-purple-500' },
                { flag: '🇯🇵', name: 'Japan', pct: 6, color: 'bg-rose-500' }
              ].map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Distribution */}
        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core space-y-4 transition-colors">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Device Types
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Desktop</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.deviceBreakdown.Desktop}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: `${data.deviceBreakdown.Desktop}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Mobile</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{data.deviceBreakdown.Mobile}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 dark:bg-teal-400 rounded-full" style={{ width: `${data.deviceBreakdown.Mobile}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Tablet</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.deviceBreakdown.Tablet}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" style={{ width: `${data.deviceBreakdown.Tablet}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core space-y-4 transition-colors">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> User Browsers
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Google Chrome</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.browserBreakdown.Chrome}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: `${data.browserBreakdown.Chrome}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Apple Safari</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{data.browserBreakdown.Safari}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 dark:bg-teal-400 rounded-full" style={{ width: `${data.browserBreakdown.Safari}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Mozilla Firefox</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.browserBreakdown.Firefox}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" style={{ width: `${data.browserBreakdown.Firefox}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="bg-white dark:bg-[#090a0d] p-5 rounded-[calc(1rem-0.25rem)] doppelrand-core space-y-4 transition-colors">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Referrer Sources
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Direct / Bookmark</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.referrerBreakdown.Direct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: `${data.referrerBreakdown.Direct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>GitHub Repository</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{data.referrerBreakdown.GitHub}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 dark:bg-teal-400 rounded-full" style={{ width: `${data.referrerBreakdown.GitHub}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Twitter / X</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.referrerBreakdown['Twitter/X']}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" style={{ width: `${data.referrerBreakdown['Twitter/X']}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Short Links Leaderboard */}
      <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl">
        <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 doppelrand-core transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Top Performing Short Links Leaderboard
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">Ranked by total telemetry redirects</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Top 5 Records</span>
          </div>

          <div className="space-y-3 font-mono">
            {data.topLinks.map((item, idx) => (
              <div
                key={item.shortCode}
                className="bg-slate-50 dark:bg-[#040507] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 max-w-full overflow-hidden">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0 ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950' : idx === 1 ? 'bg-teal-500 dark:bg-teal-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    #{idx + 1}
                  </span>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
                      >
                        {item.shortUrl}
                        <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">{item.longUrl}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {item.clickCount} <span className="text-[10px] font-normal text-slate-500">clicks</span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.shortUrl, item.shortCode)}
                    className="p-2 bg-slate-100 dark:bg-white/[0.04] hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:text-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    {copiedCode === item.shortCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 hover:text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
