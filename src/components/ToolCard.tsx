/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tool } from '../types';
import { ToolIcon } from './ToolIcon';
import { Star, ShieldCheck, Lock } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onSelect: (tool: Tool) => void;
  onToggleFavorite: (toolId: string, e: React.MouseEvent) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={() => onSelect(tool)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 cursor-pointer text-left active:scale-[0.99]"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <ToolIcon name={tool.iconName} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
              <Lock className="w-2.5 h-2.5" />
              Local
            </span>

            <button
              id={`fav-btn-${tool.id}`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(e) => onToggleFavorite(tool.id, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="capitalize font-medium text-slate-500 dark:text-slate-400">
          {tool.category}
        </span>
        <div className="flex items-center gap-1.5">
          {tool.isImplemented ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Ready
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
