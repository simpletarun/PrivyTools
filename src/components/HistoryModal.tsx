/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryRecord } from '../types';
import { X, Clock, Trash2, ShieldCheck, HardDrive } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const totalFiles = history.reduce((acc, h) => acc + h.fileCount, 0);
  const totalSavedBytes = history.reduce((acc, h) => {
    if (h.bytesOriginal > h.bytesProcessed) {
      return acc + (h.bytesOriginal - h.bytesProcessed);
    }
    return acc;
  }, 0);

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="history-modal-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Local Activity History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved strictly in your browser storage. Zero tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="px-2">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Processed Files</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-100">{totalFiles}</span>
          </div>
          <div className="px-2">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Saved</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatBytes(totalSavedBytes)}</span>
          </div>
        </div>

        {/* Records list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-semibold">No history recorded yet</p>
              <p className="text-xs mt-1">Processed files will show local savings metrics here.</p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {item.toolName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.summary}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
          {history.length > 0 ? (
            <button
              id="clear-history-btn"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
