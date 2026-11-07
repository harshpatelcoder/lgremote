import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  KeyRound,
  Globe,
  Vibrate,
  Info,
  X,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { apiService } from '../services/api';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  localIps: string[];
  isBridgeOnline: boolean;
  onSettingsSaved: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  localIps,
  isBridgeOnline,
  onSettingsSaved,
}) => {
  const [bridgeUrl, setBridgeUrl] = useState(apiService.getCustomBridgeUrl());
  const [pin, setPin] = useState(apiService.getPin());
  const [haptic, setHaptic] = useState(apiService.getHapticEnabled());
  const [pinVerifying, setPinVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    apiService.setCustomBridgeUrl(bridgeUrl);
    apiService.setPin(pin);
    apiService.setHapticEnabled(haptic);

    if (pin.trim()) {
      setPinVerifying(true);
      const res = await apiService.verifyPin(pin);
      setPinVerifying(false);
      if (res.success) {
        setVerifyMessage({ text: 'PIN verified successfully!', isError: false });
        setTimeout(() => {
          onSettingsSaved();
          onClose();
        }, 800);
        return;
      } else {
        setVerifyMessage({ text: res.error || 'Invalid PIN', isError: true });
        return;
      }
    }

    onSettingsSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-dark-card border border-dark-border p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-secondary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bridge & Remote Settings</h3>
              <p className="text-[11px] text-gray-400">Configure connection and security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bridge PIN */}
          <div>
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-brand-secondary" />
              Bridge Access PIN (6-digit)
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border focus:border-brand-primary text-white text-sm outline-none font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Check your laptop's terminal running <code>npm run server</code> for the 6-digit access PIN.
            </p>
          </div>

          {/* Custom Bridge URL */}
          <div>
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-brand-secondary" />
              Local Bridge Server URL
            </label>
            <input
              type="text"
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              placeholder="http://192.168.31.X:8787 (leave empty if on same host)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border focus:border-brand-primary text-white text-xs outline-none font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              If accessing via Vercel, enter your laptop's Wi-Fi IP and port 8787.
            </p>
          </div>

          {/* Detected Laptop IPs */}
          {localIps.length > 0 && (
            <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border text-xs">
              <span className="font-semibold text-gray-300 block mb-1">Detected Laptop LAN IP(s):</span>
              <div className="space-y-1">
                {localIps.map((ip) => (
                  <div key={ip} className="flex items-center justify-between text-gray-400 font-mono text-[11px]">
                    <span>http://{ip}:8787</span>
                    <button
                      onClick={() => setBridgeUrl(`http://${ip}:8787`)}
                      className="text-brand-secondary hover:underline text-[10px]"
                    >
                      Use this
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Haptic Feedback Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-dark-border">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-brand-secondary" />
              <div>
                <span className="text-xs font-medium text-white block">Haptic Touch Feedback</span>
                <span className="text-[11px] text-gray-400">Vibrate on button press (Android)</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={haptic}
              onChange={(e) => setHaptic(e.target.checked)}
              className="w-4 h-4 accent-brand-primary cursor-pointer"
            />
          </div>

          {verifyMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                verifyMessage.isError
                  ? 'bg-rose-950/70 border border-rose-800 text-rose-300'
                  : 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
              }`}
            >
              {verifyMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{verifyMessage.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-dark-hover border border-dark-border text-gray-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={pinVerifying}
              className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-purple-600 text-white text-xs font-semibold shadow-glow-primary btn-tactile"
            >
              {pinVerifying ? 'Verifying PIN...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
