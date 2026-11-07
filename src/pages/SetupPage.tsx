import React, { useState } from 'react';
import {
  ArrowLeft,
  Laptop,
  Smartphone,
  Tv,
  Shield,
  Cloud,
  CheckCircle2,
  Terminal,
  Wifi,
  Key,
  Flame,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface SetupPageProps {
  onBack: () => void;
  localIps: string[];
}

export const SetupPage: React.FC<SetupPageProps> = ({ onBack, localIps }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'bridge' | 'tv' | 'firewall' | 'vercel' | 'checklist'>('quick');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0B0D12]/90 backdrop-blur-md border-b border-dark-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-xs text-gray-300 hover:text-white transition-all btn-tactile"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Remote</span>
          </button>
          <h2 className="text-sm font-semibold text-white">LG Remote Setup & Guide</h2>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {[
            { id: 'quick', label: 'Quick Start', icon: Flame },
            { id: 'bridge', label: 'Local Bridge', icon: Laptop },
            { id: 'tv', label: 'LG TV Pairing', icon: Tv },
            { id: 'firewall', label: 'Win 11 Firewall', icon: Shield },
            { id: 'vercel', label: 'Vercel vs Local', icon: Cloud },
            { id: 'checklist', label: 'Testing Checklist', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-glow-primary'
                    : 'bg-dark-card hover:bg-dark-hover text-gray-400 hover:text-gray-200 border border-dark-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Quick Start */}
        {activeTab === 'quick' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl glass-panel border border-brand-primary/40 shadow-glow-primary">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-brand-secondary" />
                3-Step Quick Start
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Control your LG webOS Smart TV directly from Android Chrome via your Windows 11 laptop bridge.
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/30 text-brand-secondary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h4 className="text-sm font-semibold text-white">Start the Local Bridge on Laptop</h4>
              </div>
              <p className="text-xs text-gray-400">
                Double-click <code>start-local.bat</code> or run this in Command Prompt / PowerShell:
              </p>
              <div className="relative p-3 rounded-xl bg-dark-bg border border-dark-border font-mono text-xs text-brand-secondary flex items-center justify-between">
                <span>npm run start</span>
                <button
                  onClick={() => copyToClipboard('npm run start')}
                  className="p-1 hover:text-white"
                >
                  {copiedText === 'npm run start' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                The terminal will display your laptop's local IP (e.g. <code>http://192.168.31.X:8787</code>) and 6-digit access PIN.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/30 text-brand-secondary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h4 className="text-sm font-semibold text-white">Open Remote on Android Phone</h4>
              </div>
              <p className="text-xs text-gray-400">
                Connect your Android phone to the same home Wi-Fi, open Chrome, and navigate to:
              </p>
              <div className="p-3 rounded-xl bg-dark-bg border border-dark-border font-mono text-xs text-emerald-400">
                http://{localIps[0] || 'YOUR_LAPTOP_IP'}:8787
              </div>
              <p className="text-[11px] text-gray-500">
                Enter the 6-digit PIN when prompted to unlock secure remote controls.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary/30 text-brand-secondary font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h4 className="text-sm font-semibold text-white">Approve Connection on LG TV</h4>
              </div>
              <p className="text-xs text-gray-400">
                Click <strong>"Connect to TV"</strong> (or "Pair New TV"). A prompt will appear in the top-right corner of your LG TV:
              </p>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-brand-primary/30 text-xs text-brand-secondary">
                "LG Remote Bridge wants to connect to your TV. Allow?" → Click <strong>Yes / Allow</strong> with your Magic Remote.
              </div>
              <p className="text-[11px] text-gray-500">
                The pairing key is automatically saved on your laptop. Future connections connect instantly!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Local Bridge Setup */}
        {activeTab === 'bridge' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-brand-secondary" />
                Windows 11 Local Bridge Setup
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                The local bridge runs on your Windows 11 laptop and communicates with the LG TV over the Second Screen Application Protocol (SSAP) via WebSocket (port 3000).
              </p>

              <h4 className="text-xs font-semibold text-white pt-2">Prerequisites:</h4>
              <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                <li>Node.js v18 or higher (v24 is installed and verified on this system)</li>
                <li>Windows 11 on the same Wi-Fi network as the LG Smart TV</li>
              </ul>

              <h4 className="text-xs font-semibold text-white pt-2">Available Startup Commands:</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono">
                  <span className="text-gray-500"># Development mode (Vite + Server with hot reload)</span>
                  <div className="text-brand-secondary">npm run dev</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono">
                  <span className="text-gray-500"># Production build & serve on port 8787</span>
                  <div className="text-brand-secondary">npm run start</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono">
                  <span className="text-gray-500"># Start server only (after dist is built)</span>
                  <div className="text-brand-secondary">npm run server</div>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-white pt-2">Finding your Laptop's IP manually:</h4>
              <p className="text-xs text-gray-400">
                Open Command Prompt or PowerShell and type:
              </p>
              <div className="p-3 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono text-emerald-400">
                ipconfig
              </div>
              <p className="text-[11px] text-gray-500">
                Look for "Wireless LAN adapter Wi-Fi" → "IPv4 Address" (e.g. <code>192.168.31.X</code>).
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: LG TV Pairing */}
        {activeTab === 'tv' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-brand-secondary" />
                LG webOS TV Pairing & Settings
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                LG webOS TVs have built-in security to prevent unauthorized network control. Follow these settings on your TV:
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border">
                  <h4 className="text-xs font-semibold text-brand-secondary mb-1">1. Enable LG Connect Apps / Mobile TV On</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    On your LG TV with physical remote:
                    <br />• Press <strong>Settings (Gear)</strong> on remote.
                    <br />• Navigate to <strong>All Settings → General → Devices → External Devices</strong>.
                    <br />• Turn ON <strong>"LG Connect Apps"</strong> or <strong>"Connect Mobile Phone"</strong>.
                    <br />• Turn ON <strong>"Turn on TV via Wi-Fi"</strong> (if available).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border">
                  <h4 className="text-xs font-semibold text-brand-secondary mb-1">2. Verify TV IP Address</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Navigate to <strong>All Settings → Network → Wi-Fi Connection → Advanced Wi-Fi Settings</strong>.
                    <br />Note down the <strong>IPv4 Address</strong> (initial configured default is <code>192.168.31.63</code>). If it differs, update it in the Connection card on the remote screen.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border">
                  <h4 className="text-xs font-semibold text-brand-secondary mb-1">3. Authorize Remote Prompt</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    When you click <strong>Connect</strong> or <strong>Pair New TV</strong>, a prompt will appear on your TV screen. Use your LG remote to select <strong>Yes / Allow</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Windows 11 Firewall */}
        {activeTab === 'firewall' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Windows 11 Firewall Configuration
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                By default, Windows 11 Defender Firewall may prompt you when Node.js binds to port 8787. Make sure to allow Private networks so your Android phone can reach the laptop.
              </p>

              <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border space-y-2 text-xs">
                <h4 className="font-semibold text-white">One-liner to allow Port 8787 in PowerShell (Run as Administrator):</h4>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-brand-secondary flex items-center justify-between">
                  <span className="truncate pr-2">netsh advfirewall firewall add rule name="LG Remote Bridge" dir=in action=allow protocol=TCP localport=8787</span>
                  <button
                    onClick={() => copyToClipboard('netsh advfirewall firewall add rule name="LG Remote Bridge" dir=in action=allow protocol=TCP localport=8787')}
                    className="p-1 hover:text-white shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-400">
                <p><strong>Manual GUI steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open Windows Settings → Privacy & Security → Windows Security → Firewall & network protection.</li>
                  <li>Click "Allow an app through firewall".</li>
                  <li>Ensure <strong>Node.js: Server-side JavaScript</strong> has the <strong>Private</strong> box checked.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Vercel vs Local */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-brand-secondary" />
                Operating Modes: Vercel vs Local Bridge
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                This project has two operating modes designed according to networking fundamentals:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-dark-bg border border-dark-border">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                    <Cloud className="w-3.5 h-3.5" /> MODE A: Vercel Hosted
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Hosted on Vercel's global CDN. Cloud servers cannot reach private RFC 1918 addresses (<code>192.168.x.x</code>). It serves as a live UI showcase, connection manual, and can optionally bridge to your local bridge if cross-LAN routing is configured.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-bg border border-emerald-800/60 bg-emerald-950/20">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                    <Wifi className="w-3.5 h-3.5" /> MODE B: Local Wi-Fi Bridge (Active)
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Node.js bridge running on your laptop. Both laptop and Android phone are on the same Wi-Fi. The laptop opens an SSAP WebSocket directly to the LG TV, allowing real, low-latency control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Testing Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Comprehensive Manual Testing Checklist
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Verify each test step when interacting with your live LG webOS Smart TV:
              </p>

              <div className="space-y-2 pt-1 text-xs text-gray-300">
                {[
                  '1. Frontend opens properly in desktop and mobile viewport',
                  '2. Local bridge starts successfully on port 8787 with clear IP and PIN banner',
                  '3. Mobile Android Chrome opens http://LAPTOP_IP:8787',
                  '4. TV IP address is editable from UI',
                  '5. "Connect to TV" sends SSAP handshake to ws://192.168.31.63:3000',
                  '6. TV displays pairing approval request on screen',
                  '7. TV client key is safely saved in server/storage/credentials.json',
                  '8. Reconnection works automatically without repeated prompts',
                  '9. Volume Up, Volume Down and Mute update TV sound and UI',
                  '10. Circular D-pad (Up, Down, Left, Right, OK) navigates webOS UI',
                  '11. Back button returns to previous screen on TV',
                  '12. Home button opens webOS Home Dashboard bar',
                  '13. App Launcher opens YouTube, Netflix or HDMI input',
                  '14. Power Off sends ssap://system/turnOff and puts TV to sleep',
                  '15. Disconnect and Forget Pairing clear active sessions',
                  '16. Vercel frontend builds without errors (npm run build)',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-dark-bg/60 border border-dark-border">
                    <CheckCircle2 className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
