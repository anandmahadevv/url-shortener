import React, { useState, useMemo } from 'react';
import { Copy, Check, RefreshCw, BarChart2, ExternalLink, Globe, Clock, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';

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
  onShowToast?: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const UrlList: React.FC<UrlListProps> = ({ urls, onRefreshStats, onDeleteUrl, onShowToast }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'aliases' | 'expired'>('all');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'clicks'>('newest');

  const handleCopy = async (shortUrl: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(shortCode);
      if (onShowToast) onShowToast('Short Link Copied', shortUrl);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshStats();
    if (onShowToast) onShowToast('Synced Telemetry Stats', 'Fetched latest click analytics');
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredAndSortedUrls = useMemo(() => {
    return urls
      .filter((item) => {
        // Search Filter
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchCode = item.shortCode.toLowerCase().includes(query);
          const matchLong = item.longUrl.toLowerCase().includes(query);
          const matchShort = item.shortUrl.toLowerCase().includes(query);
          if (!matchCode && !matchLong && !matchShort) return false;
        }

        // Category Filter
        const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
        if (filterMode === 'active' && isExpired) return false;
        if (filterMode === 'aliases' && !item.customAlias) return false;
        if (filterMode === 'expired' && !isExpired) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortMode === 'clicks') {
          return (b.clickCount || 0) - (a.clickCount || 0);
        }
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [urls, searchQuery, filterMode, sortMode]);

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
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Managed Links & Telemetry
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">Real-time click tracking & Base62 index</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          Sync Stats
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 font-sans">
        
        {/* Search Input Box */}
        <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl focus-within:border-emerald-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Search links by code, alias, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
          {(['all', 'active', 'aliases', 'expired'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                filterMode === mode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0b0f19] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-[#111726]">Newest First</option>
            <option value="oldest" className="dark:bg-[#111726]">Oldest First</option>
            <option value="clicks" className="dark:bg-[#111726]">Most Clicked</option>
          </select>
        </div>

      </div>

      {/* Link Row List */}
      {filteredAndSortedUrls.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-[#0b0f19] rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">No managed links matched your search or filter options.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedUrls.map((item) => {
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
      )}

    </div>
  );
};
