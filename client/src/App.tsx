import React, { useState, useEffect } from 'react';
import { ShortenForm } from './components/ShortenForm';
import { ShortenResult } from './components/ShortenResult';
import { UrlList } from './components/UrlList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import { ThemeSwitcher, ThemeMode } from './components/ThemeSwitcher';
import { AuthModal } from './components/AuthModal';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { Zap, Cpu, Link2, BarChart2, Sparkles, Terminal, User as UserIcon, LogOut, LogIn, Key, ShieldCheck } from 'lucide-react';

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

interface LocalUser {
  id: string;
  email: string;
  name?: string;
}

const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function App() {
  const [activeTab, setActiveTab] = useState<'shortener' | 'analytics' | 'api'>('shortener');
  const [currentResult, setCurrentResult] = useState<UrlItem | null>(null);
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showLocalAuthModal, setShowLocalAuthModal] = useState(false);
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | undefined>(undefined);

  // Clerk Auth Hooks (safely handled if Clerk is disabled)
  let clerkUser: any = null;
  let clerkAuth: any = null;
  try {
    if (CLERK_ENABLED) {
      clerkUser = useUser();
      clerkAuth = useAuth();
    }
  } catch (err) {
    // Fallback if not inside ClerkProvider
  }

  const isSignedIn = CLERK_ENABLED ? (clerkUser?.isSignedIn ?? false) : Boolean(localUser);
  const activeUserEmail = CLERK_ENABLED
    ? (clerkUser?.user?.primaryEmailAddress?.emailAddress || clerkUser?.user?.fullName || 'User')
    : (localUser?.name || localUser?.email.split('@')[0] || 'User');

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

  // Fetch logged-in user links
  useEffect(() => {
    const loadUserUrls = async () => {
      if (CLERK_ENABLED && clerkUser?.isSignedIn && clerkAuth?.getToken) {
        try {
          const token = await clerkAuth.getToken();
          if (token) {
            fetchUserUrls(token);
            return;
          }
        } catch (err) {
          console.error('Error fetching Clerk token', err);
        }
      }

      const token = localStorage.getItem('swift_token');
      if (token) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setLocalUser(data.user);
              fetchUserUrls(token);
            } else {
              localStorage.removeItem('swift_token');
              loadLocalUrls();
            }
          })
          .catch(() => {
            localStorage.removeItem('swift_token');
            loadLocalUrls();
          });
      } else {
        loadLocalUrls();
      }
    };

    loadUserUrls();
  }, [clerkUser?.isSignedIn]);

  const loadLocalUrls = () => {
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
  };

  const fetchUserUrls = async (token: string) => {
    try {
      const res = await fetch('/api/user/urls', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Failed to fetch user URLs', err);
    }
  };

  const refreshAllStats = async (items: UrlItem[]) => {
    try {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(`/api/stats/${item.shortCode}`);
            if (res.ok) {
              const text = await res.text();
              try {
                const data = JSON.parse(text);
                return {
                  ...item,
                  shortUrl: data.shortUrl || item.shortUrl,
                  clickCount: data.clickCount
                };
              } catch {
                // ignore
              }
            }
          } catch (err) {
            // retain existing
          }
          return item;
        })
      );

      setUrls(updated);
      if (!isSignedIn) {
        localStorage.setItem('swift_urls', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to refresh stats', err);
    }
  };

  const handleShortenSuccess = (newUrl: UrlItem) => {
    setCurrentResult(newUrl);

    setUrls((prev) => {
      const filtered = prev.filter((u) => u.shortCode !== newUrl.shortCode);
      const nextList = [newUrl, ...filtered];
      if (!isSignedIn) {
        localStorage.setItem('swift_urls', JSON.stringify(nextList));
      }
      return nextList;
    });
  };

  const handleLocalAuthSuccess = (user: LocalUser, token: string) => {
    localStorage.setItem('swift_token', token);
    setLocalUser(user);
    fetchUserUrls(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('swift_token');
    setLocalUser(null);
    loadLocalUrls();
  };

  const handleDeleteUrl = async (shortCode: string) => {
    let token = localStorage.getItem('swift_token');
    if (CLERK_ENABLED && clerkAuth?.getToken) {
      try {
        const clerkToken = await clerkAuth.getToken();
        if (clerkToken) token = clerkToken;
      } catch (err) {
        // fallback to local token
      }
    }

    if (!token) return;

    try {
      const res = await fetch(`/api/urls/${shortCode}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUrls((prev) => prev.filter((u) => u.shortCode !== shortCode));
      }
    } catch (err) {
      console.error('Failed to delete URL', err);
    }
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
    <div className="min-h-screen bg-ethereal-mesh text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300 font-sans">
      {/* Floating Glass Navbar */}
      <div className="pt-6 px-4">
        <header className="max-w-4xl mx-auto bg-white/90 dark:bg-[#111726]/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-full p-2 px-4 sm:px-6 flex items-center justify-between shadow-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">SwiftURL</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">niat.me</span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('shortener')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'shortener'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold shadow-md'
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
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold shadow-md'
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
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* User Profile / Auth Section */}
            {CLERK_ENABLED ? (
              <>
                <SignedIn>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-semibold">
                      {activeUserEmail}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-sm">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Clerk Sign In</span>
                    </button>
                  </SignInButton>
                </SignedOut>
              </>
            ) : (
              <>
                {localUser ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-semibold">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{activeUserEmail}</span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLocalAuthModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </>
            )}

            <ThemeSwitcher themeMode={themeMode} onChangeTheme={setThemeMode} />
          </div>
        </header>
      </div>

      {/* Local Auth Modal Popup */}
      {showLocalAuthModal && (
        <AuthModal
          onClose={() => setShowLocalAuthModal(false)}
          onAuthSuccess={handleLocalAuthSuccess}
        />
      )}

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-10 pb-24 flex-grow">
        {activeTab === 'shortener' && (
          <div className="space-y-10 animate-slide-up">
            
            {/* Hero Header Banner */}
            <div className="text-center space-y-4 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {CLERK_ENABLED ? 'Clerk Enterprise Auth Activated' : 'SwiftURL Engine &bull; Redis Hot Cache &bull; Postgres DB'}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                High-Performance <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  URL Shortener & Telemetry
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
                Fast, deterministic Base62 short links, dual-layer caching, non-blocking click telemetry, and dynamic QR Studio.
              </p>

              {/* Clerk Key Setup Notice (shown if key not yet added) */}
              {!CLERK_ENABLED && (
                <div className="max-w-xl mx-auto mt-4 bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Key className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>To activate <strong>Clerk Auth</strong>, add <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code> in your <code>.env</code> file.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Shorten Form */}
            <ShortenForm onShortenSuccess={handleShortenSuccess} />

            {/* Shorten Result Display */}
            {currentResult && <ShortenResult result={currentResult} />}

            {/* Metric Architecture Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white dark:bg-[#111726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Provisioned Links</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{urls.length}</span>
              </div>

              <div className="bg-white dark:bg-[#111726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Click Telemetry</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{totalClicks}</span>
              </div>

              <div className="bg-white dark:bg-[#111726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Auth Engine</span>
                <span className="text-sm font-bold font-sans text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {CLERK_ENABLED ? 'Clerk SSO' : 'JWT / Local'}
                </span>
              </div>

              <div className="bg-white dark:bg-[#111726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Caching Layer</span>
                <span className="text-sm font-bold font-sans text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Redis Hot
                </span>
              </div>
            </div>

            {/* List of Shortened URLs */}
            <UrlList
              urls={urls}
              onRefreshStats={() => {
                if (CLERK_ENABLED && clerkAuth?.getToken) {
                  clerkAuth.getToken().then((token: string) => fetchUserUrls(token));
                } else {
                  refreshAllStats(urls);
                }
              }}
              onDeleteUrl={isSignedIn ? handleDeleteUrl : undefined}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* API Specs Tab */}
        {activeTab === 'api' && (
          <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#111726] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-slide-up transition-colors">
            <div className="space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  REST API Interface Specification
                </h2>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                  Clerk & JWT Ready
                </span>
              </div>

              {/* Endpoint 1 */}
              <div className="bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-mono">POST</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/shorten</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Shortens a long URL using Base62 encoding of auto-incrementing DB id.</p>
                <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto">
{`{
  "longUrl": "https://example.com/page",
  "customAlias": "my-alias", // Optional
  "expiresAt": "2026-12-31T23:59:59Z" // Optional
}`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 font-mono">GET</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/:shortCode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Resolves short code via Redis cache & Postgres, returning HTTP 301 Permanent Redirect.</p>
              </div>

              {/* Endpoint 3 */}
              <div className="bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-mono">GET</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/stats/:shortCode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Returns click count, creation timestamp, expiration, and original URL.</p>
              </div>

              {/* Endpoint 4 */}
              <div className="bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
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
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f19]/90 backdrop-blur-md py-6 px-4 text-center text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>SwiftURL Infrastructure &bull; Express + React + Clerk Auth</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">&copy; 2026 SwiftURL / niat.me Engine.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
