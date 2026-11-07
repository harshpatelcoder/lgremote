import React, { useState } from 'react';
import {
  Tv,
  Wifi,
  Edit2,
  Check,
  X,
  RefreshCw,
  Unplug,
  KeyRound,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TVState, OperatingMode } from '../types';

interface ConnectionCardProps {
  tvState: TVState;
  isBridgeOnline: boolean;
  operatingMode: OperatingMode;
  onConnect: (ip: string) => Promise<void>;
  onPair: (ip: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onForgetPairing: () => Promise<void>;
  onOpenSetup: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  tvState,
  isBridgeOnline,
  operatingMode,
  onConnect,
  onPair,
  onDisconnect,
  onForgetPairing,
  onOpenSetup,
}) => {
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [editedIp, setEditedIp] = useState(tvState.ip || '192.168.31.63');
  const [actionLoading, setActionLoading] = useState(false);

  const handleSaveIp = () => {
    if (editedIp.trim()) {
      setIsEditingIp(false);
    }
  };

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      await onConnect(editedIp);
    } catch {
      // Handled in parent hook
    } finally {
      setActionLoading(false);
    }
  };

  const handlePair = async () => {
    setActionLoading(true);
    try {
      await onPair(editedIp);
    } catch {
      // Handled in parent hook
    } finally {
      setActionLoading(false);
    }
  };

  const isConnected = tvState.status === 'CONNECTED';
  const isWaitingApproval = tvState.status === 'WAITING_FOR_TV_APPROVAL';
  const isConnecting = tvState.status === 'CONNECTING' || tvState.status === 'RECONNECTING';

  return (
    <div className="w-full rounded-2xl glass-panel p-4 mb-4 border border-dark-border shadow-xl">
      {/* Vercel Cloud Mode Notice Banner */}
      {!isBridgeOnline && (
        <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-semibold text-amber-300">Vercel Hosted Mode (UI Preview):</span> Cloud servers cannot directly access your private home Wi-Fi TV. To control your TV, run the local bridge on your laptop on port 8787.
            <button
              onClick={onOpenSetup}
              className="ml-1 text-white underline font-medium hover:text-amber-100"
            >
              View Setup Steps
            </button>
          </div>
        </div>
      )}

      {/* TV Approval Prompt Card */}
      {isWaitingApproval && (
        <div className="mb-3.5 p-3.5 rounded-xl bg-purple-950/70 border border-brand-primary/50 shadow-glow-primary animate-pulse flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-sm font-semibold text-white">LG TV Action Required</h4>
            <p className="text-xs text-brand-secondary/90 mt-0.5">
              Please approve the connection request on your LG TV screen with your physical Magic Remote.
            </p>
          </div>
        </div>
      )}

      {/* Connection Header & TV IP */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-hover text-gray-400'}`}>
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              LG webOS Smart TV
              {tvState.isPaired && (
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                  Key Saved
                </span>
              )}
            </div>
            {/* Editable IP Address */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {isEditingIp ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editedIp}
                    onChange={(e) => setEditedIp(e.target.value)}
                    placeholder="192.168.31.63"
                    className="text-xs px-2 py-0.5 rounded bg-dark-bg border border-brand-primary text-white focus:outline-none w-32"
                  />
                  <button
                    onClick={handleSaveIp}
                    className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedIp(tvState.ip);
                      setIsEditingIp(false);
                    }}
                    className="p-1 rounded bg-dark-hover text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 font-mono">{tvState.ip || '192.168.31.63'}</span>
                  <button
                    onClick={() => setIsEditingIp(true)}
                    title="Change TV IP address"
                    className="p-0.5 rounded text-gray-400 hover:text-brand-secondary transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protocol badge */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-400 bg-dark-bg px-2 py-1 rounded border border-dark-border">
            SSAP :3001 (WSS)
          </span>
        </div>
      </div>

      {/* Error display if present */}
      {tvState.errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-900/50 text-xs text-rose-300 flex items-center justify-between">
          <span className="truncate pr-2">{tvState.errorMessage}</span>
          <button
            onClick={handleConnect}
            className="text-[11px] underline text-rose-200 hover:text-white shrink-0 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Connection Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {isConnected ? (
          <>
            <button
              onClick={() => onDisconnect()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-card hover:bg-rose-950/50 border border-dark-border hover:border-rose-800/60 text-gray-300 hover:text-rose-400 text-xs font-medium transition-all btn-tactile"
            >
              <Unplug className="w-3.5 h-3.5" />
              Disconnect
            </button>
            <button
              onClick={() => onForgetPairing()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white text-xs font-medium transition-all btn-tactile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Forget Key
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleConnect}
              disabled={actionLoading || isConnecting}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-glow-primary btn-tactile"
            >
              <Wifi className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
              {isConnecting ? 'Connecting...' : 'Connect to TV'}
            </button>
            <button
              onClick={handlePair}
              disabled={actionLoading || isConnecting}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover disabled:opacity-50 border border-dark-border text-gray-300 hover:text-white text-xs font-medium transition-all btn-tactile"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-secondary" />
              Pair New TV
            </button>
          </>
        )}
      </div>
    </div>
  );
};
