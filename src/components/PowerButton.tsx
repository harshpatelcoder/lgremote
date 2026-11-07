import React, { useState } from 'react';
import { Power, Info, X } from 'lucide-react';

interface PowerButtonProps {
  onPowerOff: () => Promise<void>;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({ onPowerOff, disabled = false }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWolInfo, setShowWolInfo] = useState(false);
  const [isPoweringOff, setIsPoweringOff] = useState(false);

  const handleTurnOff = async () => {
    setIsPoweringOff(true);
    try {
      await onPowerOff();
    } finally {
      setIsPoweringOff(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative flex items-center justify-between w-full px-2 py-1 mb-3">
      {/* Power Off Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={disabled || isPoweringOff}
          title="Turn TV Off"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-800 border border-rose-800/50 text-rose-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-md btn-tactile disabled:opacity-40"
        >
          <Power className="w-4 h-4 text-rose-400" />
          <span>Power Off</span>
        </button>
      </div>

      {/* Power On Disabled Button with WOL Notice */}
      <div className="relative flex items-center">
        <button
          onClick={() => setShowWolInfo(!showWolInfo)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-card/60 border border-dark-border/60 text-gray-500 hover:text-gray-400 text-xs transition-colors"
        >
          <Power className="w-3.5 h-3.5 opacity-40" />
          <span className="line-through opacity-70">Power On</span>
          <Info className="w-3 h-3 text-brand-secondary ml-0.5" />
        </button>

        {/* Wake-on-LAN Info popover */}
        {showWolInfo && (
          <div className="absolute right-0 top-11 z-40 w-64 p-3 rounded-xl bg-dark-card border border-dark-border shadow-2xl text-xs text-gray-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white">Power On Limitation</span>
              <button onClick={() => setShowWolInfo(false)} className="text-gray-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              When an LG TV is powered off, its SSAP WebSocket server is shut down to save electricity. Ordinary WebSocket commands cannot reach it. Powering on requires Wake-on-LAN (WOL) magic packets over UDP to the TV's wired or wireless MAC address.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Power Off */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-dark-card border border-dark-border p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <Power className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Turn off LG TV?</h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              This will send the <code>ssap://system/turnOff</code> command to shut down the television.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-dark-hover border border-dark-border text-gray-300 text-xs font-medium hover:bg-dark-hover/80"
              >
                Cancel
              </button>
              <button
                onClick={handleTurnOff}
                disabled={isPoweringOff}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md btn-tactile"
              >
                {isPoweringOff ? 'Turning Off...' : 'Confirm Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
