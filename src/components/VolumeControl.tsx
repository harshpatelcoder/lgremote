import React from 'react';
import { Volume2, VolumeX, Plus, Minus } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeUp: () => Promise<void>;
  onVolumeDown: () => Promise<void>;
  onSetVolume: (vol: number) => Promise<void>;
  onToggleMute: () => Promise<void>;
  disabled?: boolean;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onVolumeUp,
  onVolumeDown,
  onSetVolume,
  onToggleMute,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-between h-44 w-20 py-2 px-1 rounded-3xl bg-dark-card border border-dark-border shadow-lg">
      {/* Volume Up */}
      <button
        onClick={() => onVolumeUp()}
        disabled={disabled}
        title="Volume Up"
        className="w-14 h-12 rounded-2xl bg-dark-hover hover:bg-white/10 active:bg-brand-primary active:text-white flex items-center justify-center text-gray-200 transition-all btn-tactile disabled:opacity-40"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Volume Value / Indicator */}
      <div className="flex flex-col items-center my-1">
        <button
          onClick={() => onToggleMute()}
          disabled={disabled}
          title={muted ? 'Unmute' : 'Mute'}
          className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-brand-secondary" />
          )}
        </button>
        <span className="text-xs font-mono font-bold text-gray-200 mt-0.5">
          {muted ? 'MUTE' : volume}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
          VOL
        </span>
      </div>

      {/* Volume Down */}
      <button
        onClick={() => onVolumeDown()}
        disabled={disabled}
        title="Volume Down"
        className="w-14 h-12 rounded-2xl bg-dark-hover hover:bg-white/10 active:bg-brand-primary active:text-white flex items-center justify-center text-gray-200 transition-all btn-tactile disabled:opacity-40"
      >
        <Minus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
