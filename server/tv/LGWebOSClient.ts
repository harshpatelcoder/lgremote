import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {
  SSAP_PORTS,
  SSAP_URIS,
  createRegistrationPayload,
} from './SSAPProtocol';
import { PointerInput, PointerButton } from './PointerInput';
import { credentialsStore } from '../storage/credentials';

export type TVConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'WAITING_FOR_TV_APPROVAL'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface TVState {
  ip: string;
  status: TVConnectionStatus;
  isPaired: boolean;
  volume: number;
  muted: boolean;
  currentAppId?: string;
  errorMessage?: string;
  lastConnectedAt?: string;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timer: NodeJS.Timeout;
}

export class LGWebOSClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pointer: PointerInput = new PointerInput();
  private tvIp: string = '192.168.31.63';
  private status: TVConnectionStatus = 'DISCONNECTED';
  private errorMessage?: string;
  private reqCounter: number = 0;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private volume: number = 15;
  private muted: boolean = false;
  private currentAppId?: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(defaultIp: string = '192.168.31.63') {
    super();
    this.tvIp = defaultIp;
  }

  public getStatus(): TVState {
    return {
      ip: this.tvIp,
      status: this.status,
      isPaired: credentialsStore.hasPairing(this.tvIp),
      volume: this.volume,
      muted: this.muted,
      currentAppId: this.currentAppId,
      errorMessage: this.errorMessage,
    };
  }

  private setStatus(status: TVConnectionStatus, errorMsg?: string) {
    this.status = status;
    this.errorMessage = errorMsg;
    console.log(`[LG TV Client] Status: ${status}${errorMsg ? ` (${errorMsg})` : ''}`);
    this.emit('statusChange', this.getStatus());
  }

  /**
   * Connect and initiate registration/pairing with the TV
   */
  public async connect(targetIp?: string): Promise<boolean> {
    if (targetIp) {
      this.tvIp = targetIp.trim();
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.status === 'CONNECTED') {
        return true;
      }
    }

    this.cleanup();
    this.setStatus('CONNECTING');

    const creds = credentialsStore.getCredentials(this.tvIp);
    const clientKey = creds ? creds.clientKey : null;

    if (!clientKey) {
      this.setStatus('WAITING_FOR_TV_APPROVAL');
    }

    try {
      await this.initiateWebSocket(this.tvIp, clientKey);
      return true;
    } catch (err: any) {
      console.error('[LG TV Client] Connection failed:', err.message || err);
      this.setStatus('ERROR', err.message || 'Failed to connect to LG TV');
      return false;
    }
  }

  private initiateWebSocket(ip: string, clientKey: string | null): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${ip}:${SSAP_PORTS.PLAIN}`;
      console.log(`[LG TV Client] Opening WebSocket connection to ${url}...`);

      let connectionTimeout = setTimeout(() => {
        if (this.status === 'CONNECTING' || this.status === 'WAITING_FOR_TV_APPROVAL') {
          this.cleanup();
          reject(new Error(`Connection to TV at ${ip} timed out. Ensure TV is ON and on the same Wi-Fi network.`));
        }
      }, 15000);

      try {
        this.ws = new WebSocket(url, {
          handshakeTimeout: 7000,
          rejectUnauthorized: false,
        });

        this.ws.on('open', () => {
          console.log('[LG TV Client] WebSocket connected, sending handshake registration...');
          this.sendRegistration(clientKey, resolve, reject, connectionTimeout);
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleIncomingMessage(data.toString());
        });

        this.ws.on('error', (err: any) => {
          clearTimeout(connectionTimeout);
          console.error('[LG TV Client] WebSocket error:', err.message);
          this.cleanup();
          reject(new Error(`WebSocket error: ${err.message || 'Connection refused by TV'}`));
        });

        this.ws.on('close', (code, reason) => {
          clearTimeout(connectionTimeout);
          console.log(`[LG TV Client] WebSocket closed (code: ${code}, reason: ${reason.toString() || 'none'})`);
          const wasConnected = this.status === 'CONNECTED';
          this.cleanup();
          if (wasConnected) {
            this.handleUnexpectedDisconnect();
          }
        });
      } catch (err: any) {
        clearTimeout(connectionTimeout);
        this.cleanup();
        reject(err);
      }
    });
  }

  private sendRegistration(
    clientKey: string | null,
    resolve: () => void,
    reject: (err: Error) => void,
    timeoutTimer: NodeJS.Timeout
  ) {
    const regPayload = createRegistrationPayload(clientKey);
    const regMsg = {
      type: 'register',
      id: 'register_0',
      payload: regPayload,
    };

    // Register temporary handler for register_0
    this.pendingRequests.set('register_0', {
      resolve: async (res) => {
        clearTimeout(timeoutTimer);
        const newKey = res['client-key'];
        if (newKey) {
          credentialsStore.saveCredentials(this.tvIp, newKey);
        }

        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;

        // Initialize pointer socket & fetch initial audio status
        this.setupPointerSocket().catch((err) => {
          console.warn('[LG TV Client] Pointer input socket setup warning:', err.message);
        });
        this.fetchAudioStatus().catch(() => {});

        resolve();
      },
      reject: (err) => {
        clearTimeout(timeoutTimer);
        this.setStatus('ERROR', err.message || 'Registration rejected');
        reject(err);
      },
      timer: timeoutTimer,
    });

    this.ws?.send(JSON.stringify(regMsg));
  }

  private handleIncomingMessage(raw: string) {
    try {
      const msg = JSON.parse(raw);
      const { id, type, payload, error } = msg;

      // Handle pairing / registration
      if (type === 'registered') {
        const pending = this.pendingRequests.get('register_0');
        if (pending) {
          this.pendingRequests.delete('register_0');
          pending.resolve(payload);
        }
        return;
      }

      // Handle matching requests
      if (id && this.pendingRequests.has(id)) {
        const pending = this.pendingRequests.get(id)!;
        this.pendingRequests.delete(id);
        clearTimeout(pending.timer);

        if (error || (payload && payload.returnValue === false)) {
          const errMsg = error || payload?.errorText || 'TV command returned failure';
          pending.reject(new Error(errMsg));
        } else {
          pending.resolve(payload);
        }
        return;
      }

      // Handle subscribed events (e.g. volume or mute changes)
      if (payload) {
        if (typeof payload.volume === 'number') {
          this.volume = payload.volume;
        }
        if (typeof payload.muted === 'boolean') {
          this.muted = payload.muted;
        }
        if (payload.appId) {
          this.currentAppId = payload.appId;
        }
      }
    } catch (e) {
      // Non-JSON message or malformed response
    }
  }

  /**
   * Request pointer input socket from SSAP and connect pointer input
   */
  private async setupPointerSocket(): Promise<void> {
    try {
      const response = await this.sendRequest(SSAP_URIS.GET_POINTER_INPUT_SOCKET);
      if (response && response.socketPath) {
        await this.pointer.connect(response.socketPath);
        console.log('[LG TV Client] Pointer Input WebSocket successfully connected');
      }
    } catch (e: any) {
      console.warn('[LG TV Client] Could not acquire pointer socket:', e.message);
    }
  }

  /**
   * Send a generic SSAP request with timeout
   */
  public sendRequest(uri: string, payload: Record<string, any> = {}): Promise<any> {
    if (this.status !== 'CONNECTED' || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('TV is not connected'));
    }

    const id = `req_${++this.reqCounter}`;
    const message = {
      id,
      type: 'request',
      uri,
      payload,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`TV command timeout for ${uri}`));
        }
      }, 8000);

      this.pendingRequests.set(id, { resolve, reject, timer });

      this.ws?.send(JSON.stringify(message), (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingRequests.delete(id);
          reject(err);
        }
      });
    });
  }

  /**
   * High-level Navigation commands via pointer socket or SSAP fallback
   */
  public async sendNavigation(button: PointerButton): Promise<boolean> {
    if (this.status !== 'CONNECTED') {
      throw new Error('TV is not connected');
    }

    // Try pointer socket first (standard for modern webOS navigation)
    if (this.pointer.isConnected()) {
      try {
        await this.pointer.sendButton(button);
        return true;
      } catch (err) {
        console.warn('[LG TV Client] Pointer socket sendButton error, trying reconnect...');
      }
    }

    // Fallback: Reconnect pointer socket and retry
    try {
      await this.setupPointerSocket();
      await this.pointer.sendButton(button);
      return true;
    } catch (err: any) {
      throw new Error(`Failed to send navigation button ${button}: ${err.message}`);
    }
  }

  /**
   * Audio controls
   */
  public async volumeUp(): Promise<boolean> {
    const res = await this.sendRequest(SSAP_URIS.VOLUME_UP);
    this.volume = Math.min(100, this.volume + 1);
    this.emit('statusChange', this.getStatus());
    return res.returnValue !== false;
  }

  public async volumeDown(): Promise<boolean> {
    const res = await this.sendRequest(SSAP_URIS.VOLUME_DOWN);
    this.volume = Math.max(0, this.volume - 1);
    this.emit('statusChange', this.getStatus());
    return res.returnValue !== false;
  }

  public async setVolume(level: number): Promise<boolean> {
    const bounded = Math.max(0, Math.min(100, Math.round(level)));
    const res = await this.sendRequest(SSAP_URIS.SET_VOLUME, { volume: bounded });
    this.volume = bounded;
    this.emit('statusChange', this.getStatus());
    return res.returnValue !== false;
  }

  public async setMute(muteState?: boolean): Promise<boolean> {
    const target = muteState !== undefined ? muteState : !this.muted;
    const res = await this.sendRequest(SSAP_URIS.SET_MUTE, { mute: target });
    this.muted = target;
    this.emit('statusChange', this.getStatus());
    return res.returnValue !== false;
  }

  public async fetchAudioStatus(): Promise<void> {
    try {
      const res = await this.sendRequest(SSAP_URIS.GET_AUDIO_STATUS);
      if (res) {
        if (typeof res.volume === 'number') this.volume = res.volume;
        if (typeof res.mute === 'boolean') this.muted = res.mute;
        this.emit('statusChange', this.getStatus());
      }
    } catch (e) {
      // Audio status endpoint might differ on some webOS versions
    }
  }

  /**
   * Power Off
   */
  public async turnOff(): Promise<boolean> {
    try {
      await this.sendRequest(SSAP_URIS.POWER_OFF);
      this.disconnect();
      return true;
    } catch (err: any) {
      throw new Error(`Power off failed: ${err.message}`);
    }
  }

  /**
   * Channel controls
   */
  public async channelUp(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.CHANNEL_UP)).returnValue !== false;
  }

  public async channelDown(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.CHANNEL_DOWN)).returnValue !== false;
  }

  /**
   * Media controls
   */
  public async mediaPlay(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.MEDIA_PLAY)).returnValue !== false;
  }

  public async mediaPause(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.MEDIA_PAUSE)).returnValue !== false;
  }

  public async mediaStop(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.MEDIA_STOP)).returnValue !== false;
  }

  public async mediaRewind(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.MEDIA_REWIND)).returnValue !== false;
  }

  public async mediaFastForward(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.MEDIA_FAST_FORWARD)).returnValue !== false;
  }

  /**
   * Keyboard text insertion
   */
  public async insertText(text: string): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.INSERT_TEXT, { text, replace: 0 })).returnValue !== false;
  }

  public async sendEnterKey(): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.SEND_ENTER_KEY)).returnValue !== false;
  }

  public async deleteCharacters(count: number = 1): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.DELETE_CHAR, { count })).returnValue !== false;
  }

  /**
   * Apps listing and launch
   */
  public async listApps(): Promise<any[]> {
    const res = await this.sendRequest(SSAP_URIS.LIST_APPS);
    return res.launchPoints || [];
  }

  public async launchApp(appId: string, params?: Record<string, any>): Promise<boolean> {
    const res = await this.sendRequest(SSAP_URIS.LAUNCH_APP, { id: appId, params });
    if (res.returnValue !== false) {
      this.currentAppId = appId;
      return true;
    }
    return false;
  }

  public async showToast(message: string): Promise<boolean> {
    return (await this.sendRequest(SSAP_URIS.TOAST, { message })).returnValue !== false;
  }

  /**
   * Pointer mouse click / move
   */
  public async pointerClick(): Promise<boolean> {
    return this.pointer.sendClick();
  }

  public async pointerMove(dx: number, dy: number, drag: boolean = false): Promise<boolean> {
    return this.pointer.sendMove(dx, dy, drag);
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.cleanup();
    this.setStatus('DISCONNECTED');
  }

  public forgetPairing(): void {
    this.disconnect();
    credentialsStore.clearCredentials(this.tvIp);
    this.emit('statusChange', this.getStatus());
  }

  private cleanup(): void {
    // Clear all pending requests
    for (const [id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();

    // Close pointer
    this.pointer.close();

    // Close main WebSocket
    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (e) {}
      this.ws = null;
    }
  }

  private handleUnexpectedDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.setStatus('RECONNECTING', `Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.reconnectTimer = setTimeout(() => {
        this.connect(this.tvIp).catch(() => {});
      }, 3000);
    } else {
      this.setStatus('DISCONNECTED', 'TV connection dropped');
    }
  }
}

export const tvClient = new LGWebOSClient('192.168.31.63');
