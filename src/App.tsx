/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tool, ProcessingJob, HistoryRecord, AppSettings } from './types';
import { ALL_TOOLS } from './data/tools';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { CategoryView } from './components/CategoryView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { ToolExecutor } from './components/ToolExecutor';
import { ProcessingQueueModal } from './components/ProcessingQueueModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { SearchModal } from './components/SearchModal';
import { FileActionPromptModal } from './components/FileActionPromptModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  localOnlyMode: true,
  autoDeleteSession: true,
  saveHistory: true,
  defaultImageQuality: 80,
  defaultPdfQuality: 'balanced',
  telemetryDisabled: true,
  maxParallelJobs: 4,
};

const DEFAULT_FAVORITES = [
  'image-pdf-compressor',
  'lossless-pdf-compressor',
  'lossless-image-compressor',
  'image-compressor',
  'merge-pdf',
  'split-pdf',
  'exif-remover',
  'qr-generator',
  'privacy-scanner',
  'file-hash-generator',
];

export default function App() {
  // Navigation & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'tools' | 'privacy' | 'queue' | 'settings'>('home');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [initialFilesForTool, setInitialFilesForTool] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [droppedFilesForPrompt, setDroppedFilesForPrompt] = useState<File[]>([]);

  // Persistent Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('privy_favorites');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  // Persistent History
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('privy_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('privy_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('privy_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Background queue jobs
  const [queueJobs, setQueueJobs] = useState<ProcessingJob[]>([]);

  // Sync dark mode class with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('privy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('privy_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('privy_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('privy_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('privy_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Global keyboard shortcuts (e.g. '/' for search, 'Esc' to close/back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (isQueueOpen) setIsQueueOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isAndroidModalOpen) setIsAndroidModalOpen(false);
        if (droppedFilesForPrompt.length > 0) setDroppedFilesForPrompt([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isQueueOpen, isHistoryOpen, isSettingsOpen, isAndroidModalOpen, droppedFilesForPrompt]);

  const toggleFavorite = (toolId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSelectTool = (tool: Tool, files: File[] = []) => {
    setActiveTool(tool);
    setInitialFilesForTool(files);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveTool(null);
    setInitialFilesForTool([]);
  };

  const handleRecordHistory = (record: HistoryRecord) => {
    setHistory(prev => [record, ...prev].slice(0, 50));
  };

  const handleSelectCategory = (catId: string) => {
    setActiveTool(null);
    setSelectedCategory(catId);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileTabChange = (tab: 'home' | 'tools' | 'privacy' | 'queue' | 'settings') => {
    setActiveMobileTab(tab);
    if (tab === 'home') {
      setActiveTool(null);
      setSelectedCategory('home');
    } else if (tab === 'tools') {
      setActiveTool(null);
      setSelectedCategory('all');
    } else if (tab === 'privacy') {
      setActiveTool(null);
      setSelectedCategory('privacy-center');
    } else if (tab === 'queue') {
      setIsQueueOpen(true);
    } else if (tab === 'settings') {
      setIsSettingsOpen(true);
    }
  };

  const activeJobsCount = queueJobs.filter(j => j.status === 'processing' || j.status === 'queued').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateHome={() => handleSelectCategory('home')}
        onOpenPrivacyCenter={() => handleSelectCategory('privacy-center')}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        activeJobsCount={activeJobsCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar on Desktop */}
        <Sidebar
          selectedCategory={activeTool ? '' : selectedCategory}
          onSelectCategory={handleSelectCategory}
          favoritesCount={favorites.length}
          onViewFavorites={() => handleSelectCategory('favorites')}
          onOpenPrivacyCenter={() => handleSelectCategory('privacy-center')}
          onOpenQueue={() => setIsQueueOpen(true)}
          activeJobsCount={activeJobsCount}
        />

        {/* Center Dynamic Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
          {/* Active Tool Execution Workspace */}
          {activeTool ? (
            <ToolExecutor
              tool={activeTool}
              onBack={handleBackToDashboard}
              onRecordHistory={handleRecordHistory}
              initialFiles={initialFilesForTool}
            />
          ) : selectedCategory === 'privacy-center' ? (
            /* Privacy Center Workspace */
            <PrivacyCenterView onRecordHistory={handleRecordHistory} />
          ) : selectedCategory === 'home' && !searchQuery.trim() ? (
            /* Default Home Dashboard */
            <HomeDashboard
              onSelectTool={handleSelectTool}
              onSelectCategory={handleSelectCategory}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onFilesDropped={(files) => setDroppedFilesForPrompt(files)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
            />
          ) : (
            /* Category Browser or Active Search Results */
            <CategoryView
              categoryId={selectedCategory}
              onSelectTool={handleSelectTool}
              onBackHome={() => handleSelectCategory('home')}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on phones & Android devices) */}
      <MobileBottomNav
        currentTab={activeMobileTab}
        onChangeTab={handleMobileTabChange}
        activeJobsCount={activeJobsCount}
      />

      {/* Universal Search Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
        favorites={favorites}
      />

      {/* Processing Queue Modal */}
      <ProcessingQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        jobs={queueJobs}
        onClearCompleted={() => setQueueJobs(prev => prev.filter(j => j.status !== 'completed'))}
        onCancelJob={(id) => setQueueJobs(prev => prev.filter(j => j.id !== id))}
      />

      {/* Local Activity History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      {/* App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings(prev => ({ ...prev, ...updated }))}
        onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
      />

      {/* Dropped File Suggestion Prompt Modal */}
      <FileActionPromptModal
        isOpen={droppedFilesForPrompt.length > 0}
        onClose={() => setDroppedFilesForPrompt([])}
        files={droppedFilesForPrompt}
        onSelectToolWithFiles={(tool, files) => {
          setDroppedFilesForPrompt([]);
          handleSelectTool(tool, files);
        }}
      />

      {/* Android WebAPK & APK Package Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Global Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
