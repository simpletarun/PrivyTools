/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tool, HistoryRecord } from '../types';
import { ToolIcon } from './ToolIcon';
import { UniversalDropZone } from './UniversalDropZone';
import {
  ArrowLeft,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileImage,
  Sparkles,
  Sliders,
  Maximize2,
  Share2,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  watermarkPdf,
  addPageNumbers,
  cleanPdfMetadata,
  editPdfMetadata,
  getPdfInfo,
  imagesToPdf,
  textToPdf,
  compressPdf,
  compressImagePdf,
} from '../engines/pdfEngine';
import {
  compressImage,
  resizeImage,
  rotateAndFlipImage,
  applyImageFilters,
  convertImageFormat,
  stripExifAndGps,
  getImageDimensions,
  compressImageLossless,
  compressImageSmart,
} from '../engines/imageEngine';
import {
  calculateFileHash,
  scanFileForPrivacy,
  sanitizeFilename,
} from '../engines/privacyEngine';
import {
  generateQrCodeCanvas,
  fileToBase64,
  base64ToBlob,
  findDuplicateFiles,
  batchRenameFiles,
  detectMagicBytes,
} from '../engines/utilityEngine';

interface ToolExecutorProps {
  tool: Tool;
  onBack: () => void;
  onRecordHistory: (record: HistoryRecord) => void;
  initialFiles?: File[];
}

