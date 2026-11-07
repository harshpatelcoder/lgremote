import React, { useState } from 'react';
import {
  Keyboard,
  PlaySquare,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ConnectionCard } from '../components/ConnectionCard';
import { PowerButton } from '../components/PowerButton';
import { NavigationPad } from '../components/NavigationPad';
import { VolumeControl } from '../components/VolumeControl';
import { ChannelControl } from '../components/ChannelControl';
import { KeyboardPanel } from '../components/KeyboardPanel';
import { AppLauncher } from '../components/AppLauncher';
import { SettingsPanel } from '../components/SettingsPanel';
import { PinModal } from '../components/PinModal';
import { useTVConnection } from '../hooks/useTVConnection';
import { ToastMessage } from '../components/Toast';

interface RemotePageProps {
  onOpenSetup: () => void;
  onAddToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const RemotePage: React.FC<RemotePageProps> = ({ onOpenSetup, onAddToast }) => {
  const {
    tvState,
    operatingMode,
    isBridgeOnline,
    localIps,
    isPinModalOpen,
    setIsPinModalOpen,
    connectTV,
    pairTV,
    disconnectTV,
    forgetPairing,
    sendCommand,
    sendKeyboard,
    refreshStatus,
  } = useTVConnection();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const isConnected = tvState.status === 'CONNECTED';

  // Safe command wrapper with toast feedback
  const handleCommand = async (action: string, payload?: any) => {
    try {
      await sendCommand(action, payload);
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes('PIN') ||
          err.message.includes('Unauthorized') ||
          err.message.includes('AUTH_REQUIRED'))
      ) {
        setIsPinModalOpen(true);
        return;
      }
      onAddToast({ type: 'error', text: err.message || `Failed to execute ${action}` });
    }
  };

  const handlePowerOff = async () => {
    try {
      await sendCommand('POWER_OFF');
      onAddToast({ type: 'info', text: 'Power off command sent to LG TV' });
    } catch (err: any) {
      onAddToast({ type: 'error', text: err.message });
    }
  };

  const handleTogglePlay = async () => {
    try {
      if (isPlaying) {
        await handleCommand('MEDIA_PAUSE');
        setIsPlaying(false);
      } else {
        await handleCommand('MEDIA_PLAY');
        setIsPlaying(true);
      }
    } catch {}
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0D12] text-white">
      {/* Sticky Header */}
      <Header
        status={tvState.status}
        operatingMode={operatingMode}
        isBridgeOnline={isBridgeOnline}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetup={onOpenSetup}
      />

      {/* Main Remote Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-3 flex flex-col items-center">
        {/* Connection & Setup Card */}
        <ConnectionCard
          tvState={tvState}
          isBridgeOnline={isBridgeOnline}
          operatingMode={operatingMode}
          onConnect={connectTV}
          onPair={pairTV}
          onDisconnect={disconnectTV}
          onForgetPairing={forgetPairing}
          onOpenSetup={onOpenSetup}
        />

        {/* Top Control Bar: Power */}
        <PowerButton onPowerOff={handlePowerOff} disabled={!isConnected} />

        {/* Navigation Section (D-Pad + Home/Back/Settings) */}
        <div className="w-full flex justify-center">
          <NavigationPad
            onNavigate={(dir) => handleCommand(dir)}
            onBack={() => handleCommand('BACK')}
            onHome={() => handleCommand('HOME')}
            onSettings={() => handleCommand('MENU')}
            onInput={() => handleCommand('INPUT')}
            onMute={() => handleCommand('MUTE')}
            isMuted={tvState.muted}
            disabled={!isConnected}
          />
        </div>

        {/* Volume & Channel Rockers + Media strip */}
        <div className="w-full max-w-sm mt-3 px-2 flex items-center justify-between gap-4">
          {/* Volume Control Rocker */}
          <VolumeControl
            volume={tvState.volume}
            muted={tvState.muted}
            onVolumeUp={() => handleCommand('VOLUME_UP')}
            onVolumeDown={() => handleCommand('VOLUME_DOWN')}
            onSetVolume={(vol) => handleCommand('SET_VOLUME', { volume: vol })}
            onToggleMute={() => handleCommand('MUTE')}
            disabled={!isConnected}
          />

          {/* Center Media Mini Controls */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCommand('MEDIA_REWIND')}
                disabled={!isConnected}
                title="Rewind"
                className="p-3 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white disabled:opacity-40 transition-all btn-tactile"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                disabled={!isConnected}
                title={isPlaying ? 'Pause' : 'Play'}
                className="p-4 rounded-2xl bg-brand-primary hover:bg-purple-600 text-white shadow-glow-primary disabled:opacity-40 transition-all btn-tactile"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => handleCommand('MEDIA_FAST_FORWARD')}
                disabled={!isConnected}
                title="Fast Forward"
                className="p-3 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white disabled:opacity-40 transition-all btn-tactile"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Quick App launcher button */}
            <button
              onClick={() => setIsAppLauncherOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-xs text-brand-secondary font-medium transition-all btn-tactile"
            >
              <PlaySquare className="w-3.5 h-3.5" />
              <span>Apps & Inputs</span>
            </button>
          </div>

          {/* Channel Control Rocker */}
          <ChannelControl
            onChannelUp={() => handleCommand('CHANNEL_UP')}
            onChannelDown={() => handleCommand('CHANNEL_DOWN')}
            disabled={!isConnected}
          />
        </div>

        {/* Bottom Floating Bar */}
        <div className="w-full max-w-sm mt-6 mb-4 grid grid-cols-2 gap-3 px-2">
          <button
            onClick={() => setIsKeyboardOpen(true)}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-200 text-xs font-semibold disabled:opacity-40 shadow-sm transition-all btn-tactile"
          >
            <Keyboard className="w-4 h-4 text-brand-secondary" />
            <span>TV Keyboard</span>
          </button>

          <button
            onClick={() => handleCommand('TOAST', { message: 'LG Remote Connected!' })}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-200 text-xs font-semibold disabled:opacity-40 shadow-sm transition-all btn-tactile"
          >
            <MessageSquare className="w-4 h-4 text-brand-secondary" />
            <span>Send Toast</span>
          </button>
        </div>
      </main>

      {/* Modals */}
      <KeyboardPanel
        isOpen={isKeyboardOpen}
        onClose={() => setIsKeyboardOpen(false)}
        onSendText={async (text) => {
          await sendKeyboard('insert', text);
          onAddToast({ type: 'success', text: `Sent text to TV: "${text}"` });
        }}
        onSendEnter={async () => {
          await sendKeyboard('enter');
        }}
        onDeleteChar={async () => {
          await sendKeyboard('delete');
        }}
        disabled={!isConnected}
      />

      <AppLauncher
        isOpen={isAppLauncherOpen}
        onClose={() => setIsAppLauncherOpen(false)}
        onLaunch={async (appId) => {
          await handleCommand('LAUNCH_APP', { appId });
          onAddToast({ type: 'success', text: `Launching app on TV` });
        }}
        isConnected={isConnected}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        localIps={localIps}
        isBridgeOnline={isBridgeOnline}
        onSettingsSaved={() => {
          refreshStatus();
          onAddToast({ type: 'success', text: 'Settings updated' });
        }}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onSuccess={() => {
          setIsPinModalOpen(false);
          refreshStatus();
          onAddToast({ type: 'success', text: 'Bridge PIN verified' });
        }}
        onCancel={() => setIsPinModalOpen(false)}
      />
    </div>
  );
};
