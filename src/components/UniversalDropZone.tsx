/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface UniversalDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
  multiple?: boolean;
  label?: string;
  subLabel?: string;
}

export const UniversalDropZone: React.FC<UniversalDropZoneProps> = ({
  onFilesSelected,
  acceptedFormats,
  multiple = true,
  label = 'Drop files here',
  subLabel = 'or click to browse from device (Batch supported)',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(selected);
    }
    // reset input so same file can be chosen again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const acceptString = acceptedFormats && acceptedFormats.length > 0
    ? acceptedFormats.filter(f => f !== '*').join(',')
    : undefined;

  return (
    <div
      id="universal-drop-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.005]'
          : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={acceptString}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
          {label}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {subLabel}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            100% Client-Side Processing
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
            Zero Cloud Uploads
          </span>
          {acceptedFormats && acceptedFormats.length > 0 && !acceptedFormats.includes('*') && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
              Accepts {acceptedFormats.join(' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
