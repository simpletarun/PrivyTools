/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ALL_TOOLS } from '../data/tools';
import { Tool } from '../types';
import { ToolIcon } from './ToolIcon';
import { Search, X, Star, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool) => void;
  favorites: string[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  favorites,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = ALL_TOOLS.filter(t => {
    if (!query.trim()) return t.isPopular;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }).slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="search-modal-palette"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Input box */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200/80 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 100+ tools (e.g. compress, merge, watermark, gps, qr)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            {query.trim() ? `Matching Tools (${filtered.length})` : 'Suggested & Popular Tools'}
          </div>

          {filtered.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                onSelectTool(tool);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
            >
              <div className="flex items-center gap-3 truncate pr-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <ToolIcon name={tool.iconName} className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {tool.name}
                    </span>
                    {favorites.includes(tool.id) && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                    {tool.description}
                  </p>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                {tool.category}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No tools found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
