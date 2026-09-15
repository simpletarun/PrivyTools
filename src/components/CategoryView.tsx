/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tool, ToolCategory } from '../types';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';
import { ToolCard } from './ToolCard';
import { Search, Filter, Sparkles, ArrowLeft } from 'lucide-react';

interface CategoryViewProps {
  categoryId: string;
  onSelectTool: (tool: Tool) => void;
  onBackHome: () => void;
  favorites: string[];
  onToggleFavorite: (toolId: string, e: React.MouseEvent) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categoryId,
  onSelectTool,
  onBackHome,
  favorites,
  onToggleFavorite,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [filterImplementedOnly, setFilterImplementedOnly] = useState(false);

  const currentCategory = CATEGORIES.find(c => c.id === categoryId);
  const title = categoryId === 'favorites' ? 'Favorite Tools' : currentCategory ? currentCategory.label : 'All Tools';

  let categoryTools: Tool[] = [];
  if (categoryId === 'favorites') {
    categoryTools = ALL_TOOLS.filter(t => favorites.includes(t.id));
  } else if (categoryId === 'all') {
    categoryTools = ALL_TOOLS;
  } else {
    categoryTools = ALL_TOOLS.filter(t => t.category === categoryId);
  }

  // Filter with local search
  const displayedTools = categoryTools.filter(tool => {
    if (filterImplementedOnly && !tool.isImplemented) return false;
    if (!localSearch.trim()) return true;
    const q = localSearch.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div id="category-view" className="space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {categoryTools.length}
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Filter in ${title}...`}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-emerald-500"
            />
          </div>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterImplementedOnly}
              onChange={e => setFilterImplementedOnly(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Ready only</span>
          </label>
        </div>
      </div>

      {/* Grid of Tools */}
      {displayedTools.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No tools found matching your criteria.
          </p>
          {categoryId === 'favorites' && (
            <p className="text-xs text-slate-400 mt-1">
              Click the star icon on any tool card to add it to your favorites list!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {displayedTools.map(tool => (
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
    </div>
  );
};
