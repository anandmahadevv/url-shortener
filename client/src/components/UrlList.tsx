import React, { useState } from 'react';
import { Copy, Check, RefreshCw, BarChart2, ExternalLink, Globe, Clock, Trash2 } from 'lucide-react';

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
  onDeleteUrl?: (shortCode: string) => void;
}

export const UrlList: React.FC<UrlListProps> = ({ urls, onRefreshStats, onDeleteUrl }) => {
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
      <div className="w-full max-w-3xl mx-auto mt-10 bg-white dark:bg-[#111726] p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-colors">
        <Globe className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">No Managed Links Provisioned</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Submit a URL above to create your first Base62 short link.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 bg-white dark:bg-[#111726] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-black/40 animate-slide-up transition-colors duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Managed Links & Telemetry
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">Real-time click tracking & Base62 index</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
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
              className="bg-slate-50/70 hover:bg-slate-100/90 dark:bg-[#0b0f19] dark:hover:bg-[#0f1524] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all ease-vanguard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xs"
            >
              <div className="space-y-1.5 overflow-hidden max-w-full">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1.5 truncate"
                  >
                    {item.shortUrl}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </a>

                  {item.customAlias && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
                      Alias
                    </span>
                  )}

                  {isExpired && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30">
                      Expired
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate max-w-md" title={item.longUrl}>
                  {item.longUrl}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5 font-sans font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 rounded-xl font-mono">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">
                    {item.clickCount} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">clicks</span>
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(item.shortUrl, item.shortCode)}
                  className="p-2.5 bg-white hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
                  title="Copy link"
                >
                  {copiedCode === item.shortCode ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {onDeleteUrl && (
                  <button
                    onClick={() => onDeleteUrl(item.shortCode)}
                    className="p-2.5 bg-white hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 dark:hover:text-white text-slate-500 dark:text-slate-400 hover:border-rose-600 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
