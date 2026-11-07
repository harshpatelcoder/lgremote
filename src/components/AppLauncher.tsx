import React, { useState, useEffect } from 'react';
import { PlaySquare, Film, Compass, Tv, RefreshCw, X, ExternalLink, Play } from 'lucide-react';
import { apiService } from '../services/api';
import { AppItem } from '../types';

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (appId: string) => Promise<void>;
  isConnected: boolean;
}

const COMMON_APPS = [
  { id: 'youtube.leanback.v4', title: 'YouTube', icon: 'youtube', color: 'from-red-600 to-rose-700' },
  { id: 'netflix', title: 'Netflix', icon: 'netflix', color: 'from-red-900 to-black' },
  { id: 'amazon', title: 'Prime Video', icon: 'film', color: 'from-blue-600 to-cyan-700' },
  { id: 'com.webos.app.browser', title: 'Web Browser', icon: 'compass', color: 'from-indigo-600 to-purple-700' },
  { id: 'com.webos.app.hdmi1', title: 'HDMI 1', icon: 'tv', color: 'from-gray-700 to-gray-900' },
  { id: 'com.webos.app.hdmi2', title: 'HDMI 2', icon: 'tv', color: 'from-gray-700 to-gray-900' },
];

export const AppLauncher: React.FC<AppLauncherProps> = ({
  isOpen,
  onClose,
  onLaunch,
  isConnected,
}) => {
  const [tvApps, setTvApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [launchingAppId, setLaunchingAppId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isConnected) {
      loadTvApps();
    }
  }, [isOpen, isConnected]);

  const loadTvApps = async () => {
    setLoading(true);
    try {
      const apps = await apiService.getApps();
      if (apps && apps.length > 0) {
        setTvApps(apps);
      }
    } catch {
      // Keep common apps fallback
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (appId: string) => {
    setLaunchingAppId(appId);
    try {
      await onLaunch(appId);
      onClose();
    } finally {
      setLaunchingAppId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-dark-card border border-dark-border p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-secondary">
              <PlaySquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">App Launcher</h3>
              <p className="text-[11px] text-gray-400">Launch streaming apps & inputs on TV</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                onClick={loadTvApps}
                title="Refresh apps list"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Quick Launch Cards */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Popular Channels & Inputs
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleLaunch(app.id)}
                  disabled={!isConnected || launchingAppId === app.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-md hover:opacity-90 active:scale-95 transition-all btn-tactile disabled:opacity-40`}
                >
                  {app.icon === 'youtube' && (
                    <div className="w-6 h-6 mb-1 flex items-center justify-center">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  )}
                  {app.icon === 'netflix' && <Film className="w-6 h-6 mb-1 text-red-500" />}
                  {app.icon === 'film' && <Film className="w-6 h-6 mb-1 text-cyan-400" />}
                  {app.icon === 'compass' && <Compass className="w-6 h-6 mb-1 text-purple-300" />}
                  {app.icon === 'tv' && <Tv className="w-6 h-6 mb-1 text-gray-300" />}
                  <span className="text-[11px] font-medium truncate w-full text-center">
                    {app.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Installed TV Apps from webOS */}
          {tvApps.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                All Installed webOS Applications ({tvApps.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {tvApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleLaunch(app.id)}
                    disabled={!isConnected || launchingAppId === app.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border text-left transition-all btn-tactile disabled:opacity-40"
                  >
                    {app.icon ? (
                      <img src={app.icon} alt="" className="w-7 h-7 rounded-lg object-contain bg-black/40 p-0.5" />
                    ) : (
                      <PlaySquare className="w-5 h-5 text-brand-secondary shrink-0" />
                    )}
                    <span className="text-xs text-gray-200 font-medium truncate">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
