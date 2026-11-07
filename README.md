# LG Remote — webOS Smart TV Web Application

A premium, modern, browser-based remote control application for LG webOS Smart TVs with a high-performance local Node.js bridge.

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and an **LG SSAP WebSocket Bridge**.

---

## 🌟 Key Features

- **LG webOS SSAP Protocol**: Direct communication using the official LG Second Screen Application Protocol.
- **Pointer Input WebSocket**: Real directional control (`UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`, `HOME`) through webOS pointer socket.
- **TV Pairing System**: Automatic prompt pairing on the TV screen with secure, local credential storage (`credentials.json`).
- **Real-Time Audio Controls**: Volume Up, Volume Down, Level Feedback, and Mute synced with actual TV responses.
- **Power Controls**: Supported `ssap://system/turnOff` command with clear explanation for Power On limitations.
- **TV Keyboard Input**: Send search queries, passwords, and text directly to the TV screen via `com.webos.service.ime`.
- **App Launcher**: Instant access to popular apps (YouTube, Netflix, Prime Video, Web Browser) and HDMI input sources.
- **Dual Operating Modes**:
  - **Mode A (Vercel Hosted Mode)**: Live UI showcase, interactive setup guides, and connection instructions.
  - **Mode B (Local Wi-Fi Remote Mode)**: Low-latency control from Android Chrome via the laptop's local bridge.
