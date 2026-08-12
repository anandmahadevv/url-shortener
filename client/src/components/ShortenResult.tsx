import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Sparkles, Clock, QrCode as QrIcon } from 'lucide-react';
import { QrCodeModal } from './QrCodeModal';

interface ShortenResultProps {
  result: {
    shortUrl: string;
    shortCode: string;
    longUrl: string;
    createdAt: string;
    expiresAt?: string | null;
    customAlias?: boolean;
  };
}

export const ShortenResult: React.FC<ShortenResultProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-emerald-500/10 p-1.5 rounded-[2rem] border border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-2xl backdrop-blur-xl animate-slide-up transition-colors duration-300">
      <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.375rem)] p-6 doppelrand-core relative overflow-hidden transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Short Link Provisioned
            </h3>
          </div>

          {result.customAlias && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Custom Alias
            </span>
          )}
        </div>

        {/* Short URL Result Display */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#040507] p-3 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden px-3">
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">
              {result.shortUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Generate & Customize QR Code"
            >
              <QrIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>QR Studio</span>
            </button>

            <button
              onClick={handleCopy}
              id="copy-short-url-btn"
              className="flex-1 sm:flex-initial flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-400 dark:hover:bg-emerald-300 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-md group"
            >
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              <div className="w-6 h-6 rounded-lg bg-slate-950/20 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </button>

            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl transition-colors"
              title="Test redirect"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </a>
          </div>
        </div>

        {/* QR Code Modal Popup */}
        {showQrModal && (
          <QrCodeModal
            shortUrl={result.shortUrl}
            shortCode={result.shortCode}
            onClose={() => setShowQrModal(false)}
          />
        )}

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 font-mono">
          <div className="truncate max-w-md">
            <span className="text-slate-400 dark:text-slate-500">Destination: </span>
            <span className="text-slate-700 dark:text-slate-300 truncate">{result.longUrl}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Base62 Code: <strong className="text-emerald-600 dark:text-emerald-400">{result.shortCode}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
