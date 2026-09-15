/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIES } from '../data/tools';
import { ToolCategory } from '../types';
import {
  Home,
  FileText,
  Image as ImageIcon,
  Shield,
  BookOpen,
  Wrench,
  Star,
  ShieldCheck,
  ListChecks,
  Lock,
  Grid,
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  favoritesCount: number;
  onViewFavorites: () => void;
  onOpenPrivacyCenter: () => void;
  onOpenQueue: () => void;
  activeJobsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  onViewFavorites,
  onOpenPrivacyCenter,
  onOpenQueue,
  activeJobsCount,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'all': return <Grid className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'privacy': return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'document': return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'utility': return <Wrench className="w-4 h-4 text-purple-500" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between py-6 px-4 bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/80 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Categories
          </div>
          <nav className="space-y-1">
            <button
              id="sidebar-cat-home"
              onClick={() => onSelectCategory('home')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'home'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4" />
                <span>Home Dashboard</span>
              </div>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`sidebar-cat-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(cat.id)}
                    <span>{cat.label}</span>
                  </div>
                  {'count' in cat && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Features Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Workspaces
          </div>
          <nav className="space-y-1">
            <button
              id="sidebar-favorites-btn"
              onClick={onViewFavorites}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'favorites'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Favorites</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {favoritesCount}
              </span>
            </button>

            <button
              id="sidebar-privacy-center-btn"
              onClick={onOpenPrivacyCenter}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'privacy-center'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Privacy Center</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Audit
              </span>
            </button>

            <button
              id="sidebar-queue-btn"
              onClick={onOpenQueue}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <ListChecks className="w-4 h-4" />
                <span>Batch Queue</span>
              </div>
              {activeJobsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  {activeJobsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Local Guarantee Card */}
      <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero Server Uploads</span>
        </div>
        <p className="text-emerald-950/70 dark:text-emerald-400/80 text-[11px] leading-relaxed">
          Files are processed entirely in your device's browser memory. Your documents never leave your hands.
        </p>
      </div>
    </aside>
  );
};
