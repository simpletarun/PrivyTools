/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Layers, ShieldCheck, ListChecks, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'home' | 'tools' | 'privacy' | 'queue' | 'settings';
  onChangeTab: (tab: 'home' | 'tools' | 'privacy' | 'queue' | 'settings') => void;
  activeJobsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  activeJobsCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="flex items-center justify-around h-16 px-1">
        <button
          id="mobile-nav-home"
          onClick={() => onChangeTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Home</span>
        </button>

        <button
          id="mobile-nav-tools"
          onClick={() => onChangeTab('tools')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentTab === 'tools'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Tools</span>
        </button>

        <button
          id="mobile-nav-privacy"
          onClick={() => onChangeTab('privacy')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentTab === 'privacy'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Privacy</span>
        </button>

        <button
          id="mobile-nav-queue"
          onClick={() => onChangeTab('queue')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
            currentTab === 'queue'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ListChecks className="w-5 h-5 mb-1" />
            {activeJobsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {activeJobsCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Queue</span>
        </button>

        <button
          id="mobile-nav-settings"
          onClick={() => onChangeTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Settings</span>
        </button>
      </div>
    </nav>
  );
};
