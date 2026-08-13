import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Zap, Database, Globe, Heart, Shield } from 'lucide-react';

interface MockAd {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  poweredBy: string;
}

const MOCK_ADS: MockAd[] = [
  {
    id: 'redis',
    title: 'Redis Cache',
    description: 'Power your applications with Redis. Get sub-millisecond latency caching and reliable queuing.',
    link: 'https://redis.io',
    icon: (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/10 shrink-0">
        <Zap className="w-7 h-7 fill-white/10" />
      </div>
    ),
    poweredBy: 'Redis Sponsor'
  },
  {
    id: 'postgres',
    title: 'PostgreSQL DB',
    description: 'Deploy on the world\'s most trusted open-source database. Strong typing, robustness, and speed.',
    link: 'https://www.postgresql.org',
    icon: (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10 shrink-0">
        <Database className="w-7 h-7" />
      </div>
    ),
    poweredBy: 'Postgres Sponsor'
  },
  {
    id: 'vercel',
    title: 'Vercel Edge',
    description: 'Host your React frontend at the edge. Swift routing, preview deployments, and global CDN.',
    link: 'https://vercel.com',
    icon: (
      <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
        <Globe className="w-7 h-7 text-emerald-400" />
      </div>
    ),
    poweredBy: 'Vercel Sponsor'
  },
  {
    id: 'niat',
    title: 'NIAT Project',
    description: 'This URL shortener is powered by NIAT. Support open-source privacy tools for developers.',
    link: 'https://niat.me',
    icon: (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10 shrink-0">
        <Heart className="w-7 h-7 fill-slate-950/20" />
      </div>
    ),
    poweredBy: 'NIAT Community'
  },
  {
    id: 'security',
    title: 'Secure Telemetry',
    description: 'Worried about tracking? SwiftURL offers cookie-less, non-identifying click statistics.',
    link: '#',
    icon: (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/15 shrink-0">
        <Shield className="w-7 h-7 text-emerald-400" />
      </div>
    ),
    poweredBy: 'SwiftURL Privacy'
  }
];

export function MinimalAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [selectedAd, setSelectedAd] = useState<MockAd | null>(null);

  // Carbon Ads identifiers from Vite env variables
  const carbonServe = import.meta.env.VITE_CARBON_SERVE || '';
  const carbonPlacement = import.meta.env.VITE_CARBON_PLACEMENT || '';

  // Select a random mock ad on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_ADS.length);
    setSelectedAd(MOCK_ADS[randomIndex]);
  }, []);

  // Set visibility timer (3 seconds pop-up delay)
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('swift_ad_dismissed') === 'true';
    if (wasDismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Load Carbon Ads script dynamically if configured
  useEffect(() => {
    if (!isVisible || isDismissed) return;

    if (!carbonServe || !carbonPlacement) {
      setUseFallback(true);
      return;
    }

    const container = document.getElementById('carbon-ad-target');
    if (!container) return;

    const script = document.createElement('script');
    script.id = '_carbonads_js';
    script.src = `//cdn.carbonads.com/carbon.js?serve=${carbonServe}&placement=${carbonPlacement}`;
    script.async = true;

    script.onerror = () => {
      console.warn('Carbon Ads failed to load (possibly blocked). Loading custom fallback.');
      setUseFallback(true);
    };

    container.appendChild(script);

    // Safety timeout: If carbonads hasn't rendered in 1.5 seconds, use fallback
    const checkTimeout = setTimeout(() => {
      if (!document.getElementById('carbonads')) {
        console.info('Carbon Ads injection timed out. Using custom fallback.');
        setUseFallback(true);
      }
    }, 1500);

    return () => {
      clearTimeout(checkTimeout);
      const scriptEl = document.getElementById('_carbonads_js');
      if (scriptEl) scriptEl.remove();
      const adEl = document.getElementById('carbonads');
      if (adEl) adEl.remove();
    };
  }, [isVisible, isDismissed, carbonServe, carbonPlacement]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Smooth transition delay before hiding it completely
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('swift_ad_dismissed', 'true');
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 transition-all duration-500 ease-out-back ${
        isVisible
          ? 'transform translate-y-0 opacity-100'
          : 'transform translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 transition-colors">
        
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-10"
          title="Dismiss ad"
          aria-label="Close Ad"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Carbon Ads Script Target Container */}
        {!useFallback && carbonServe && carbonPlacement ? (
          <div id="carbon-ad-target" className="min-h-[120px] flex items-center justify-center">
            {/* The carbon script will inject "#carbonads" here */}
          </div>
        ) : (
          /* Custom Developer Fallback Ad */
          selectedAd && (
            <div className="flex flex-col gap-3 font-sans text-left">
              <a
                href={selectedAd.link}
                target="_blank"
                rel="noopener sponsored noreferrer"
                className="flex items-start gap-3 group focus:outline-none"
              >
                {selectedAd.icon}
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {selectedAd.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    {selectedAd.description}
                  </p>
                </div>
              </a>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                <span>ads via Carbon</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400/80 px-1.5 py-0.5 rounded">
                  {selectedAd.poweredBy}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
export default MinimalAd;
