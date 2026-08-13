import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Sparkles, Clock, QrCode as QrIcon, Globe } from 'lucide-react';
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
  onShowToast?: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShortenResult: React.FC<ShortenResultProps> = ({ result, onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      if (onShowToast) onShowToast('Branded Link Copied', result.shortUrl);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-blue-500/40 shadow-xl shadow-blue-500/10 animate-slide-up transition-all font-sans relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 font-display">
            Branded URL Active
          </h3>
        </div>

        {result.customAlias ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Custom Keyword
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Base62 Encoded
          </span>
        )}
      </div>

      {/* Short URL Result Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="flex items-center gap-3 overflow-hidden px-2">
          <span className="text-base sm:text-lg font-bold font-mono text-blue-700 dark:text-blue-300 truncate">
            {result.shortUrl}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            title="Generate & Customize QR Code"
          >
            <QrIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>QR Studio</span>
          </button>

          <button
            onClick={handleCopy}
            id="copy-short-url-btn"
            className="flex-1 sm:flex-initial flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0B63E5] dark:bg-blue-600 hover:bg-[#0252CD] dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/20 group"
          >
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            <div className="w-5 h-5 rounded-md bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </div>
          </button>

          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 rounded-xl transition-colors"
            title="Test redirect"
          >
            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </a>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <QrCodeModal
          shortUrl={result.shortUrl}
          shortCode={result.shortCode}
          onClose={() => setShowQrModal(false)}
          onShowToast={onShowToast}
        />
      )}

      {/* Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2 font-sans font-medium">
        <div className="truncate max-w-md">
          <span className="text-slate-500 dark:text-slate-400">Destination: </span>
          <span className="text-slate-900 dark:text-slate-200 font-mono truncate">{result.longUrl}</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Key: <strong className="text-blue-700 dark:text-blue-400 font-bold">{result.shortCode}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
