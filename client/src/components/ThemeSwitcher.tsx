import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeMode, onChangeTheme }) => {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold">
      <button
        onClick={() => onChangeTheme('light')}
        className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
          themeMode === 'light'
            ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="White / Light Theme"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline text-xs">Light</span>
      </button>

      <button
        onClick={() => onChangeTheme('dark')}
        className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
          themeMode === 'dark'
            ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark OLED Theme"
      >
        <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-950" />
        <span className="hidden sm:inline text-xs">Dark</span>
      </button>

      <button
        onClick={() => onChangeTheme('system')}
        className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
          themeMode === 'system'
            ? 'bg-slate-800 text-white font-bold shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Match OS System Theme"
      >
        <Monitor className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        <span className="hidden sm:inline text-xs">System</span>
      </button>
    </div>
  );
};
