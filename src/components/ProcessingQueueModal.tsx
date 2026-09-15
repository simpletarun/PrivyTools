/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProcessingJob } from '../types';
import { X, CheckCircle2, AlertCircle, RefreshCw, Trash2, Download } from 'lucide-react';

interface ProcessingQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: ProcessingJob[];
  onClearCompleted: () => void;
  onCancelJob: (jobId: string) => void;
}

export const ProcessingQueueModal: React.FC<ProcessingQueueModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onClearCompleted,
  onCancelJob,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="queue-modal-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Processing Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {jobs.filter(j => j.status === 'processing' || j.status === 'queued').length} active tasks running locally
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-semibold">Queue is currently empty</p>
              <p className="text-xs mt-1">Start any tool to monitor asynchronous batch jobs here.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div
                key={job.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {job.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {job.status === 'processing' && <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />}
                    {job.status === 'queued' && <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />}
                    {job.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}

                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {job.toolName}
                    </span>
                    <span className="text-slate-400 truncate">({job.fileName})</span>
                  </div>

                  <span className="capitalize font-semibold text-[11px] text-slate-500">
                    {job.status === 'completed' ? 'Complete' : job.status === 'processing' ? `${job.progress}%` : job.status}
                  </span>
                </div>

                {job.status === 'processing' && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-150"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}

                {job.status === 'completed' && job.resultUrl && (
                  <div className="flex justify-end pt-1">
                    <a
                      href={job.resultUrl}
                      download={job.resultFileName || 'output'}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {jobs.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex justify-between">
            <button
              onClick={onClearCompleted}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Clear Completed
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
