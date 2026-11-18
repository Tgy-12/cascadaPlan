import React from 'react';
import { AppTheme } from '../types';
import { PomodoroTimer } from './PomodoroTimer';
import {
  Layers,
  Clock,
  Sparkles,
  Download,
  Heart,
  Palette,
  Terminal,
  Laptop,
  Check,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'cascade' | 'daily';
  onChangeView: (view: 'cascade' | 'daily') => void;
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  onOpenQuickAdd: () => void;
  onOpenBackup: () => void;
  onOpenSupport: () => void;
  isExtensionPopup?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  currentTheme,
  onChangeTheme,
  onOpenQuickAdd,
  onOpenBackup,
  onOpenSupport,
  isExtensionPopup = false,
}) => {
  const themes: { id: AppTheme; label: string; badge: string; color: string }[] = [
    { id: 'ubuntu-dark', label: 'Ubuntu Yaru Dark', badge: 'Aubergine/Orange', color: '#E95420' },
    { id: 'dracula', label: 'Dracula', badge: 'Purple/Pink', color: '#bd93f9' },
    { id: 'nord', label: 'Nord', badge: 'Polar Frost', color: '#88c0d0' },
    { id: 'clean-light', label: 'Clean Light', badge: 'Modern Slate', color: '#2563eb' },
  ];

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#77216F] to-[#E95420] flex items-center justify-center text-white shadow-md font-extrabold text-lg select-none ring-1 ring-white/20">
            CP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight">CascadePlan</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]">
                v1.0 • Offline-First
              </span>
            </div>
            {!isExtensionPopup && (
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                8-Horizon Cascading Goals & Daily Pomodoro for Linux Developers
              </p>
            )}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          <button
            onClick={() => onChangeView('cascade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'cascade'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>8-Horizon Cascade</span>
          </button>

          <button
            onClick={() => onChangeView('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'daily'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Action & Focus</span>
          </button>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2">
          {/* Quick Add Pill */}
          <button
            onClick={onOpenQuickAdd}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-main)] flex items-center gap-1.5 transition-colors shadow-sm"
            title="Quick Add Goal or Action (Ctrl+K)"
          >
            <span className="font-mono text-[10px] text-[var(--accent-primary)] font-bold">
              Ctrl+K
            </span>
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative group">
            <button
              className="p-2 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 text-xs"
              title="Change Linux Theme"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden lg:inline capitalize">
                {currentTheme.replace('-', ' ')}
              </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-xl hidden group-hover:block hover:block z-50">
              <div className="text-[10px] font-bold text-[var(--text-muted)] px-2 py-1 uppercase tracking-wider">
                Linux Themes
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTheme(t.id)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg text-left flex items-center justify-between transition-colors ${
                    currentTheme === t.id
                      ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/30"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.label}</span>
                  </div>
                  {currentTheme === t.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Data Portability / Backup */}
          <button
            onClick={onOpenBackup}
            className="p-2 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title="Export / Import JSON & Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Support / Tip Jar */}
          <button
            onClick={onOpenSupport}
            className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)] text-[var(--accent-primary)] hover:text-white border border-[var(--accent-primary)]/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Support Project (Telebirr, CBE, Payoneer, Crypto)"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Support</span>
          </button>
        </div>
      </div>
    </header>
  );
};
