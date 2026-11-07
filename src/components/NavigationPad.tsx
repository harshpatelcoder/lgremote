import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  SlidersHorizontal,
  Tv,
  VolumeX,
} from 'lucide-react';

interface NavigationPadProps {
  onNavigate: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER') => void;
  onBack: () => void;
  onHome: () => void;
  onSettings: () => void;
  onInput: () => void;
  onMute: () => void;
  isMuted?: boolean;
  disabled?: boolean;
}

export const NavigationPad: React.FC<NavigationPadProps> = ({
  onNavigate,
  onBack,
  onHome,
  onSettings,
  onInput,
  onMute,
  isMuted = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center my-3 w-full">
      {/* Circular D-Pad Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-[#1C2333] to-[#121622] p-2.5 shadow-dpad border border-[#2A3447]/90 flex items-center justify-center select-none">
        {/* Directional Button: UP */}
        <button
          onClick={() => onNavigate('UP')}
          disabled={disabled}
          title="Up"
          className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-16 rounded-t-full flex items-start justify-center pt-2 text-gray-300 hover:text-white active:text-brand-secondary transition-all disabled:opacity-40 btn-tactile focus:outline-none"
        >
          <div className="p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-transform">
            <ChevronUp className="w-8 h-8 stroke-[2.5]" />
          </div>
        </button>

        {/* Directional Button: DOWN */}
        <button
          onClick={() => onNavigate('DOWN')}
          disabled={disabled}
          title="Down"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16 rounded-b-full flex items-end justify-center pb-2 text-gray-300 hover:text-white active:text-brand-secondary transition-all disabled:opacity-40 btn-tactile focus:outline-none"
        >
          <div className="p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-transform">
            <ChevronDown className="w-8 h-8 stroke-[2.5]" />
          </div>
        </button>

        {/* Directional Button: LEFT */}
        <button
          onClick={() => onNavigate('LEFT')}
          disabled={disabled}
          title="Left"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-20 rounded-l-full flex items-center justify-start pl-2 text-gray-300 hover:text-white active:text-brand-secondary transition-all disabled:opacity-40 btn-tactile focus:outline-none"
        >
          <div className="p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-transform">
            <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
          </div>
        </button>

        {/* Directional Button: RIGHT */}
        <button
          onClick={() => onNavigate('RIGHT')}
          disabled={disabled}
          title="Right"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-20 rounded-r-full flex items-center justify-end pr-2 text-gray-300 hover:text-white active:text-brand-secondary transition-all disabled:opacity-40 btn-tactile focus:outline-none"
        >
          <div className="p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-transform">
            <ChevronRight className="w-8 h-8 stroke-[2.5]" />
          </div>
        </button>

        {/* Center OK / ENTER Button */}
        <button
          onClick={() => onNavigate('ENTER')}
          disabled={disabled}
          title="OK / Enter"
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-[#252E42] to-[#171D2A] border-2 border-brand-primary/50 text-white font-bold text-sm tracking-widest flex items-center justify-center shadow-dpad-btn hover:border-brand-secondary active:scale-95 transition-all disabled:opacity-40 btn-tactile z-10"
        >
          <div className="flex flex-col items-center">
            <span className="text-white text-base font-bold">OK</span>
          </div>
        </button>
      </div>

      {/* Secondary Controls Bar */}
      <div className="w-full max-w-sm mt-5 grid grid-cols-5 gap-2 px-2">
        {/* Back */}
        <button
          onClick={onBack}
          disabled={disabled}
          title="Back"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white disabled:opacity-40 transition-all btn-tactile"
        >
          <RotateCcw className="w-5 h-5 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Back</span>
        </button>

        {/* Home */}
        <button
          onClick={onHome}
          disabled={disabled}
          title="Home Dashboard"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 text-brand-secondary hover:text-white disabled:opacity-40 transition-all btn-tactile"
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold text-brand-secondary">Home</span>
        </button>

        {/* Settings */}
        <button
          onClick={onSettings}
          disabled={disabled}
          title="TV Quick Settings"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white disabled:opacity-40 transition-all btn-tactile"
        >
          <SlidersHorizontal className="w-5 h-5 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Menu</span>
        </button>

        {/* Source / Input */}
        <button
          onClick={onInput}
          disabled={disabled}
          title="TV Input / Source"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white disabled:opacity-40 transition-all btn-tactile"
        >
          <Tv className="w-5 h-5 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Input</span>
        </button>

        {/* Quick Mute */}
        <button
          onClick={onMute}
          disabled={disabled}
          title="Mute / Unmute"
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all btn-tactile disabled:opacity-40 ${
            isMuted
              ? 'bg-rose-950/70 border-rose-800 text-rose-400'
              : 'bg-dark-card hover:bg-dark-hover border-dark-border text-gray-300 hover:text-white'
          }`}
        >
          <VolumeX className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>
      </div>
    </div>
  );
};
