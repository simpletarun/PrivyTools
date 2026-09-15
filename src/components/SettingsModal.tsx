/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppSettings } from '../types';
import { X, ShieldCheck, Moon, Sun, Lock, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="settings-modal-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Application Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure local processing parameters and privacy rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Privacy Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy & Storage Guarantees</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Strict Local-Only Processing
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Disallow any background network requests for all file manipulation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.localOnlyMode}
                  onChange={e => onUpdateSettings({ localOnlyMode: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-emerald-200/60 dark:border-emerald-800/30">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Automatic Session Memory Purge
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Immediately revoke blob URLs upon closing or tool change.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDeleteSession}
                  onChange={e => onUpdateSettings({ autoDeleteSession: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-emerald-200/60 dark:border-emerald-800/30">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Telemetry & Tracking Shield
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Completely block user behavior analytics.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.telemetryDisabled}
                  onChange={e => onUpdateSettings({ telemetryDisabled: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>

          {/* Processing Defaults */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Processing Defaults
            </h3>

            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Default Image Compression Quality</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{settings.defaultImageQuality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.defaultImageQuality}
                  onChange={e => onUpdateSettings({ defaultImageQuality: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <span className="font-bold block mb-1">PDF Engine Preset</span>
                <div className="flex gap-2">
                  {(['small', 'balanced', 'high'] as const).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdateSettings({ defaultPdfQuality: preset })}
                      className={`flex-1 py-1.5 rounded-xl font-bold capitalize border text-xs transition-colors ${
                        settings.defaultPdfQuality === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={onResetSettings}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
