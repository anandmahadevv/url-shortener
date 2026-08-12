import React, { useState } from 'react';
import { Copy, Check, RefreshCw, BarChart2, ExternalLink, Globe, Clock } from 'lucide-react';

interface UrlItem {
  id: string;
  shortCode: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
  customAlias: boolean;
}

interface UrlListProps {
  urls: UrlItem[];
  onRefreshStats: () => void;
}

export const UrlList: React.FC<UrlListProps> = ({ urls, onRefreshStats }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopy = async (shortUrl: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (urls.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-10 bg-slate-900/[0.03] dark:bg-white/[0.02] p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 text-center transition-colors">
        <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-10 transition-colors">
          <Globe className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-700 dark:text-slate-300 font-semibold">No Managed Links Provisioned</h3>
          <p className="text-[11px] text-slate-500 font-mono mt-1">Submit a URL above to create your first Base62 short link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl animate-slide-up transition-colors duration-300">
      <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 doppelrand-core transition-colors duration-300">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Managed Links & Telemetry
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Real-time click tracking & Base62 index</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-mono transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            Sync Stats
          </button>
        </div>

        <div className="space-y-3">
          {urls.map((item) => {
            const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;

            return (
              <div
                key={item.shortCode}
                className="bg-slate-50 dark:bg-[#040507] border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all ease-vanguard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 overflow-hidden max-w-full">
                  <div className="flex items-center gap-2 flex-wrap font-mono">
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 truncate"
                    >
                      {item.shortUrl}
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                    </a>

                    {item.customAlias && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Alias
                      </span>
                    )}

                    {isExpired && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        Expired
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-md" title={item.longUrl}>
                    {item.longUrl}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                  <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {item.clickCount} <span className="text-[10px] font-normal text-slate-500">clicks</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.shortUrl, item.shortCode)}
                    className="p-2.5 bg-slate-100 dark:bg-white/[0.04] hover:bg-emerald-500 hover:text-slate-950 dark:hover:bg-emerald-400 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer"
                    title="Copy link"
                  >
                    {copiedCode === item.shortCode ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-slate-950" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
