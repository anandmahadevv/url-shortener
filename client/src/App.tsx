import React, { useState, useEffect, useCallback } from 'react';
import { ShortenForm } from './components/ShortenForm';
import { ShortenResult } from './components/ShortenResult';
import { UrlList } from './components/UrlList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import { ThemeSwitcher, ThemeMode } from './components/ThemeSwitcher';
import { ToastContainer, ToastMessage } from './components/Toast';
import { MinimalAd } from './components/MinimalAd';
import { Zap, Cpu, Link2, BarChart2, Sparkles, Terminal, Globe, Tag } from 'lucide-react';

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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | undefined>(undefined);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  // Fetch recent URLs
  useEffect(() => {
    const fetchRecentUrls = async () => {
      try {
        const res = await fetch('/api/urls');
        if (res.ok) {
          const data = await res.json();
          setUrls(data);
        }
      } catch (err) {
        console.error('Failed to fetch recent URLs', err);
      }
    };

    fetchRecentUrls();
  }, []);

  const refreshAllStats = async () => {
    try {
      const res = await fetch('/api/urls');
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Failed to refresh stats', err);
    }
  };

  const handleShortenSuccess = (newUrl: UrlItem) => {
    setCurrentResult(newUrl);
    showToast('Branded Link Created', newUrl.shortUrl, 'success');
    setUrls((prev) => {
      const filtered = prev.filter((u) => u.shortCode !== newUrl.shortCode);
      return [newUrl, ...filtered];
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
    <div className="min-h-screen bg-ethereal-mesh text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white transition-colors duration-300 font-sans relative">
      
      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Rebrandly Glass Navbar */}
      <div className="pt-6 px-4">
        <header className="max-w-4xl mx-auto bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-full p-2 px-4 sm:px-6 flex items-center justify-between shadow-xl shadow-blue-900/5 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0B63E5] flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight font-display">Rebrandly</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">niat.me</span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0a0e1a] p-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('shortener')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'shortener'
                  ? 'bg-[#0B63E5] text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Shortener</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-[#0B63E5] text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'bg-[#0B63E5] text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">API Specs</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher themeMode={themeMode} onChangeTheme={setThemeMode} />
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-10 pb-24 flex-grow">
        {activeTab === 'shortener' && (
          <div className="space-y-10 animate-slide-up">
            
            {/* Rebrandly Hero Header Banner */}
            <div className="text-center space-y-4 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Rebrandly UI &bull; Custom Branded Links &bull; Live Telemetry
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                Your Brand on Every <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Link You Share
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
                Create, shorten, tag, and track custom branded URLs with enterprise-grade Base62 performance and dynamic QR Studio.
              </p>
            </div>

            {/* Main Shorten Form */}
            <ShortenForm onShortenSuccess={handleShortenSuccess} />

            {/* Shorten Result Display */}
            {currentResult && <ShortenResult result={currentResult} onShowToast={showToast} />}

            {/* Rebrandly Architecture Feature Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Branded Links</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{urls.length}</span>
              </div>

              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Click Telemetry</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{totalClicks}</span>
              </div>

              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Domain Engine</span>
                <span className="text-sm font-bold font-sans text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" /> niat.me
                </span>
              </div>

              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Caching Layer</span>
                <span className="text-sm font-bold font-sans text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Redis Hot
                </span>
              </div>
            </div>

            {/* List of Shortened URLs */}
            <UrlList
              urls={urls}
              onRefreshStats={refreshAllStats}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard onShowToast={showToast} />}

        {/* API Specs Tab */}
        {activeTab === 'api' && (
          <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-slide-up transition-all">
            <div className="space-y-6 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Rebrandly REST API Specification
                </h2>
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                  v1.0 Public API
                </span>
              </div>

              {/* Endpoint 1 */}
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30 font-mono">POST</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/shorten</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Shortens a long URL using Base62 encoding of auto-incrementing DB id.</p>
                <pre className="text-xs font-mono bg-slate-900 text-blue-400 p-3 rounded-lg overflow-x-auto">
{`{
  "longUrl": "https://example.com/page",
  "customAlias": "my-brand", // Optional
  "expiresAt": "2026-12-31T23:59:59Z" // Optional
}`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 font-mono">GET</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/:shortCode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Resolves short code via Redis cache & Postgres, returning HTTP 301 Permanent Redirect.</p>
              </div>

              {/* Endpoint 3 */}
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-mono">GET</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/stats/:shortCode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Returns click count, creation timestamp, expiration, and original URL.</p>
              </div>

              {/* Endpoint 4 */}
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 font-mono">GET</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/analytics/overview</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Aggregates system-wide telemetry, device breakdown, and traffic velocity.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0e1a]/90 backdrop-blur-md py-6 px-4 text-center text-xs font-medium text-slate-600 dark:text-slate-400 transition-all">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Rebrandly Branded Links Engine &bull; Express + React + Tailwind</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">&copy; 2026 Rebrandly / niat.me Engine.</p>
        </div>
      </footer>

      {/* Minimal ad pop-up */}
      <MinimalAd />
    </div>
  );
}

export default App;
