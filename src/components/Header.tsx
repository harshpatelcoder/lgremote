import React from 'react';
import { Tv, Settings, BookOpen, Wifi, ShieldAlert, Sparkles } from 'lucide-react';
import { TVConnectionStatus, OperatingMode } from '../types';

interface HeaderProps {
  status: TVConnectionStatus;
  operatingMode: OperatingMode;
  isBridgeOnline: boolean;
  onOpenSettings: () => void;
  onOpenSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  operatingMode,
  isBridgeOnline,
  onOpenSettings,
  onOpenSetup,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-green"></span>
            Connected
          </span>
        );
      case 'WAITING_FOR_TV_APPROVAL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Approve on TV
          </span>
        );
      case 'CONNECTING':
      case 'RECONNECTING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Connecting...
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Error
          </span>
        );
      case 'DISCONNECTED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-card text-gray-400 border border-dark-border">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            Disconnected
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B0D12]/90 backdrop-blur-md border-b border-dark-border px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-purple-800 flex items-center justify-center shadow-glow-primary">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold text-white tracking-tight">LG Remote</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-secondary border border-brand-primary/30">
                webOS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isBridgeOnline ? (
                <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                  <Wifi className="w-3 h-3" /> Bridge Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                  <ShieldAlert className="w-3 h-3" /> Cloud Preview
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}

          <button
            onClick={onOpenSetup}
            title="Setup & Pairing Guide"
            className="p-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-all btn-tactile"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Bridge Settings & PIN"
            className="p-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-all btn-tactile"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
