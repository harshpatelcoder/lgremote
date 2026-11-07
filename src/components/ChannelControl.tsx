import React from 'react';
import { ChevronUp, ChevronDown, Radio } from 'lucide-react';

interface ChannelControlProps {
  onChannelUp: () => Promise<void>;
  onChannelDown: () => Promise<void>;
  disabled?: boolean;
}

export const ChannelControl: React.FC<ChannelControlProps> = ({
  onChannelUp,
  onChannelDown,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-between h-44 w-20 py-2 px-1 rounded-3xl bg-dark-card border border-dark-border shadow-lg">
      {/* Channel Up */}
      <button
        onClick={() => onChannelUp()}
        disabled={disabled}
        title="Channel Up"
        className="w-14 h-12 rounded-2xl bg-dark-hover hover:bg-white/10 active:bg-brand-primary active:text-white flex items-center justify-center text-gray-200 transition-all btn-tactile disabled:opacity-40"
      >
        <ChevronUp className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Label */}
      <div className="flex flex-col items-center my-1">
        <Radio className="w-4 h-4 text-brand-secondary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
          CH
        </span>
      </div>

      {/* Channel Down */}
      <button
        onClick={() => onChannelDown()}
        disabled={disabled}
        title="Channel Down"
        className="w-14 h-12 rounded-2xl bg-dark-hover hover:bg-white/10 active:bg-brand-primary active:text-white flex items-center justify-center text-gray-200 transition-all btn-tactile disabled:opacity-40"
      >
        <ChevronDown className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
