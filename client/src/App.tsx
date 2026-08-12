import React, { useState, useEffect } from 'react';
import { ShortenForm } from './components/ShortenForm';
import { ShortenResult } from './components/ShortenResult';
import { UrlList } from './components/UrlList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import { ThemeSwitcher, ThemeMode } from './components/ThemeSwitcher';
import { Zap, Cpu, Link2, BarChart2, Sparkles, Terminal } from 'lucide-react';

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

export function App() {
  const [activeTab, setActiveTab] = useState<'shortener' | 'analytics' | 'api'>('shortener');
  const [currentResult, setCurrentResult] = useState<UrlItem | null>(null);
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | undefined>(undefined);

  // Theme Management
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('swift_theme') as ThemeMode) || 'system';
  });

  useEffect(() => {
    localStorage.setItem('swift_theme', themeMode);
    const root = document.documentElement;

    const applyTheme = () => {
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
        root.classList.toggle('light', !isDark);
      } else {
        root.classList.toggle('dark', themeMode === 'dark');
        root.classList.toggle('light', themeMode === 'light');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path === '/404' || params.has('code')) {
      setIsNotFoundPage(true);
      setNotFoundCode(params.get('code') || undefined);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('swift_urls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUrls(parsed);
        refreshAllStats(parsed);
      } catch (err) {
        console.error('Error parsing stored URLs', err);
      }
    }
  }, []);

  const refreshAllStats = async (items: UrlItem[]) => {
    try {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(`/api/stats/${item.shortCode}`);
            if (res.ok) {
              const data = await res.json();
              return { ...item, clickCount: data.clickCount };
            }
          } catch (err) {
            // retain existing
          }
          return item;
        })
      );

      setUrls(updated);
      localStorage.setItem('swift_urls', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to refresh stats', err);
    }
  };

  const handleShortenSuccess = (newUrl: UrlItem) => {
    setCurrentResult(newUrl);

    setUrls((prev) => {
      const filtered = prev.filter((u) => u.shortCode !== newUrl.shortCode);
      const nextList = [newUrl, ...filtered];
      localStorage.setItem('swift_urls', JSON.stringify(nextList));
      return nextList;
    });
  };

  if (isNotFoundPage) {
    return (
      <NotFoundPage
        shortCode={notFoundCode}
        onGoHome={() => {
          setIsNotFoundPage(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);

  return (
    <div className="min-h-screen bg-ethereal-mesh text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-400 selection:text-slate-950 transition-colors duration-300">
      {/* Floating Glass Navbar */}
      <div className="pt-6 px-4">
        <header className="max-w-4xl mx-auto bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-full p-2 px-4 sm:px-6 flex items-center justify-between shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">niat.me</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">engine</span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#050608] p-1 rounded-full border border-slate-200 dark:border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('shortener')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'shortener'
                  ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shortener</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'api'
                  ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Mode Switcher: Light, Dark, System */}
            <ThemeSwitcher themeMode={themeMode} onChangeTheme={setThemeMode} />
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-12 pb-24 flex-grow">
        {activeTab === 'shortener' && (
          <div className="space-y-10 animate-slide-up">
            {/* Header Banner */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-mono font-semibold tracking-[0.25em]">
                <Sparkles className="w-3 h-3" /> niat.me Base62 Key Engine &bull; Redis Cache &bull; Postgres
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                High-Performance <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  URL Shortener & Telemetry
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-mono leading-relaxed">
                Deterministic Base62 short code generation for <strong className="text-slate-900 dark:text-slate-200 font-bold">niat.me</strong>, dual-layer caching, non-blocking click analytics, and strict protocol validation.
              </p>
            </div>

            {/* Asymmetrical Bento Metric Architecture */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="bg-white dark:bg-[#090a0d] p-4 rounded-[calc(1rem-0.25rem)] transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Provisioned Links</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{urls.length}</span>
                </div>
              </div>

              <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="bg-white dark:bg-[#090a0d] p-4 rounded-[calc(1rem-0.25rem)] transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Click Telemetry</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{totalClicks}</span>
                </div>
              </div>

              <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="bg-white dark:bg-[#090a0d] p-4 rounded-[calc(1rem-0.25rem)] transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Algorithm</span>
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Base62 ID
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/[0.03] dark:bg-white/[0.025] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="bg-white dark:bg-[#090a0d] p-4 rounded-[calc(1rem-0.25rem)] transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Caching</span>
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Redis Hot
                  </span>
                </div>
              </div>
            </div>

            {/* Shorten Form */}
            <ShortenForm onShortenSuccess={handleShortenSuccess} />

            {/* Shorten Result Display */}
            {currentResult && <ShortenResult result={currentResult} />}

            {/* List of Shortened URLs */}
            <UrlList urls={urls} onRefreshStats={() => refreshAllStats(urls)} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* API Specs Tab */}
        {activeTab === 'api' && (
          <div className="w-full max-w-3xl mx-auto bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl animate-slide-up transition-colors">
            <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 doppelrand-core space-y-6 font-mono transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  REST API Interface Specification
                </h2>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  v1.0 Ready
                </span>
              </div>

              {/* Endpoint 1 */}
              <div className="bg-slate-50 dark:bg-[#040507] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">POST</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">/api/shorten</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Shortens a long URL using Base62 encoding of auto-incrementing DB id.</p>
                <pre className="text-[11px] bg-white dark:bg-[#090a0d] p-3 rounded-xl text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-transparent overflow-x-auto">
{`{
  "longUrl": "https://example.com/page",
  "customAlias": "my-alias", // Optional
  "expiresAt": "2026-12-31T23:59:59Z" // Optional
}`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-slate-50 dark:bg-[#040507] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">GET</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">/:shortCode</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Resolves short code via Redis cache & Postgres, returning 301 Permanent Redirect.</p>
              </div>

              {/* Endpoint 3 */}
              <div className="bg-slate-50 dark:bg-[#040507] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-400 border border-teal-500/30">GET</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">/api/stats/:shortCode</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Returns click count, creation timestamp, expiration, and original URL.</p>
              </div>

              {/* Endpoint 4 */}
              <div className="bg-slate-50 dark:bg-[#040507] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30">GET</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">/api/analytics/overview</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Aggregates system-wide telemetry, device breakdown, and traffic velocity.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#040507]/90 backdrop-blur-md py-8 px-4 text-center text-xs font-mono text-slate-500 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>niat.me Vanguard Engine &bull; Express + React + Tailwind</span>
          </div>
          <p className="text-slate-500 dark:text-slate-600">&copy; 2026 niat.me Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