- **Security & Privacy**: 6-digit access PIN, credentials saved only on the laptop, zero telemetry, no cloud transmission of pairing keys.
- **PWA Ready**: Installable on Android with web app manifest and offline static caching.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │      LG SMART TV       │
                                  │    webOS (192.168.31.63)│
                                  └───────────▲────────────┘
                                              │
                      LG SSAP WebSocket       │ Pointer Input Socket
                      (ws://192.168.31.63:3000)│ (getPointerInputSocket)
                                              │
                                  ┌───────────┴────────────┐
                                  │   WINDOWS 11 LAPTOP    │
                                  │   Local Node.js Bridge │
                                  │   Port: 8787           │
                                  └───────────▲────────────┘
                                              │
                         HTTP & WebSocket API │ Serves Built React PWA
                         (http://192.168.31.199:8787)
                                              │
                                  ┌───────────┴────────────┐
                                  │     ANDROID PHONE      │
                                  │     Chrome Browser     │
                                  └────────────────────────┘
```

---

## 🚀 Quick Start (Windows 11)

### 1. One-Click Start
Double-click `start-local.bat` in the project root folder.
The script will automatically:
1. Verify Node.js is installed.
2. Install dependencies if missing.
3. Build the production React frontend.
4. Launch the bridge server on port `8787`.

### 2. Manual Command Line
```powershell
# 1. Install dependencies
npm install

# 2. Build the frontend
npm run build

# 3. Start the local bridge
npm run server
```

The terminal will print:
```
=============================================================
   LG WEBOS SMART TV REMOTE - LOCAL WI-FI BRIDGE
=============================================================
 Bridge Status:          RUNNING (Port 8787)
 Laptop Local Access:    http://localhost:8787

 Mobile (Android Chrome) Network Access:
   --> http://192.168.31.199:8787

 Access PIN (Required on Mobile): 112864
 Default TV IP:                   192.168.31.63
 Saved TV Pairing Status:         NOT PAIRED
=============================================================
```

---

## 📱 Connecting From Android Phone

1. Ensure your Android phone is connected to the **same home Wi-Fi** as your Windows 11 laptop and LG TV.
2. Open **Google Chrome** on your phone.
3. Type the network URL shown in your laptop terminal (e.g., `http://192.168.31.199:8787`).
4. Enter the **6-digit Access PIN** when prompted.
5. Tap **Connect to TV**.

---

## 📺 LG TV Pairing Instructions

1. On your LG TV, make sure **LG Connect Apps** is enabled:
   - Press **Settings** (Gear) on your physical Magic Remote.
   - Go to **All Settings → General → Devices → External Devices**.
   - Turn **ON** **"LG Connect Apps"** (or **"Connect Mobile Phone"** depending on webOS version).
2. Check your TV's IP address:
   - Go to **All Settings → Network → Wi-Fi Connection → Advanced Wi-Fi Settings**.
   - If your TV's IP is different from `192.168.31.63`, update it in the remote UI by tapping the edit pencil icon next to the IP address.
3. Click **Connect to TV** (or **Pair New TV**).
4. Look at the top-right corner of your TV screen. A prompt will appear:
   > *"LG Remote Bridge wants to connect to your TV. Allow?"*
5. Select **Yes / Allow** using your physical remote.
6. The pairing client key is automatically received and securely stored in `server/storage/credentials.json`. Subsequent connections will connect automatically without prompt!

---

## 🛡️ Windows 11 Firewall Configuration

If your mobile device cannot load `http://<LAPTOP_IP>:8787`:
1. Run PowerShell as **Administrator**.
2. Run this command to allow inbound TCP on port 8787:
```powershell
netsh advfirewall firewall add rule name="LG Remote Bridge" dir=in action=allow protocol=TCP localport=8787
```
3. Ensure your Wi-Fi network profile is set to **Private Network** in Windows Settings → Network & Internet → Wi-Fi.

---

## ☁️ Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Vercel will automatically detect `vite` and the included `vercel.json`.
4. Deploy!

### Mode A vs Mode B Notice on Vercel
When running on Vercel, the application operates in **Mode A (Cloud Preview Mode)**. Cloud servers cannot route packets to private residential RFC 1918 addresses (`192.168.x.x`). The UI clearly indicates this and allows entering your laptop's local bridge IP in the Settings dialog to control your TV.

---

## 📁 Project Structure

```
lg-remote/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Brand, mode badge, connection pill
│   │   ├── ConnectionCard.tsx      # IP editor, pair/connect/forget controls
│   │   ├── PowerButton.tsx         # Power off & Power on explanation
│   │   ├── NavigationPad.tsx       # Tactile circular D-pad + Home/Back/Menu
│   │   ├── VolumeControl.tsx       # Real-time Volume rockers and mute
│   │   ├── ChannelControl.tsx      # Channel up/down rockers
│   │   ├── KeyboardPanel.tsx       # Direct text input to webOS IME
│   │   ├── AppLauncher.tsx         # Quick launch streaming apps & inputs
│   │   ├── SettingsPanel.tsx       # PIN configuration, LAN IP diagnostics
│   │   ├── PinModal.tsx            # Secure mobile unlock modal
│   │   └── Toast.tsx               # Floating feedback notifications
│   ├── hooks/
│   │   └── useTVConnection.ts      # Connection state, status polling, haptics
│   ├── pages/
│   │   ├── RemotePage.tsx          # Main interactive remote interface
│   │   └── SetupPage.tsx           # Multi-tab setup, firewall, & testing guide
│   ├── services/
│   │   └── api.ts                  # REST API client with PIN auth
│   ├── styles/
│   │   └── index.css               # Tailwind directives & tactile button styles
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Main router and page manager
│   └── main.tsx                    # React DOM & Service Worker registration
│
├── server/
│   ├── index.ts                    # Express server on port 8787
│   ├── routes/
│   │   ├── connection.ts           # /api/health, /api/connect, /api/pair, etc.
│   │   └── commands.ts             # /api/command, /api/keyboard, /api/apps
│   ├── tv/
│   │   ├── LGWebOSClient.ts        # SSAP WebSocket client & request matcher
│   │   ├── SSAPProtocol.ts         # webOS endpoints, manifest & permissions
│   │   └── PointerInput.ts         # webOS pointer input WebSocket client
│   ├── security/
│   │   └── authentication.ts       # PIN generator, middleware & IP discovery
│   └── storage/
│       └── credentials.ts          # Safe backend credential store
│
├── public/
│   ├── manifest.webmanifest        # PWA manifest
│   ├── sw.js                       # Service worker (static asset caching)
│   ├── favicon.svg                 # SVG favicon
│   └── icons/                      # App icons (192px and 512px)
│
├── .gitignore                      # Protects credentials and node_modules
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── start-local.bat
└── README.md
```

---

## 🔌 API Reference

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/health` | GET | No | Checks bridge health and running mode |
| `/api/status` | GET | Yes / Local | Returns TV connection status, volume, and IP |
| `/api/auth/verify` | POST | No | Verifies 6-digit access PIN and issues session token |
| `/api/connect` | POST | Yes | Initiates SSAP connection using saved key if available |
| `/api/pair` | POST | Yes | Initiates registration handshake to prompt TV screen |
| `/api/disconnect` | POST | Yes | Disconnects active WebSocket connection |
| `/api/forget-pairing`| POST | Yes | Deletes saved pairing client key |
| `/api/command` | POST | Yes | Dispatches navigation, volume, channel, and power actions |
| `/api/keyboard` | POST | Yes | Sends text insertion or enter key to webOS IME |
| `/api/apps` | GET | Yes | Lists installed webOS apps from TV |
| `/api/apps/launch` | POST | Yes | Launches specific app ID or input |

---

## 🧪 Testing Checklist

- [x] **Frontend Layout**: Responsive mobile-first interface with zero horizontal scrolling.
- [x] **Local Bridge Startup**: Node.js bridge starts on port `8787` and auto-discovers LAN IP.
- [x] **PIN Security**: Unauthorized mobile requests are blocked; verified PIN grants control.
- [x] **Editable IP**: Users can change default `192.168.31.63` to any TV IP.
- [x] **SSAP Registration**: Manifest with required permissions is dispatched to `ws://TV_IP:3000`.
- [x] **Pairing Storage**: TV `client-key` is securely stored in `server/storage/credentials.json`.
- [x] **Pointer Input**: Secondary socket is negotiated for `UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`.
- [x] **Volume & Mute**: Direct volume queries and changes via `ssap://audio/...`.
- [x] **Power Off**: Supported `ssap://system/turnOff` with confirmation prompt.
- [x] **Production Build**: Clean TypeScript compilation and Vite build to `dist/`.
- [x] **Vercel Readiness**: `vercel.json` configured for SPA routing.

---

## ⚠️ Known Compatibility Limitations

1. **Power On**: Once an LG TV is powered off, its SSAP WebSocket server terminates to preserve standby electricity. WebSocket commands cannot power on the TV. Turning the TV on over the network requires sending a Wake-on-LAN (WOL) magic packet to the TV's network MAC address.
2. **Wi-Fi Subnet**: The laptop and LG TV must be on the same subnet (e.g. `192.168.31.x`). Some mesh Wi-Fi routers place 2.4 GHz and 5 GHz devices on isolated guest subnets; ensure "AP Isolation" or "Guest Mode" is disabled.
3. **PWA Offline**: The PWA caches static styling and scripts; however, live TV communication always requires the laptop bridge to remain running on the network.
