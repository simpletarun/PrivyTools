/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Search, Moon, Sun, Clock, ListChecks, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenQueue: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
  onOpenPrivacyCenter: () => void;
  onOpenAndroidModal: () => void;
  activeJobsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenQueue,
  onOpenHistory,
  onOpenSettings,
  onNavigateHome,
  onOpenPrivacyCenter,
  onOpenAndroidModal,
  activeJobsCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo"
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Privy<span className="text-emerald-600 dark:text-emerald-400">Tools</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden xs:block">
                Privacy-First File Utilities
              </p>
            </div>
          </button>

          {/* Offline/Local badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Local Engine</span>
          </div>
        </div>

        {/* Center Quick Search bar */}
        <button
          id="global-search-trigger"
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-sm transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="font-normal text-slate-500 dark:text-slate-400">
              Search 100+ PDF, image & privacy tools...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
            /
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            id="mobile-search-btn"
            aria-label="Search tools"
            onClick={onOpenSearch}
            className="sm:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Android App / APK Button */}
          <button
            id="nav-android-apk-btn"
            onClick={onOpenAndroidModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:scale-105"
            title="Install Android WebAPK or Generate .APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Android / APK</span>
          </button>

          {/* Privacy Center Button */}
          <button
            id="nav-privacy-center-btn"
            onClick={onOpenPrivacyCenter}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Center</span>
          </button>

          {/* Queue Button */}
          <button
            id="nav-queue-btn"
            aria-label="Processing Queue"
            onClick={onOpenQueue}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Processing Queue"
          >
            <ListChecks className="w-5 h-5" />
            {activeJobsCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {activeJobsCount}
              </span>
            )}
          </button>

          {/* History Button */}
          <button
            id="nav-history-btn"
            aria-label="History"
            onClick={onOpenHistory}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden xs:flex"
            title="Local History"
          >
            <Clock className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            id="nav-theme-toggle-btn"
            aria-label="Toggle dark mode"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Settings Button */}
          <button
            id="nav-settings-btn"
            aria-label="Settings"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Settings & Privacy Controls"
          >
            <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
