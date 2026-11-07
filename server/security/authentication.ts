import { Request, Response, NextFunction } from 'express';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const PIN_FILE = path.resolve(process.cwd(), '.bridge-pin');

class SecurityManager {
  private bridgePin: string;
  private bridgeToken: string;

  constructor() {
    this.bridgePin = this.loadOrInitPin();
    this.bridgeToken = crypto.randomBytes(24).toString('hex');
  }

  private loadOrInitPin(): string {
    if (process.env.BRIDGE_PIN) {
      return process.env.BRIDGE_PIN.trim();
    }

    try {
      if (fs.existsSync(PIN_FILE)) {
        const saved = fs.readFileSync(PIN_FILE, 'utf-8').trim();
        if (saved && saved.length >= 4) {
          return saved;
        }
      }
      // Default to 123456 for effortless setup, saved persistently
      const defaultPin = '123456';
      fs.writeFileSync(PIN_FILE, defaultPin, 'utf-8');
      return defaultPin;
    } catch {
      return '123456';
    }
  }

  public getPin(): string {
    return this.bridgePin;
  }

  public getToken(): string {
    return this.bridgeToken;
  }

  public verifyPin(candidatePin?: string): boolean {
    if (!candidatePin) return false;
    return candidatePin.trim() === this.bridgePin.trim();
  }

  public verifyToken(candidateToken?: string): boolean {
    if (!candidateToken) return false;
    return candidateToken.trim() === this.bridgeToken.trim();
  }

  public isRequestAuthenticated(req: Request): boolean {
    const isLocalhost =
      req.ip === '127.0.0.1' ||
      req.ip === '::1' ||
      req.ip === '::ffff:127.0.0.1';

    if (isLocalhost) return true;

    const clientPin = (req.headers['x-bridge-pin'] as string) || (req.query.pin as string);
    const clientToken = (req.headers['authorization'] as string)?.replace('Bearer ', '') || (req.query.token as string);

    return this.verifyPin(clientPin) || this.verifyToken(clientToken);
  }

  /**
   * Express middleware to verify PIN or Token on control endpoints
   */
  public authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (this.isRequestAuthenticated(req)) {
      next();
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Local Bridge PIN required',
      code: 'AUTH_REQUIRED',
    });
  };

  /**
   * Discovers the Laptop's local IPv4 addresses (Wi-Fi / LAN)
   */
  public getLocalIpAddresses(): string[] {
    const interfaces = os.networkInterfaces();
    const addresses: string[] = [];

    for (const name of Object.keys(interfaces)) {
      const netInterface = interfaces[name];
      if (!netInterface) continue;

      for (const iface of netInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }

    return addresses;
  }
}

export const securityManager = new SecurityManager();
