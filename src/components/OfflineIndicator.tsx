import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 text-white border border-emerald-500/30 px-3.5 py-2 text-xs font-medium shadow-2xl backdrop-blur-md animate-bounce">
      <WifiOff className="w-4 h-4 text-emerald-400" />
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-emerald-400">Offline Mode:</span>
        <span className="text-slate-300">All 100+ tools run 100% locally on your device</span>
      </div>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
    </div>
  );
};