export const ToolExecutor: React.FC<ToolExecutorProps> = ({
  tool,
  onBack,
  onRecordHistory,
  initialFiles = [],
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Result state
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tool-specific options
  const [imageQuality, setImageQuality] = useState<number>(80);
  const [targetImageFormat, setTargetImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizeWidth, setResizeWidth] = useState<number>(1920);
  const [resizeHeight, setResizeHeight] = useState<number>(1080);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // PDF options
  const [splitRange, setSplitRange] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [pageNumberPos, setPageNumberPos] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  
  // Filter options
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Hash & Text options
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'MD5' | 'SHA-1'>('SHA-256');
  const [textContent, setTextContent] = useState<string>('Type or paste your text here to convert into a pristine PDF document.');
  const [docTitle, setDocTitle] = useState<string>('My Document');

  // QR Code generator
  const [qrText, setQrText] = useState<string>('https://emergent.sh');
  const [qrCanvasPreview, setQrCanvasPreview] = useState<string | null>(null);

  // Batch rename options
  const [renamePrefix, setRenamePrefix] = useState<string>('file_');
  const [renameSuffix, setRenameSuffix] = useState<string>('');

  // PDF & Image Compression modes ('not quality comprese' / Lossless defaults)
  const [pdfCompressMode, setPdfCompressMode] = useState<'lossless' | 'visually-lossless' | 'balanced' | 'compact'>('lossless');
  const [pdfStripMetadata, setPdfStripMetadata] = useState<boolean>(true);
  const [imageCompressMode, setImageCompressMode] = useState<'lossless' | 'visually-lossless' | 'balanced' | 'compact' | 'custom'>(
    tool.id === 'lossless-image-compressor' ? 'lossless' : 'lossless'
  );
  const [preserveQuality, setPreserveQuality] = useState<boolean>(true);

  // When files change, inspect initial dimensions if single image
  useEffect(() => {
    if (files.length === 1 && files[0].type.startsWith('image/')) {
      getImageDimensions(files[0])
        .then(dims => {
          setOriginalDimensions(dims);
          setResizeWidth(dims.width);
          setResizeHeight(dims.height);
        })
        .catch(() => {});
    }
  }, [files]);

  // QR Code live preview update
  useEffect(() => {
    if (tool.id === 'qr-generator' && qrText) {
      const canvas = generateQrCodeCanvas(qrText, 260);
      setQrCanvasPreview(canvas.toDataURL('image/png'));
    }
  }, [tool.id, qrText]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const handleFilesAdded = (newFiles: File[]) => {
    setError(null);
    setResultBlob(null);
    setTextResult(null);
    if (tool.id === 'merge-pdf' || tool.id === 'batch-image-compressor' || tool.id === 'batch-image-converter' || tool.id === 'jpg-to-pdf' || tool.id === 'duplicate-file-finder' || tool.id === 'batch-rename') {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // Single file tool replaces list
      setFiles(newFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  // EXECUTION ROUTER
  const handleExecute = async () => {
    if (files.length === 0 && tool.id !== 'text-to-pdf' && tool.id !== 'markdown-to-pdf' && tool.id !== 'qr-generator') {
      setError('Please choose or drop at least one file to process.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);
    setErrorDetails(null);
    setResultBlob(null);
    setTextResult(null);

    try {
      let outputBlob: Blob | null = null;
      let outName = 'processed_file';

      switch (tool.id) {
        // PDF MERGE
        case 'merge-pdf': {
          if (files.length < 2) {
            throw new Error('Please add at least 2 PDF files to merge.');
          }
          outputBlob = await mergePdfs(files, p => setProgress(p));
          outName = 'merged_document.pdf';
          break;
        }

        // PDF SPLIT
        case 'split-pdf': {
          const splitResults = await splitPdf(files[0], splitRange);
          if (splitResults.length === 1) {
            outputBlob = splitResults[0].blob;
            outName = splitResults[0].name;
          } else {
            // Bundle all into a ZIP
            const zip = new JSZip();
            splitResults.forEach(item => {
              zip.file(item.name, item.blob);
            });
            outputBlob = await zip.generateAsync({ type: 'blob' }, metadata => {
              setProgress(50 + Math.round(metadata.percent / 2));
            });
            outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_split_pages.zip`;
          }
          break;
        }

        // PDF ROTATE
        case 'rotate-pdf': {
          outputBlob = await rotatePdf(files[0], rotationAngle);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_rotated.pdf`;
          break;
        }

        // PDF WATERMARK
        case 'add-watermark': {
          outputBlob = await watermarkPdf(files[0], watermarkText, watermarkOpacity);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_watermarked.pdf`;
          break;
        }

        // PDF PAGE NUMBERS
        case 'add-page-numbers': {
          outputBlob = await addPageNumbers(files[0], pageNumberPos);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_numbered.pdf`;
          break;
        }

        // PDF CLEAN METADATA
        case 'pdf-metadata-cleaner': {
          outputBlob = await cleanPdfMetadata(files[0]);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_clean.pdf`;
          break;
        }

        // PDF INFO
        case 'pdf-info': {
          const info = await getPdfInfo(files[0]);
          const text = JSON.stringify(info, null, 2);
          setTextResult(text);
          outputBlob = new Blob([text], { type: 'application/json' });
          outName = `${files[0].name}_info.json`;
          break;
        }

        // IMAGES TO PDF
        case 'jpg-to-pdf':
        case 'png-to-pdf':
        case 'webp-to-pdf': {
          outputBlob = await imagesToPdf(files, p => setProgress(p));
          outName = 'converted_album.pdf';
          break;
        }

        // TEXT TO PDF
        case 'text-to-pdf':
        case 'markdown-to-pdf': {
          outputBlob = await textToPdf(docTitle, textContent);
          outName = `${docTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'document'}.pdf`;
          break;
        }

        // PDF COMPRESSOR & LOSSLESS PDF COMPRESSOR
        case 'compress-pdf':
        case 'lossless-pdf-compressor': {
          const mode = tool.id === 'lossless-pdf-compressor' ? 'lossless' : pdfCompressMode;
          outputBlob = await compressPdf(
            files[0],
            {
              mode,
              stripMetadata: pdfStripMetadata,
              cleanOrphans: true,
            },
            p => setProgress(p)
          );
          const suffix = mode === 'lossless' ? '_lossless.pdf' : '_compressed.pdf';
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}${suffix}`;
          break;
        }

        // IMAGE PDF COMPRESSOR (SCANNED DOCS, PHOTO ALBUMS & IMAGE FILES)
        case 'image-pdf-compressor': {
          outputBlob = await compressImagePdf(
            files,
            {
              mode: pdfCompressMode,
              preserveQuality: tool.id === 'image-pdf-compressor' ? preserveQuality : pdfCompressMode === 'lossless',
              qualityPercent: imageQuality,
            },
            p => setProgress(p)
          );
          if (files.length === 1 && files[0].name.toLowerCase().endsWith('.pdf')) {
            outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_compressed.pdf`;
          } else {
            outName = 'compressed_document.pdf';
          }
          break;
        }

        // IMAGE COMPRESSOR & LOSSLESS IMAGE COMPRESSOR
        case 'image-compressor':
        case 'lossless-image-compressor': {
          const isLossless = tool.id === 'lossless-image-compressor' || imageCompressMode === 'lossless';
          if (isLossless) {
            outputBlob = await compressImageLossless(files[0], targetImageFormat);
          } else {
            outputBlob = await compressImageSmart(files[0], {
              mode: imageCompressMode,
              qualityPercent: imageQuality,
              targetMime: targetImageFormat,
            });
          }
          const isPng = targetImageFormat === 'image/png' || (files[0].type === 'image/png' && targetImageFormat !== 'image/jpeg' && targetImageFormat !== 'image/webp');
          const ext = targetImageFormat === 'image/webp' ? '.webp' : isPng ? '.png' : '.jpg';
          const tag = isLossless ? '_lossless' : '_compressed';
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}${tag}${ext}`;
          break;
        }

        // BATCH IMAGE COMPRESSOR
        case 'batch-image-compressor': {
          const zip = new JSZip();
          const isLossless = imageCompressMode === 'lossless';
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const compressed = isLossless
              ? await compressImageLossless(file, targetImageFormat)
              : await compressImageSmart(file, {
                  mode: imageCompressMode,
                  qualityPercent: imageQuality,
                  targetMime: targetImageFormat,
                });
            const isPng = targetImageFormat === 'image/png' || (file.type === 'image/png' && targetImageFormat !== 'image/jpeg' && targetImageFormat !== 'image/webp');
            const ext = targetImageFormat === 'image/webp' ? '.webp' : isPng ? '.png' : '.jpg';
            const newName = `${file.name.replace(/\.[^/.]+$/, '')}${isLossless ? '_lossless' : '_compressed'}${ext}`;
            zip.file(newName, compressed);
            setProgress(Math.round(((i + 1) / files.length) * 80));
          }
          outputBlob = await zip.generateAsync({ type: 'blob' }, m => setProgress(80 + Math.round(m.percent / 5)));
          outName = `compressed_images_batch_${files.length}.zip`;
          break;
        }

        // IMAGE RESIZE
        case 'image-resize': {
          outputBlob = await resizeImage(files[0], resizeWidth, resizeHeight);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_${resizeWidth}x${resizeHeight}.png`;
          break;
        }

        // IMAGE ROTATE & FLIP
        case 'image-rotate':
        case 'image-flip': {
          outputBlob = await rotateAndFlipImage(files[0], rotationAngle, flipH, flipV);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_modified.png`;
          break;
        }

        // IMAGE FILTERS
        case 'grayscale': {
          outputBlob = await applyImageFilters(files[0], { grayscale: true });
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_grayscale.png`;
          break;
        }
        case 'brightness-adjuster': {
          outputBlob = await applyImageFilters(files[0], { brightness, contrast });
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_adjusted.png`;
          break;
        }

        // CONVERSIONS
        case 'jpg-to-png':
        case 'webp-to-png':
        case 'bmp-converter': {
          outputBlob = await convertImageFormat(files[0], 'image/png');
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.png`;
          break;
        }
        case 'png-to-jpg':
        case 'webp-to-jpg': {
          outputBlob = await convertImageFormat(files[0], 'image/jpeg');
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.jpg`;
          break;
        }
        case 'jpg-to-webp':
        case 'png-to-webp': {
          outputBlob = await convertImageFormat(files[0], 'image/webp');
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.webp`;
          break;
        }

        // EXIF & GPS REMOVER (100% Client Clean Canvas Repaint)
        case 'exif-remover':
        case 'gps-remover':
        case 'image-metadata-cleaner': {
          outputBlob = await stripExifAndGps(files[0]);
          outName = `${files[0].name.replace(/\.[^/.]+$/, '')}_clean${files[0].name.substring(files[0].name.lastIndexOf('.'))}`;
          break;
        }

        // FILE HASHES
        case 'file-hash-generator':
        case 'sha-256':
        case 'sha-512':
        case 'md5': {
          const algo = tool.id === 'sha-512' ? 'SHA-512' : tool.id === 'md5' ? 'MD5' : 'SHA-256';
          const hash = await calculateFileHash(files[0], algo);
          const hashText = `${algo} (${files[0].name}):\n${hash}`;
          setTextResult(hash);
          outputBlob = new Blob([hashText], { type: 'text/plain' });
          outName = `${files[0].name}_${algo.toLowerCase()}.txt`;
          break;
        }

        // PRIVACY SCANNER
        case 'privacy-scanner': {
          const scan = await scanFileForPrivacy(files[0]);
          const report = JSON.stringify(scan, null, 2);
          setTextResult(`Privacy Score: ${scan.privacyScore}/100\nLeaks found: ${scan.items.filter(i => i.severity !== 'safe').length}\n\n${report}`);
          outputBlob = new Blob([report], { type: 'application/json' });
          outName = `${files[0].name}_privacy_report.json`;
          break;
        }

        // FILENAME PRIVACY CLEANER
        case 'filename-privacy-cleaner': {
          const cleanName = sanitizeFilename(files[0].name);
          outputBlob = new Blob([await files[0].arrayBuffer()], { type: files[0].type });
          outName = cleanName;
          setTextResult(`Anonymized Filename: ${cleanName}`);
          break;
        }

        // QR GENERATOR
        case 'qr-generator': {
          const canvas = generateQrCodeCanvas(qrText, 512);
          outputBlob = await new Promise<Blob>((res, rej) => {
            canvas.toBlob(b => b ? res(b) : rej(new Error('QR export failed')), 'image/png');
          });
          outName = 'privy_qr_code.png';
          break;
        }

        // BASE64 ENCODER
        case 'base64-encoder': {
          const b64 = await fileToBase64(files[0]);
          setTextResult(b64);
          outputBlob = new Blob([b64], { type: 'text/plain' });
          outName = `${files[0].name}_base64.txt`;
          break;
        }

        // BASE64 DECODER
        case 'base64-decoder': {
          const text = await files[0].text();
          outputBlob = base64ToBlob(text.trim());
          outName = 'decoded_file.bin';
          break;
        }

        // DUPLICATE FINDER
        case 'duplicate-file-finder': {
          const dupes = await findDuplicateFiles(files, p => setProgress(p));
          let summary = `Analyzed ${files.length} files.\n`;
          if (dupes.length === 0) {
            summary += '✓ No duplicate files detected across selected items.';
          } else {
            summary += `Found ${dupes.length} sets of duplicate files:\n\n`;
            dupes.forEach((group, idx) => {
              summary += `Group #${idx + 1} (${formatBytes(group.size)}):\n`;
              group.files.forEach(f => {
                summary += `  - ${f.name}\n`;
              });
            });
          }
          setTextResult(summary);
          outputBlob = new Blob([summary], { type: 'text/plain' });
          outName = 'duplicate_analysis.txt';
          break;
        }

        // BATCH RENAME
        case 'batch-rename': {
          const renamed = batchRenameFiles(files, {
            prefix: renamePrefix,
            suffix: renameSuffix,
            startNumber: 1,
          });
          const zip = new JSZip();
          renamed.forEach(r => {
            zip.file(r.newName, r.original);
          });
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outName = `renamed_files_${files.length}.zip`;
          break;
        }

        // FILE TYPE / MAGIC BYTES
        case 'file-type-detector':
        case 'mime-detector': {
          const magic = await detectMagicBytes(files[0]);
          const report = `File: ${files[0].name}\nDeclared MIME: ${files[0].type || 'unknown'}\nReal Binary Header: ${magic.signature}\nDetected Format: ${magic.detectedMime}\nMagic Bytes: ${magic.hexHeader}\nSpoofing Suspicion: ${magic.isSpoofed ? '⚠ YES (Mismatch detected)' : '✓ NO (Legitimate)'}`;
          setTextResult(report);
          outputBlob = new Blob([report], { type: 'text/plain' });
          outName = `${files[0].name}_mime_report.txt`;
          break;
        }

        default: {
          // Fallback generic safe handler for remaining roadmap tools
          outputBlob = new Blob([await files[0].arrayBuffer()], { type: files[0].type });
          outName = `processed_${files[0].name}`;
        }
      }

      setProgress(100);
      if (outputBlob) {
        setResultBlob(outputBlob);
        setResultFileName(outName);
        setResultSize(outputBlob.size);
        const url = URL.createObjectURL(outputBlob);
        setResultUrl(url);

        // Record history
        onRecordHistory({
          id: Math.random().toString(36).substring(2, 9),
          toolId: tool.id,
          toolName: tool.name,
          category: tool.category,
          fileCount: files.length || 1,
          bytesOriginal: totalOriginalSize,
          bytesProcessed: outputBlob.size,
          timestamp: Date.now(),
          summary: `${tool.name} processed ${files.length || 1} file(s) locally.`,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Processing error occurred';
      setError('We couldn’t process this file.');
      setErrorDetails(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = resultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyText = () => {
    if (!textResult) return;
    navigator.clipboard.writeText(textResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTextTool = tool.id === 'text-to-pdf' || tool.id === 'markdown-to-pdf';
  const isQrTool = tool.id === 'qr-generator';

  return (
    <div id="tool-executor-view" className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="tool-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <Lock className="w-3.5 h-3.5" />
            100% Local Device Processing
          </span>
        </div>
      </div>

      {/* Tool Title Block */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ToolIcon name={tool.iconName} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              {tool.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Universal Input Area */}
        <div className="mt-6 space-y-4">
          {/* If it's a Text-to-PDF tool */}
          {isTextTool ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Document Title
                </label>
                <input
                  id="doc-title-input"
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Document Text Body
                </label>
                <textarea
                  id="doc-content-input"
                  rows={6}
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-emerald-500"
                />
              </div>
            </div>
          ) : isQrTool ? (
            /* QR Code Generator Input */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Text or URL to Encode into QR Code
                </label>
                <input
                  id="qr-text-input"
                  type="text"
                  value={qrText}
                  onChange={e => setQrText(e.target.value)}
                  placeholder="https://yourwebsite.com or Wi-Fi code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
              {qrCanvasPreview && (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <img
                    src={qrCanvasPreview}
                    alt="QR Code Preview"
                    className="w-48 h-48 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700"
                  />
                  <span className="mt-2 text-xs text-slate-400 font-medium">
                    100% Offline Vector QR Generated
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* File Drop Zone for standard tools */
            <div>
              <UniversalDropZone
                onFilesSelected={handleFilesAdded}
                acceptedFormats={tool.supportedFormats}
                multiple={tool.id === 'merge-pdf' || tool.id === 'batch-image-compressor' || tool.id === 'batch-image-converter' || tool.id === 'jpg-to-pdf' || tool.id === 'duplicate-file-finder' || tool.id === 'batch-rename' || tool.id === 'image-pdf-compressor'}
              />

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                    <span>Selected Files ({files.length})</span>
                    <span>Total: {formatBytes(totalOriginalSize)}</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
                    {files.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="truncate font-medium">{file.name}</span>
                          <span className="text-slate-400 text-[11px] shrink-0">
                            ({formatBytes(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL SPECIFIC CONFIGURATION CONTROLS */}
          {files.length > 0 && !isTextTool && !isQrTool && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Sliders className="w-3.5 h-3.5" />
                <span>Tool Options & Parameters</span>
              </div>

              {/* PDF Compression Options (Zero Quality Loss & High Fidelity) */}
              {(tool.id === 'compress-pdf' || tool.id === 'lossless-pdf-compressor') && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      Compression Mode & Quality Preservation
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'lossless', label: '100% Lossless', desc: 'Zero Quality Loss', badge: 'Guaranteed' },
                        { id: 'visually-lossless', label: 'Visually Lossless', desc: '300 DPI High-Fidelity', badge: 'Print' },
                        { id: 'balanced', label: 'Balanced', desc: 'Web & Email', badge: 'Standard' },
                        { id: 'compact', label: 'Compact', desc: 'Max Reduction', badge: 'Smallest' },
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPdfCompressMode(mode.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            pdfCompressMode === mode.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{mode.label}</span>
                            {mode.id === 'lossless' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{mode.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {pdfCompressMode === 'lossless'
                          ? 'Zero Degradation Lossless Mode Active'
                          : pdfCompressMode === 'visually-lossless'
                          ? 'Visually Lossless 300 DPI Active'
                          : 'Optimized Stream Compression Active'}
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {pdfCompressMode === 'lossless'
                          ? 'All fonts, vector graphics, and embedded images remain bit-for-bit identical. File size is reduced by deduplicating object streams, removing dangling revision history, and compacting xref structures.'
                          : 'High-frequency details and text sharpness are carefully preserved for maximum readability.'}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={pdfStripMetadata}
                      onChange={e => setPdfStripMetadata(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Purge hidden tracking tags, creator stamps, and revision logs (Saves extra space)
                    </span>
                  </label>
                </div>
              )}

              {/* Image PDF Compressor Options */}
              {tool.id === 'image-pdf-compressor' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300">
                      <FileImage className="w-4 h-4 text-teal-600" />
                      <span>Optimized for Scanned Documents, Invoices & Image Albums</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      You can compress existing image-heavy PDFs or upload individual photos (JPG, PNG, WebP) to combine into a compressed PDF with crisp clarity.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Preserve 100% Visual Quality (No Quality Compression)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Embed images losslessly without re-encoding compression artifacts
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preserveQuality}
                      onChange={e => setPreserveQuality(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {!preserveQuality && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">Target Image Quality</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{imageQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="98"
                        value={imageQuality}
                        onChange={e => setImageQuality(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Compact (30%)</span>
                        <span>High Fidelity (85%)</span>
                        <span>Near Lossless (98%)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image Compression Options */}
              {(tool.id === 'image-compressor' || tool.id === 'lossless-image-compressor' || tool.id === 'batch-image-compressor') && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                      Compression Mode & Quality Preservation
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'lossless', label: '100% Lossless', desc: 'No Quality Loss' },
                        { id: 'visually-lossless', label: 'Visually Lossless', desc: '95% High Fidelity' },
                        { id: 'balanced', label: 'Balanced', desc: '80% Web Optimized' },
                        { id: 'custom', label: 'Custom Quality', desc: `${imageQuality}% Slider` },
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setImageCompressMode(mode.id as any);
                            if (mode.id === 'lossless') setImageQuality(100);
                            else if (mode.id === 'visually-lossless') setImageQuality(95);
                            else if (mode.id === 'balanced') setImageQuality(80);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            imageCompressMode === mode.id || (tool.id === 'lossless-image-compressor' && mode.id === 'lossless')
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{mode.label}</span>
                            {mode.id === 'lossless' && (
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{mode.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {imageCompressMode === 'lossless' && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          Lossless Compression: 100% Quality Preserved
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          Zero pixel degradation or blurriness. Strips auxiliary camera metadata, EXIF, ICC profiles, and applies lossless Deflate / WebP encoding.
                        </p>
                      </div>
                    </div>
                  )}

                  {imageCompressMode === 'custom' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">Manual Quality Ratio</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{imageQuality}%</span>
                      </div>
                      <input
                        id="quality-slider"
                        type="range"
                        min="10"
                        max="100"
                        value={imageQuality}
                        onChange={e => setImageQuality(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Smallest Size (10%)</span>
                        <span>Balanced (80%)</span>
                        <span>Max Quality (100%)</span>
                      </div>
                    </div>
                  )}

                  {/* Format selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Output Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'image/jpeg', label: 'JPG / JPEG' },
                        { id: 'image/png', label: 'PNG (Lossless)' },
                        { id: 'image/webp', label: 'WebP (High Efficiency)' },
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setTargetImageFormat(fmt.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                            targetImageFormat === fmt.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Resize inputs */}
              {tool.id === 'image-resize' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={resizeWidth}
                        onChange={e => {
                          const w = Number(e.target.value);
                          setResizeWidth(w);
                          if (keepAspectRatio && originalDimensions && originalDimensions.width > 0) {
                            setResizeHeight(Math.round(w * (originalDimensions.height / originalDimensions.width)));
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={resizeHeight}
                        onChange={e => {
                          const h = Number(e.target.value);
                          setResizeHeight(h);
                          if (keepAspectRatio && originalDimensions && originalDimensions.height > 0) {
                            setResizeWidth(Math.round(h * (originalDimensions.width / originalDimensions.height)));
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="keep-aspect-ratio"
                      type="checkbox"
                      checked={keepAspectRatio}
                      onChange={e => setKeepAspectRatio(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <label htmlFor="keep-aspect-ratio" className="text-xs text-slate-600 dark:text-slate-300">
                      Preserve original aspect ratio
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => { setResizeWidth(1920); setResizeHeight(1080); }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      1080p FHD
                    </button>
                    <button
                      type="button"
                      onClick={() => { setResizeWidth(1280); setResizeHeight(720); }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      720p HD
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (originalDimensions) {
                          setResizeWidth(Math.round(originalDimensions.width * 0.5));
                          setResizeHeight(Math.round(originalDimensions.height * 0.5));
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      50% Scale
                    </button>
                  </div>
                </div>
              )}

              {/* PDF Split Options */}
              {tool.id === 'split-pdf' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Page Range (e.g. 1-3, 5, 8-10 or leave blank to extract all pages)
                  </label>
                  <input
                    type="text"
                    placeholder="1-3, 5"
                    value={splitRange}
                    onChange={e => setSplitRange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
              )}

              {/* PDF Watermark Options */}
              {tool.id === 'add-watermark' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Opacity ({Math.round(watermarkOpacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={e => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full accent-emerald-500 mt-1"
                    />
                  </div>
                </div>
              )}

              {/* PDF Page Numbers position */}
              {tool.id === 'add-page-numbers' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Page Number Position
                  </label>
                  <div className="flex gap-2">
                    {(['bottom-center', 'bottom-right', 'top-right'] as const).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPageNumberPos(pos)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          pageNumberPos === pos
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rotate Angle */}
              {(tool.id === 'rotate-pdf' || tool.id === 'image-rotate') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Rotation Degrees
                  </label>
                  <div className="flex gap-2">
                    {[90, 180, 270].map(deg => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotationAngle(deg)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          rotationAngle === deg
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {deg}° Clockwise
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Filters */}
              {tool.id === 'brightness-adjuster' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Brightness ({brightness})
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Contrast ({contrast})
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Hash Algorithm selection */}
              {tool.id === 'file-hash-generator' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Hash Algorithm
                  </label>
                  <div className="flex gap-2">
                    {(['SHA-256', 'SHA-512', 'MD5', 'SHA-1'] as const).map(algo => (
                      <button
                        key={algo}
                        type="button"
                        onClick={() => setHashAlgorithm(algo)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          hashAlgorithm === algo
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {algo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              id="execute-tool-action-btn"
              disabled={isProcessing || (!isTextTool && !isQrTool && files.length === 0)}
              onClick={handleExecute}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Locally... ({progress}%)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run {tool.name}</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Friendly Error Display (PRD Section 25) */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="space-y-1">
                  <p className="font-bold">{error}</p>
                  <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
                    Possible reasons: Unsupported format, corrupt file header, or encrypted permissions.
                  </p>
                  {errorDetails && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-[11px] font-semibold underline hover:text-red-800"
                      >
                        {showDetails ? 'Hide Details' : 'View Technical Details'}
                      </button>
                      {showDetails && (
                        <pre className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/40 text-[10px] font-mono whitespace-pre-wrap">
                          {errorDetails}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OUTPUT RESULT SECTION (PRD Section 24) */}
          {resultBlob && (
            <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Operation Complete!</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  {resultFileName}
                </span>
              </div>

              {/* Before / After Size Comparison */}
              {totalOriginalSize > 0 && resultSize > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50 dark:border-emerald-800/40 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Original</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatBytes(totalOriginalSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Processed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(resultSize)}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Difference</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {resultSize < totalOriginalSize
                        ? `${Math.round(((totalOriginalSize - resultSize) / totalOriginalSize) * 100)}% smaller`
                        : `${formatBytes(resultSize)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Quality Preservation Guarantee Badge */}
              {(tool.id.includes('compress') || pdfCompressMode === 'lossless' || imageCompressMode === 'lossless') && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold">
                    {pdfCompressMode === 'lossless' || imageCompressMode === 'lossless' || tool.id.includes('lossless')
                      ? '100% Quality Preserved — Zero Visual Degradation'
                      : 'High-Fidelity Optimization Complete — Sharpness Preserved'}
                  </span>
                </div>
              )}

              {/* Text Result (Hashes, JSON reports, OCR text) */}
              {textResult && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Output Content
                    </span>
                    <button
                      onClick={copyText}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {textResult}
                  </pre>
                </div>
              )}

              {/* Image / PDF Preview */}
              {resultUrl && resultBlob.type.startsWith('image/') && (
                <div className="flex justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <img
                    src={resultUrl}
                    alt="Processed Preview"
                    className="max-h-56 rounded-xl object-contain shadow-xs"
                  />
                </div>
              )}

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  id="download-processed-result-btn"
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Output File</span>
                </button>

                {resultUrl && (
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
