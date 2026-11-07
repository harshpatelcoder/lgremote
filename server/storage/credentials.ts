import fs from 'fs';
import path from 'path';

interface TVCredentials {
  tvIp: string;
  clientKey: string;
  savedAt: string;
  deviceName?: string;
}

const STORAGE_DIR = path.resolve(process.cwd(), 'server', 'storage');
const CREDENTIALS_FILE = path.join(STORAGE_DIR, 'credentials.json');

export class CredentialsStore {
  constructor() {
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(STORAGE_DIR)) {
      try {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      } catch (err) {
        console.error('[Storage] Failed to create storage directory:', err);
      }
    }
  }

  /**
   * Loads credentials for a specific TV IP or the latest saved TV
   */
  public getCredentials(tvIp?: string): TVCredentials | null {
    try {
      if (!fs.existsSync(CREDENTIALS_FILE)) {
        return null;
      }
      const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      const data: Record<string, TVCredentials> = JSON.parse(raw);

      if (tvIp) {
        return data[tvIp] || null;
      }

      // Return the most recent entry if no specific IP was requested
      const entries = Object.values(data);
      if (entries.length > 0) {
        entries.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        return entries[0];
      }
      return null;
    } catch (err) {
      console.error('[Storage] Failed to read credentials file');
      return null;
    }
  }

  /**
   * Saves or updates credentials for a given TV IP
   */
  public saveCredentials(tvIp: string, clientKey: string, deviceName?: string): boolean {
    try {
      this.ensureDirectory();
      let data: Record<string, TVCredentials> = {};

      if (fs.existsSync(CREDENTIALS_FILE)) {
        try {
          data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
        } catch {
          data = {};
        }
      }

      data[tvIp] = {
        tvIp,
        clientKey,
        savedAt: new Date().toISOString(),
        deviceName: deviceName || 'LG Smart TV',
      };

      fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2), {
        encoding: 'utf-8',
        mode: 0o600, // Secure read/write permission
      });

      console.log(`[Storage] Pairing credentials safely saved for TV at ${tvIp}`);
      return true;
    } catch (err) {
      console.error('[Storage] Failed to write credentials file');
      return false;
    }
  }

  /**
   * Removes saved pairing credentials for a specific TV or all TVs
   */
  public clearCredentials(tvIp?: string): boolean {
    try {
      if (!fs.existsSync(CREDENTIALS_FILE)) {
        return true;
      }

      if (tvIp) {
        const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
        const data: Record<string, TVCredentials> = JSON.parse(raw);
        delete data[tvIp];
        fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[Storage] Cleared pairing credentials for ${tvIp}`);
      } else {
        fs.unlinkSync(CREDENTIALS_FILE);
        console.log('[Storage] Cleared all saved pairing credentials');
      }
      return true;
    } catch (err) {
      console.error('[Storage] Failed to clear credentials');
      return false;
    }
  }

  /**
   * Checks if pairing key exists for the TV IP
   */
  public hasPairing(tvIp: string): boolean {
    const creds = this.getCredentials(tvIp);
    return creds !== null && Boolean(creds.clientKey);
  }
}

export const credentialsStore = new CredentialsStore();
