/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolCategory = 'pdf' | 'image' | 'privacy' | 'document' | 'utility';

export type ProcessingMode = 'local' | 'cloud' | 'hybrid';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  supportedFormats: string[];
  outputFormats: string[];
  processingMode: ProcessingMode;
  isImplemented: boolean;
  tags: string[];
  isPopular?: boolean;
}

export interface ProcessingJob {
  id: string;
  toolId: string;
  toolName: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'queued' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  resultBlob?: Blob;
  resultUrl?: string;
  resultFileName?: string;
  resultSize?: number;
  createdAt: number;
  completedAt?: number;
}

export interface PrivacyScanItem {
  id: string;
  category: 'gps' | 'camera' | 'timestamp' | 'author' | 'embedded' | 'software' | 'network';
  label: string;
  value: string;
  severity: 'safe' | 'warning' | 'danger' | 'info';
  description: string;
}

export interface PrivacyScanResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  privacyScore: number; // 0 to 100
  hasGps: boolean;
  hasExif: boolean;
  hasAuthor: boolean;
  items: PrivacyScanItem[];
  recommendations: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  localOnlyMode: boolean;
  autoDeleteSession: boolean;
  saveHistory: boolean;
  defaultImageQuality: number; // 10 to 100
  defaultPdfQuality: 'high' | 'balanced' | 'small';
  telemetryDisabled: boolean;
  maxParallelJobs: number;
}

export interface HistoryRecord {
  id: string;
  toolId: string;
  toolName: string;
  category: ToolCategory;
  fileCount: number;
  bytesOriginal: number;
  bytesProcessed: number;
  timestamp: number;
  summary: string;
}
