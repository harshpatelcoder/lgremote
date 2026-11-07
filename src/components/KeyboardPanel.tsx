import React, { useState } from 'react';
import { Keyboard, Send, CornerDownLeft, Delete, X } from 'lucide-react';

interface KeyboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendEnter: () => Promise<void>;
  onDeleteChar: () => Promise<void>;
  disabled?: boolean;
}

export const KeyboardPanel: React.FC<KeyboardPanelProps> = ({
  isOpen,
  onClose,
  onSendText,
  onSendEnter,
  onDeleteChar,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendText(inputText);
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleEnterKey = async () => {
    try {
      await onSendEnter();
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await onDeleteChar();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-dark-card border border-dark-border p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-secondary">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">TV Keyboard Input</h3>
              <p className="text-[11px] text-gray-400">Type text directly into your LG TV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Search movies, type password, URL..."
              disabled={disabled || isSending}
              className="w-full px-4 py-3 rounded-2xl bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white text-sm placeholder-gray-500 outline-none transition-all pr-12"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="flex-1 py-2.5 px-3 rounded-xl bg-dark-hover hover:bg-dark-border text-gray-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 btn-tactile"
            >
              <Delete className="w-4 h-4" />
              Backspace
            </button>
            <button
              type="button"
              onClick={handleEnterKey}
              disabled={disabled}
              className="flex-1 py-2.5 px-3 rounded-xl bg-dark-hover hover:bg-dark-border text-gray-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 btn-tactile"
            >
              <CornerDownLeft className="w-4 h-4" />
              Enter Key
            </button>
            <button
              type="submit"
              disabled={disabled || !inputText.trim() || isSending}
              className="flex-1 py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-glow-primary btn-tactile"
            >
              <Send className="w-4 h-4" />
              Send Text
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
