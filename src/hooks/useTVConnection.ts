import { useState, useEffect, useCallback, useRef } from 'react';
import { TVState, OperatingMode } from '../types';
import { apiService } from '../services/api';

const DEFAULT_STATE: TVState = {
  ip: apiService.getSavedTvIp(),
  status: 'DISCONNECTED',
  isPaired: false,
  volume: 15,
  muted: false,
};

export function useTVConnection() {
  const [tvState, setTvState] = useState<TVState>(DEFAULT_STATE);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('LOCAL_BRIDGE');
  const [isBridgeOnline, setIsBridgeOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [localIps, setLocalIps] = useState<string[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Haptic feedback trigger
  const triggerHaptic = useCallback(() => {
    if (apiService.getHapticEnabled() && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore if device disallows vibrate
      }
    }
  }, []);

  // Health and status polling
  const refreshStatus = useCallback(async () => {
    try {
      const health = await apiService.checkBridgeHealth();
      if (!health) {
        setIsBridgeOnline(false);
        setOperatingMode('VERCEL_HOSTED');
        setIsLoading(false);
        return;
      }

      setIsBridgeOnline(true);
      setOperatingMode('LOCAL_BRIDGE');

      const { state, localIps } = await apiService.getStatus();
      if (state) {
        setTvState(state);
      }
      if (localIps) {
        setLocalIps(localIps);
      }
      setLastError(null);
    } catch (err: any) {
      if (err.message && err.message.includes('PIN')) {
        setIsPinModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    // Poll status periodically (every 2.5s)
    pollTimerRef.current = setInterval(refreshStatus, 2500);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [refreshStatus]);

  // Connect
  const connectTV = useCallback(async (ip?: string) => {
    triggerHaptic();
    const targetIp = ip || tvState.ip;
    apiService.setSavedTvIp(targetIp);
    try {
      setTvState((prev) => ({ ...prev, status: 'CONNECTING', ip: targetIp, errorMessage: undefined }));
      const res = await apiService.connect(targetIp);
      if (res.data) {
        setTvState(res.data);
      }
      setLastError(null);
    } catch (err: any) {
      setLastError(err.message || 'Connection failed');
      setTvState((prev) => ({ ...prev, status: 'ERROR', errorMessage: err.message }));
      throw err;
    }
  }, [tvState.ip, triggerHaptic]);

  // Explicit Pair
  const pairTV = useCallback(async (ip?: string) => {
    triggerHaptic();
    const targetIp = ip || tvState.ip;
    try {
      setTvState((prev) => ({ ...prev, status: 'WAITING_FOR_TV_APPROVAL', ip: targetIp }));
      const res = await apiService.pair(targetIp);
      if (res.data) {
        setTvState(res.data);
      }
    } catch (err: any) {
      setLastError(err.message || 'Pairing failed');
      setTvState((prev) => ({ ...prev, status: 'ERROR', errorMessage: err.message }));
      throw err;
    }
  }, [tvState.ip, triggerHaptic]);

  // Disconnect
  const disconnectTV = useCallback(async () => {
    triggerHaptic();
    try {
      const res = await apiService.disconnect();
      if (res.data) {
        setTvState(res.data);
      }
    } catch (err: any) {
      setLastError(err.message);
    }
  }, [triggerHaptic]);

  // Forget Pairing
  const forgetPairing = useCallback(async () => {
    triggerHaptic();
    try {
      const res = await apiService.forgetPairing(tvState.ip);
      if (res.data) {
        setTvState(res.data);
      }
    } catch (err: any) {
      setLastError(err.message);
    }
  }, [tvState.ip, triggerHaptic]);

  // Send Command
  const sendCommand = useCallback(async (action: string, payload?: any) => {
    triggerHaptic();
    if (!isBridgeOnline) {
      throw new Error('Local bridge is not running. Live TV control requires the Node.js bridge on your laptop.');
    }
    if (tvState.status !== 'CONNECTED') {
      throw new Error('TV is not connected. Please connect or pair first.');
    }

    try {
      const res = await apiService.sendCommand(action, payload);
      if (res.status) {
        setTvState(res.status);
      }
      return res;
    } catch (err: any) {
      setLastError(err.message || `Command ${action} failed`);
      throw err;
    }
  }, [isBridgeOnline, tvState.status, triggerHaptic]);

  // Send Keyboard
  const sendKeyboard = useCallback(async (type: 'insert' | 'enter' | 'delete', text?: string, count?: number) => {
    triggerHaptic();
    return await apiService.sendKeyboard(type, text, count);
  }, [triggerHaptic]);

  return {
    tvState,
    operatingMode,
    isBridgeOnline,
    isLoading,
    lastError,
    localIps,
    isPinModalOpen,
    setIsPinModalOpen,
    setTvState,
    connectTV,
    pairTV,
    disconnectTV,
    forgetPairing,
    sendCommand,
    sendKeyboard,
    refreshStatus,
    triggerHaptic,
    clearError: () => setLastError(null),
  };
}
