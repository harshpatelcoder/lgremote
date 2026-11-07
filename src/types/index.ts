export type TVConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'WAITING_FOR_TV_APPROVAL'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export type OperatingMode = 'LOCAL_BRIDGE' | 'VERCEL_HOSTED';

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

export interface BridgeHealth {
  status: 'ok' | 'error';
  mode: 'LOCAL_BRIDGE';
  bridgeVersion: string;
  timestamp: string;
}

export interface AppItem {
  id: string;
  title: string;
  icon?: string;
  largeIcon?: string;
  launchPoints?: any;
}
