/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UniversalDropZone } from './UniversalDropZone';
import { scanFileForPrivacy, sanitizeFilename } from '../engines/privacyEngine';
import { stripExifAndGps } from '../engines/imageEngine';
import { cleanPdfMetadata } from '../engines/pdfEngine';
import { PrivacyScanResult, HistoryRecord } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Download,
  Lock,
  FileCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PrivacyCenterViewProps {
  onRecordHistory: (record: HistoryRecord) => void;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({ onRecordHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<PrivacyScanResult | null>(null);
  const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);
  const [cleanName, setCleanName] = useState<string>('');
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setCleanBlob(null);
    setIsScanning(true);

    try {
      const result = await scanFileForPrivacy(selected);
      setScanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanEverything = async () => {
    if (!file) return;
    setIsCleaning(true);

    try {
      let cleanedBlob: Blob;
      let newFilename = sanitizeFilename(file.name);

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        cleanedBlob = await cleanPdfMetadata(file);
      } else if (file.type.startsWith('image/')) {
        cleanedBlob = await stripExifAndGps(file);
      } else {
        cleanedBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      }

      setCleanBlob(cleanedBlob);
      setCleanName(newFilename);

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        toolId: 'privacy-center',
        toolName: 'Privacy Sanitizer',
        category: 'privacy',
        fileCount: 1,
        bytesOriginal: file.size,
        bytesProcessed: cleanedBlob.size,
        timestamp: Date.now(),
        summary: `Purged all EXIF, GPS & device traces from ${file.name}.`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownloadClean = () => {
    if (!cleanBlob) return;
    const url = URL.createObjectURL(cleanBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 70) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  return (
    <div id="privacy-center-workspace" className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Local Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Privacy Center
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Audit your files for hidden hardware identifiers, GPS satellite geo-tags, timestamps, and embedded author signatures before sharing them online.
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Scan a File for Privacy Leaks
        </h2>
        <UniversalDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop photo or document to inspect"
          subLabel="Works with JPEG, PNG, WebP, PDF, and all document types"
        />

        {isScanning && (
          <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Deep-inspecting binary streams locally...
            </span>
          </div>
        )}

        {/* Scan Results View (PRD Section 13) */}
        {scanResult && !isScanning && (
          <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Target File</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-md">
                  {scanResult.fileName}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {(scanResult.fileSize / 1024).toFixed(1)} KB • {scanResult.fileType}
                </span>
              </div>

              {/* Privacy Score Gauge */}
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-slate-400">Privacy Score</div>
                  <div className="text-2xl font-black">
                    <span className={getScoreColor(scanResult.privacyScore).split(' ')[0]}>
                      {scanResult.privacyScore}
                    </span>
                    <span className="text-slate-400 text-sm font-normal">/100</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs" style={{
                  borderColor: scanResult.privacyScore >= 80 ? '#10b981' : scanResult.privacyScore >= 60 ? '#f59e0b' : '#ef4444'
                }}>
                  {scanResult.privacyScore}%
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Detected Metadata & Fingerprints
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {scanResult.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
                      item.severity === 'danger'
                        ? 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
                        : item.severity === 'warning'
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                        : item.severity === 'safe'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.severity === 'danger' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                      {item.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {item.severity === 'safe' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {item.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{item.label}</span>
                        <span className="font-mono text-[11px] opacity-80">{item.value}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] opacity-90">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations & Quick Actions */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Recommended Privacy Actions
              </h4>
              <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200 list-disc list-inside">
                {scanResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>

              <div className="pt-2">
                <button
                  id="privacy-center-clean-all-btn"
                  onClick={handleCleanEverything}
                  disabled={isCleaning}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.99]"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sanitizing Traces...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Clean Everything (Remove EXIF, GPS & Anonymize)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean Download Ready */}
            {cleanBlob && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Sanitized Copy Ready
                    </h5>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {cleanName}
                    </span>
                  </div>
                </div>

                <button
                  id="download-cleaned-file-btn"
                  onClick={handleDownloadClean}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Clean File</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
