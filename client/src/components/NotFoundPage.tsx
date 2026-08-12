import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  shortCode?: string;
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ shortCode, onGoHome }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#131416] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden transition-colors">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">Resource Expired or Missing</h1>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">
          {shortCode ? (
            <>Short key <code className="bg-slate-100 dark:bg-[#0a0a0c] px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">{shortCode}</code> is invalid or has passed its set expiration date.</>
          ) : (
            'The requested short key could not be located in the database.'
          )}
        </p>

        <button
          onClick={onGoHome}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
