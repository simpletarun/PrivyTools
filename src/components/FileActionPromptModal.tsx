/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tool } from '../types';
import { ALL_TOOLS } from '../data/tools';
import { ToolIcon } from './ToolIcon';
import { X, FileText, Image as ImageIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface FileActionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  onSelectToolWithFiles: (tool: Tool, files: File[]) => void;
}

export const FileActionPromptModal: React.FC<FileActionPromptModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectToolWithFiles,
}) => {
  if (!isOpen || files.length === 0) return null;

  const isAllPdf = files.every(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  const isAllImage = files.every(f => f.type.startsWith('image/'));

  // Recommend best tools based on file types
  let suggestedIds: string[] = [];
  if (isAllPdf) {
    if (files.length > 1) {
      suggestedIds = ['merge-pdf', 'jpg-to-pdf', 'pdf-metadata-cleaner', 'split-pdf'];
    } else {
      suggestedIds = ['compress-pdf', 'split-pdf', 'rotate-pdf', 'add-watermark', 'pdf-metadata-cleaner', 'privacy-scanner'];
    }
  } else if (isAllImage) {
    if (files.length > 1) {
      suggestedIds = ['batch-image-compressor', 'jpg-to-pdf', 'exif-remover', 'batch-rename'];
    } else {
      suggestedIds = ['image-compressor', 'jpg-to-webp', 'exif-remover', 'image-resize', 'privacy-scanner'];
    }
  } else {
    suggestedIds = ['privacy-scanner', 'file-hash-generator', 'duplicate-file-finder', 'batch-rename'];
  }

  const suggestedTools = ALL_TOOLS.filter(t => suggestedIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="file-action-prompt-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Files Detected</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Select an action for {files.length} file{files.length > 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {suggestedTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onSelectToolWithFiles(tool, files)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 transition-colors shadow-2xs">
                  <ToolIcon name={tool.iconName} className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
