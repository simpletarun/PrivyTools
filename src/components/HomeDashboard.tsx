/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tool, ToolCategory } from '../types';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';
import { ToolCard } from './ToolCard';
import { UniversalDropZone } from './UniversalDropZone';
import {
  FileText,
  Image as ImageIcon,
  Shield,
  BookOpen,
  Wrench,
  Search,
  Star,
  Sparkles,
  Lock,
  ArrowRight,
  Filter,
  Smartphone,
  Download,
} from 'lucide-react';

interface HomeDashboardProps {
  onSelectTool: (tool: Tool) => void;
  onSelectCategory: (categoryId: string) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string, e: React.MouseEvent) => void;
  onFilesDropped: (files: File[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAndroidModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTool,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onFilesDropped,
  searchQuery,
  setSearchQuery,
  onOpenAndroidModal,
}) => {
  const popularTools = ALL_TOOLS.filter(t => t.isPopular);

  // Filter tools based on search query
  const filteredTools = ALL_TOOLS.filter(tool => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const categoryCards = [
    {
      id: 'pdf',
      name: 'PDF Tools',
      count: ALL_TOOLS.filter(t => t.category === 'pdf').length,
      icon: FileText,
      desc: 'Merge, split, compress, watermark, reorder, and secure PDFs.',
      color: 'from-rose-500/10 to-red-500/10 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'image',
      name: 'Image Tools',
      count: ALL_TOOLS.filter(t => t.category === 'image').length,
      icon: ImageIcon,
      desc: 'Compress, resize, rotate, crop, and convert to WebP, PNG, JPG.',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'privacy',
      name: 'Privacy Tools',
      count: ALL_TOOLS.filter(t => t.category === 'privacy').length,
      icon: Shield,
      desc: 'Strip EXIF, wipe GPS, audit privacy risks, and calculate cryptographic digests.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'document',
      name: 'Document Tools',
      count: ALL_TOOLS.filter(t => t.category === 'document').length,
      icon: BookOpen,
      desc: 'OCR reader, text extraction, Text/Markdown/CSV into PDF.',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'utility',
      name: 'Utilities',
      count: ALL_TOOLS.filter(t => t.category === 'utility').length,
      icon: Wrench,
      desc: 'Offline QR generator, Base64 encode, batch rename, duplicate finder.',
      color: 'from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-900/40 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div id="home-dashboard-view" className="space-y-8 pb-24">
      {/* Hero Search Section */}
      <div className="text-center max-w-2xl mx-auto pt-2 sm:pt-4 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Your Files. Your Tools. Your Privacy.</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          What do you want to do?
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Fast, local client-side processing for over 100 PDF, image, and privacy operations. Zero uploads.
        </p>

        {/* Big Search Input */}
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tools... (e.g. compress, metadata, convert, pdf, qr, hash)"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchQuery.trim() !== '' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span>Matching Tools ({filteredTools.length})</span>
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-emerald-600 font-medium"
            >
              Show all categories
            </button>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No tools match "{searchQuery}".
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for 'pdf', 'compress', 'exif', 'convert', or 'qr'.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={favorites.includes(tool.id)}
                  onSelect={onSelectTool}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* NORMAL DASHBOARD WHEN NO SEARCH ACTIVE */}
      {searchQuery.trim() === '' && (
        <>
          {/* Android App & APK Highlight Banner */}
          {onOpenAndroidModal && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Android App & APK Available
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      All Android Versions
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Install direct WebAPK or download packaging bundle for Android Studio & PWABuilder.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAndroidModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Get Android App / APK</span>
              </button>
            </div>
          )}

          {/* Category Cards Grid (PRD Section 9) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Browse by Category
              </h2>
              <span className="text-xs text-slate-400 font-medium">100+ Total Utilities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {categoryCards.map(cat => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    id={`cat-card-${cat.id}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`group p-4 sm:p-5 rounded-2xl border bg-gradient-to-br ${cat.color} bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all cursor-pointer text-left active:scale-[0.99]`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 shadow-2xs">
                        {cat.count} tools
                      </span>
                    </div>
                    <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Universal Drop Zone on Home */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Quick File Workspace
              </h2>
              <span className="text-xs text-slate-400 font-medium">Drop and pick any tool</span>
            </div>

            <UniversalDropZone
              onFilesSelected={onFilesDropped}
              label="Drop any file here to start"
              subLabel="Drop PDFs, images, or documents to automatically load compatible tools"
            />
          </section>

          {/* Popular / Pinned Tools (PRD Section 23) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Most Popular Tools
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory('all')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all 100+</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {popularTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={favorites.includes(tool.id)}
                  onSelect={onSelectTool}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
