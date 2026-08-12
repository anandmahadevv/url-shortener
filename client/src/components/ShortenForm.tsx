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
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        data = { error: responseText || 'Server returned an unparseable response.' };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
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
    /* Doppelrand Outer Shell */
    <div className="w-full max-w-3xl mx-auto bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 sm:p-2 rounded-[2rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl backdrop-blur-xl animate-slide-up transition-colors duration-300">
      {/* Doppelrand Inner Core */}
      <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2rem-0.5rem)] p-6 sm:p-8 doppelrand-core relative overflow-hidden transition-colors duration-300">
        {/* Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & Eyebrow Badge */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full px-3.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Engine Ready
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Redis</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Postgres</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-200 px-4 py-3 rounded-2xl text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="longUrl" className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2.5 flex items-center justify-between">
              <span>Target Destination URL</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] lowercase font-normal">* required</span>
            </label>

            {/* Doppelrand Nested Input Container */}
            <div className="bg-slate-100/80 dark:bg-white/[0.02] p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all ease-vanguard">
              <div className="relative flex items-center bg-[#f8fafc] dark:bg-[#050608] rounded-[calc(1rem-0.25rem)]">
                <div className="pl-4 text-slate-400 pointer-events-none">
                  <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <input
                  id="longUrl"
                  type="text"
                  placeholder="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  required
                  className="w-full pl-3 pr-4 py-3.5 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-mono text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Toggle Parameter Accordion */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAdvanced ? '[-] Hide Custom Parameters' : '[+] Custom Alias & Expiration Rules'}
            </button>
          </div>

          {/* Advanced Inputs */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-white/10 animate-slide-up">
              <div>
                <label htmlFor="customAlias" className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Custom Alias (Optional)
                </label>
                <div className="bg-slate-100/80 dark:bg-white/[0.02] p-1 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-emerald-500">
                  <input
                    id="customAlias"
                    type="text"
                    placeholder="e.g. custom-link-v1"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-[#050608] rounded-[calc(0.75rem-0.25rem)] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="expiresAt" className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Expiration Rule (Optional)
                </label>
                <div className="bg-slate-100/80 dark:bg-white/[0.02] p-1 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-emerald-500">
                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-[#050608] rounded-[calc(0.75rem-0.25rem)] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Island Button-in-Button CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full p-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] transition-all ease-vanguard group cursor-pointer shadow-lg shadow-emerald-500/10 focus:outline-none"
          >
            <div className="w-full py-3 px-6 rounded-full bg-slate-900 dark:bg-[#050608] flex items-center justify-between text-slate-100 font-mono text-xs font-bold uppercase tracking-wider group-hover:bg-slate-800 dark:group-hover:bg-[#08090d] transition-colors">
              <span>{loading ? 'Provisioning Base62 Code...' : 'Generate Short Link'}</span>
              
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all ease-vanguard shrink-0">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};
