import React, { useState } from 'react';
import { Link2, Sparkles, Calendar, Tag, AlertCircle, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

interface ShortenFormProps {
  onShortenSuccess: (result: any) => void;
}

export const ShortenForm: React.FC<ShortenFormProps> = ({ onShortenSuccess }) => {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samplePresets = [
    { label: 'GitHub Repository', url: 'https://github.com/anandmahadevv/url-shortener' },
    { label: 'React Documentation', url: 'https://react.dev/reference/react' },
    { label: 'Vite Ecosystem', url: 'https://vite.dev/guide/' }
  ];

  const isValidProtocol = longUrl.trim().startsWith('http://') || longUrl.trim().startsWith('https://');

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

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: 'Invalid server response.' };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      onShortenSuccess(data);
      setLongUrl('');
      setCustomAlias('');
      setExpiresAt('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/90 dark:bg-[#111726]/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/50 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        
        {/* Main URL Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="longUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Destination URL
            </label>

            {longUrl.trim().length > 0 && (
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                isValidProtocol ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isValidProtocol ? 'Valid Protocol' : 'Requires http:// or https://'}
              </span>
            )}
          </div>

          <div className="relative flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 transition-all">
            <Link2 className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-4 shrink-0" />
            <input
              id="longUrl"
              type="text"
              placeholder="https://example.com/very/long/url/link"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="w-full px-4 py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-sans font-medium"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500" /> Presets:
            </span>
            {samplePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setLongUrl(preset.url)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Option Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Custom Alias Input */}
          <div>
            <label htmlFor="customAlias" className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Custom Alias (Optional)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 transition-all font-mono text-xs">
              <span className="pl-4 text-slate-400 dark:text-slate-500 select-none">niat.me/</span>
              <input
                id="customAlias"
                type="text"
                placeholder="my-custom-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full pr-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Expiration Date Input */}
          <div>
            <label htmlFor="expiresAt" className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Link Expiration (Optional)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 transition-all">
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs font-sans"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Shorten URL</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
