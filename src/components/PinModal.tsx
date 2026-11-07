import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Check, X } from 'lucide-react';
import { apiService } from '../services/api';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [pin, setPin] = useState(apiService.getPin() || '123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiService.verifyPin(pin);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Invalid PIN. Check your laptop terminal.');
      }
    } catch {
      setError('Failed to reach bridge server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl bg-dark-card border border-dark-border p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mx-auto mb-3 text-brand-secondary shadow-glow-primary">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Bridge Security PIN</h3>
        <p className="text-xs text-gray-400 mb-2 leading-relaxed">
          Enter the 6-digit access PIN shown on your laptop.
        </p>
        <div className="mb-4 inline-block px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-[11px] font-mono text-brand-secondary">
          Default Access PIN: <strong>123456</strong>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full py-3 text-center text-2xl font-mono tracking-widest rounded-2xl bg-dark-bg border border-dark-border focus:border-brand-primary text-white outline-none"
          />

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-900/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-dark-hover border border-dark-border text-gray-400 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-primary btn-tactile"
            >
              {loading ? 'Verifying...' : 'Unlock Bridge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
