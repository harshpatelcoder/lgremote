import WebSocket from 'ws';

export type PointerButton =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'ENTER'
  | 'BACK'
  | 'HOME'
  | 'MENU'
  | 'INPUT'
  | 'INFO'
  | 'EXIT'
  | 'RED'
  | 'GREEN'
  | 'YELLOW'
  | 'BLUE';

export class PointerInput {
  private ws: WebSocket | null = null;
  private socketUrl: string | null = null;
  private isConnecting: boolean = false;

  constructor() {}

  public async connect(socketUrl: string): Promise<void> {
    this.socketUrl = socketUrl;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.ws = new WebSocket(socketUrl, {
          rejectUnauthorized: false,
          handshakeTimeout: 5000,
        });

        this.ws.on('open', () => {
          this.isConnecting = false;
          resolve();
        });

        this.ws.on('error', (err) => {
          this.isConnecting = false;
          // Don't crash process on socket error
          this.close();
          reject(err);
        });

        this.ws.on('close', () => {
          this.isConnecting = false;
          this.ws = null;
        });
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public async sendButton(buttonName: PointerButton | string): Promise<boolean> {
    if (!this.isConnected()) {
      if (this.socketUrl && !this.isConnecting) {
        try {
          await this.connect(this.socketUrl);
        } catch (e) {
          throw new Error('Pointer socket disconnected and failed to reconnect');
        }
      } else {
        throw new Error('Pointer socket is not connected');
      }
    }

    const payload = `type:button\nname:${buttonName.toUpperCase()}\n\n`;
    return new Promise((resolve, reject) => {
      this.ws?.send(payload, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  public async sendClick(): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Pointer socket is not connected');
    }

    const payload = `type:click\n\n`;
    return new Promise((resolve, reject) => {
      this.ws?.send(payload, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  public async sendMove(dx: number, dy: number, drag: boolean = false): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Pointer socket is not connected');
    }

    const payload = `type:move\ndx:${Math.round(dx)}\ndy:${Math.round(dy)}\ndown:${drag ? 1 : 0}\n\n`;
    return new Promise((resolve, reject) => {
      this.ws?.send(payload, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  public async sendScroll(dx: number, dy: number): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Pointer socket is not connected');
    }

    const payload = `type:scroll\ndx:${Math.round(dx)}\ndy:${Math.round(dy)}\n\n`;
    return new Promise((resolve, reject) => {
      this.ws?.send(payload, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  public close(): void {
    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
  }
}
