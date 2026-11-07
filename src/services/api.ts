import { BridgeHealth, TVState, AppItem } from '../types';

const STORAGE_KEYS = {
  BRIDGE_URL: 'lg_remote_bridge_url',
  BRIDGE_PIN: 'lg_remote_bridge_pin',
  BRIDGE_TOKEN: 'lg_remote_bridge_token',
  TV_IP: 'lg_remote_tv_ip',
  HAPTIC_ENABLED: 'lg_remote_haptic_enabled',
};

class ApiService {
  private customBridgeUrl: string;
  private pin: string;
  private token: string;

  constructor() {
    this.customBridgeUrl = localStorage.getItem(STORAGE_KEYS.BRIDGE_URL) || '';
    this.pin = localStorage.getItem(STORAGE_KEYS.BRIDGE_PIN) || '';
    this.token = localStorage.getItem(STORAGE_KEYS.BRIDGE_TOKEN) || '';
  }

  public getBaseUrl(): string {
    // If user provided a custom bridge URL (e.g. while testing from Vercel), use it
    if (this.customBridgeUrl.trim()) {
      return this.customBridgeUrl.trim().replace(/\/$/, '');
    }

    // If running in development Vite (port 5173), target port 8787
    if (window.location.port === '5173') {
      return `http://${window.location.hostname}:8787`;
    }

    // Default: relative to current origin (works when served by Node bridge on port 8787)
    return '';
  }

  public setCustomBridgeUrl(url: string): void {
    this.customBridgeUrl = url.trim();
    if (this.customBridgeUrl) {
      localStorage.setItem(STORAGE_KEYS.BRIDGE_URL, this.customBridgeUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.BRIDGE_URL);
    }
  }

  public getCustomBridgeUrl(): string {
    return this.customBridgeUrl;
  }

  public setPin(pin: string): void {
    this.pin = pin.trim();
    if (this.pin) {
      localStorage.setItem(STORAGE_KEYS.BRIDGE_PIN, this.pin);
    } else {
      localStorage.removeItem(STORAGE_KEYS.BRIDGE_PIN);
    }
  }

  public getPin(): string {
    return this.pin;
  }

  public setToken(token: string): void {
    this.token = token.trim();
    if (this.token) {
      localStorage.setItem(STORAGE_KEYS.BRIDGE_TOKEN, this.token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.BRIDGE_TOKEN);
    }
  }

  public getToken(): string {
    return this.token;
  }

  public getSavedTvIp(): string {
    return localStorage.getItem(STORAGE_KEYS.TV_IP) || '192.168.31.63';
  }

  public setSavedTvIp(ip: string): void {
    localStorage.setItem(STORAGE_KEYS.TV_IP, ip.trim());
  }

  public getHapticEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.HAPTIC_ENABLED);
    return val !== 'false'; // default true
  }

  public setHapticEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.HAPTIC_ENABLED, String(enabled));
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.pin) {
      headers['X-Bridge-PIN'] = this.pin;
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Health check to detect if local bridge is running
   */
  public async checkBridgeHealth(): Promise<BridgeHealth | null> {
    try {
      const url = `${this.getBaseUrl()}/api/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verify Bridge Access PIN
   */
  public async verifyPin(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.setPin(pin);
        if (data.token) {
          this.setToken(data.token);
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid PIN' };
    } catch (err: any) {
      return { success: false, error: 'Could not connect to bridge server' };
    }
  }

  /**
   * Get TV connection status
   */
  public async getStatus(): Promise<{ state: TVState; localIps?: string[]; authenticated?: boolean }> {
    const res = await fetch(`${this.getBaseUrl()}/api/status`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch status');
    }
    return {
      state: data.data,
      localIps: data.localIps,
      authenticated: data.authenticated,
    };
  }

  /**
   * Connect to TV
   */
  public async connect(tvIp?: string): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/connect`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tvIp }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('bridge-auth-required'));
      }
      throw new Error(data.error || 'Connection request failed');
    }
    return data;
  }

  /**
   * Pair with TV (explicit prompt)
   */
  public async pair(tvIp?: string): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/pair`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tvIp }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('bridge-auth-required'));
      }
      throw new Error(data.error || 'Pairing request failed');
    }
    return data;
  }

  /**
   * Disconnect from TV
   */
  public async disconnect(): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/disconnect`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return await res.json();
  }

  /**
   * Forget saved TV pairing
   */
  public async forgetPairing(tvIp?: string): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/forget-pairing`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tvIp }),
    });
    return await res.json();
  }

  /**
   * Send remote control command
   */
  public async sendCommand(action: string, payload?: any): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/command`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, payload }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('bridge-auth-required'));
      }
      throw new Error(data.error || `Command ${action} failed on TV`);
    }
    return data;
  }

  /**
   * Send keyboard text input
   */
  public async sendKeyboard(type: 'insert' | 'enter' | 'delete', text?: string, count?: number): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/keyboard`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ type, text, count }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('bridge-auth-required'));
      }
      throw new Error(data.error || 'Keyboard command failed');
    }
    return data;
  }

  /**
   * List installed apps
   */
  public async getApps(): Promise<AppItem[]> {
    const res = await fetch(`${this.getBaseUrl()}/api/apps`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to list apps');
    }
    return data.apps || [];
  }

  /**
   * Launch App
   */
  public async launchApp(appId: string, params?: Record<string, any>): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/api/apps/launch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ appId, params }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to launch app ${appId}`);
    }
    return data;
  }
}

export const apiService = new ApiService();
