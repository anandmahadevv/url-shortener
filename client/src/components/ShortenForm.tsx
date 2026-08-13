import React, { useState } from 'react';
import { Link2, Sparkles, Calendar, Tag, AlertCircle, ArrowUpRight, Zap, Database } from 'lucide-react';

interface ShortenFormProps {
  onShortenSuccess: (result: any) => void;
}

export const ShortenForm: React.FC<ShortenFormProps> = ({ onShortenSuccess }) => {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!longUrl.trim()) {
      setError('Please enter a valid destination URL.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('swift_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          longUrl: longUrl.trim(),
          customAlias: customAlias.trim() || undefined,
          expiresAt: expiresAt || undefined
        })
      });

      let data: any = {};
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: responseText || `HTTP ${response.status}: Server response was empty or non-JSON.` };
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to shorten URL`);
      }

      onShortenSuccess(data);
      setLongUrl('');
      setCustomAlias('');
      setExpiresAt('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while shortening the URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#111726] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-black/40 animate-slide-up transition-colors duration-300">
      {/* Top Status Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Engine Ready
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 font-medium"><Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Redis Hot</span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="flex items-center gap-1.5 font-medium"><Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Postgres</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="longUrl" className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Destination URL</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold lowercase">* required</span>
          </label>

          <div className="relative flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#0b0f19] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
            <div className="pl-4 text-slate-400 pointer-events-none">
              <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <input
              id="longUrl"
              type="url"
              placeholder="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
              className="w-full pl-3 pr-4 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm sm:text-base font-sans font-medium"
            />
          </div>
        </div>

        {/* Toggle Custom Options Accordion */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showAdvanced ? '[-] Hide Custom Parameters' : '[+] Custom Alias & Expiration Rules'}
          </button>
        </div>

        {/* Advanced Inputs */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
            <div>
              <label htmlFor="customAlias" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Custom Alias (Optional)
              </label>
              <input
                id="customAlias"
                type="text"
                placeholder="e.g. my-custom-alias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#0b0f19] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-mono transition-all"
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Expiration Rule (Optional)
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#0b0f19] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-sans transition-all"
              />
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-sans text-sm font-bold uppercase tracking-wider flex items-center justify-between shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer group"
        >
          <span>{loading ? 'Provisioning Base62 Code...' : 'Shorten URL Now'}</span>
          
          <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </div>
        </button>
      </form>
    </div>
  );
};
