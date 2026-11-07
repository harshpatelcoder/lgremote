import { Router, Request, Response } from 'express';
import { tvClient } from '../tv/LGWebOSClient';
import { securityManager } from '../security/authentication';
import { credentialsStore } from '../storage/credentials';

export const connectionRouter = Router();

/**
 * Health check endpoint: used by frontend to detect if local bridge is running
 */
connectionRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'LOCAL_BRIDGE',
    bridgeVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Verify access PIN provided by mobile user
 */
connectionRouter.post('/auth/verify', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin) {
    res.status(400).json({ success: false, error: 'PIN is required' });
    return;
  }

  if (securityManager.verifyPin(pin)) {
    res.json({
      success: true,
      token: securityManager.getToken(),
      message: 'PIN verified successfully',
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid PIN. Check the laptop terminal for the 6-digit access PIN.',
    });
  }
});

/**
 * TV Connection status
 */
connectionRouter.get('/status', (req: Request, res: Response) => {
  const currentStatus = tvClient.getStatus();
  const authenticated = securityManager.isRequestAuthenticated(req);
  res.json({
    success: true,
    data: currentStatus,
    localIps: securityManager.getLocalIpAddresses(),
    authenticated,
  });
});

/**
 * Connect to TV (using saved credentials if present)
 */
connectionRouter.post('/connect', securityManager.authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tvIp } = req.body;
    const ipToUse = tvIp ? String(tvIp).trim() : undefined;

    const connected = await tvClient.connect(ipToUse);
    const status = tvClient.getStatus();

    res.json({
      success: connected,
      status: status.status,
      data: status,
      message:
        status.status === 'WAITING_FOR_TV_APPROVAL'
          ? 'Please approve the connection request on your LG TV.'
          : status.status === 'CONNECTED'
          ? 'Connected to LG Smart TV'
          : status.errorMessage || 'Connection attempt processed',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Connection failed',
      data: tvClient.getStatus(),
    });
  }
});

/**
 * Explicit pair endpoint (triggers prompt on TV)
 */
connectionRouter.post('/pair', securityManager.authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tvIp } = req.body;
    const ipToUse = tvIp ? String(tvIp).trim() : undefined;

    // Disconnect any active connection first
    tvClient.disconnect();

    const connected = await tvClient.connect(ipToUse);
    const status = tvClient.getStatus();

    res.json({
      success: connected,
      status: status.status,
      data: status,
      message: 'Please approve the connection request on your LG TV screen.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Pairing request failed',
      data: tvClient.getStatus(),
    });
  }
});

/**
 * Disconnect from TV
 */
connectionRouter.post('/disconnect', securityManager.authMiddleware, (_req: Request, res: Response) => {
  tvClient.disconnect();
  res.json({
    success: true,
    data: tvClient.getStatus(),
    message: 'Disconnected from LG TV',
  });
});

/**
 * Forget pairing (deletes local TV client key)
 */
connectionRouter.post('/forget-pairing', securityManager.authMiddleware, (req: Request, res: Response) => {
  const { tvIp } = req.body;
  tvClient.forgetPairing();
  if (tvIp) {
    credentialsStore.clearCredentials(String(tvIp).trim());
  }
  res.json({
    success: true,
    data: tvClient.getStatus(),
    message: 'TV pairing forgotten. Next connection will require re-pairing on TV.',
  });
});
