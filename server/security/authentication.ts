import { Request, Response, NextFunction } from 'express';
import os from 'os';
import crypto from 'crypto';

class SecurityManager {
  private bridgePin: string;
  private bridgeToken: string;

  constructor() {
    // Generate a secure 6-digit access PIN if not set in environment
    this.bridgePin = process.env.BRIDGE_PIN || this.generatePin();
    this.bridgeToken = crypto.randomBytes(24).toString('hex');
  }

  private generatePin(): string {
    // 6-digit random PIN e.g. "492815"
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public getPin(): string {
    return this.bridgePin;
  }

  public getToken(): string {
    return this.bridgeToken;
  }

  public verifyPin(candidatePin: string): boolean {
    if (!candidatePin) return false;
    return candidatePin.trim() === this.bridgePin.trim();
  }

  public verifyToken(candidateToken: string): boolean {
    if (!candidateToken) return false;
    return candidateToken.trim() === this.bridgeToken.trim();
  }

  /**
   * Express middleware to verify PIN or Token on control endpoints
   */
  public authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Localhost callers (same laptop) can optionally be exempted or provide PIN
    const isLocalhost =
      req.ip === '127.0.0.1' ||
      req.ip === '::1' ||
      req.ip === '::ffff:127.0.0.1';

    const clientPin = (req.headers['x-bridge-pin'] as string) || (req.query.pin as string);
    const clientToken = (req.headers['authorization'] as string)?.replace('Bearer ', '') || (req.query.token as string);

    // If client provides valid PIN or Token, allow
    if (this.verifyPin(clientPin) || this.verifyToken(clientToken)) {
      next();
      return;
    }

    // Localhost allowed without PIN if desired, but providing PIN gives complete parity
    if (isLocalhost) {
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
        // Skip over non-IPv4 and internal/loopback addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }

    return addresses;
  }
}

export const securityManager = new SecurityManager();
