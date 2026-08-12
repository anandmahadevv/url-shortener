import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeMode, onChangeTheme }) => {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#050608] p-1 rounded-full border border-slate-200 dark:border-white/10 text-xs font-mono">
      <button
        onClick={() => onChangeTheme('light')}
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
          themeMode === 'light'
            ? 'bg-white text-slate-900 font-bold shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="White / Light Theme"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline text-[11px]">Light</span>
      </button>

      <button
        onClick={() => onChangeTheme('dark')}
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
          themeMode === 'dark'
            ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark OLED Theme"
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400 dark:text-slate-950" />
        <span className="hidden sm:inline text-[11px]">Dark</span>
      </button>

      <button
        onClick={() => onChangeTheme('system')}
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
          themeMode === 'system'
            ? 'bg-slate-800 text-slate-100 font-bold shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Match OS System Theme"
      >
        <Monitor className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        <span className="hidden sm:inline text-[11px]">System</span>
      </button>
    </div>
  );
};
