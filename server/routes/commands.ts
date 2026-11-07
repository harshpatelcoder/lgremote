import { Router, Request, Response } from 'express';
import { tvClient } from '../tv/LGWebOSClient';
import { securityManager } from '../security/authentication';
import { PointerButton } from '../tv/PointerInput';

export const commandsRouter = Router();

// Apply auth middleware to all commands
commandsRouter.use(securityManager.authMiddleware);

/**
 * Main command dispatcher
 */
commandsRouter.post('/command', async (req: Request, res: Response) => {
  const { action, payload } = req.body;

  if (!action) {
    res.status(400).json({ success: false, error: 'Command action is required' });
    return;
  }

  const normalizedAction = String(action).toUpperCase();

  try {
    let result: any = true;

    switch (normalizedAction) {
      // Navigation commands (Pointer socket)
      case 'UP':
      case 'DOWN':
      case 'LEFT':
      case 'RIGHT':
      case 'ENTER':
      case 'BACK':
      case 'HOME':
      case 'MENU':
      case 'INPUT':
      case 'SOURCE':
      case 'RED':
      case 'GREEN':
      case 'YELLOW':
      case 'BLUE':
        result = await tvClient.sendNavigation(normalizedAction === 'SOURCE' ? 'INPUT' : (normalizedAction as PointerButton));
        break;

      // Audio controls
      case 'VOLUME_UP':
        result = await tvClient.volumeUp();
        break;

      case 'VOLUME_DOWN':
        result = await tvClient.volumeDown();
        break;

      case 'SET_VOLUME':
        if (typeof payload?.volume !== 'number') {
          res.status(400).json({ success: false, error: 'Volume level number required' });
          return;
        }
        result = await tvClient.setVolume(payload.volume);
        break;

      case 'MUTE':
      case 'TOGGLE_MUTE':
        result = await tvClient.setMute(payload?.mute);
        break;

      case 'GET_AUDIO_STATUS':
        await tvClient.fetchAudioStatus();
        result = tvClient.getStatus();
        break;

      // Channels
      case 'CHANNEL_UP':
        result = await tvClient.channelUp();
        break;

      case 'CHANNEL_DOWN':
        result = await tvClient.channelDown();
        break;

      // Power
      case 'POWER_OFF':
      case 'TURN_OFF':
        result = await tvClient.turnOff();
        break;

      case 'POWER_ON':
        // Per instruction: Power On must not be falsely advertised over normal SSAP WebSocket
        res.status(400).json({
          success: false,
          error:
            'Power On cannot be performed over webOS SSAP WebSocket because the TV Wi-Fi chip enters low-power sleep when powered off. Wake-on-LAN is required.',
        });
        return;

      // Media
      case 'MEDIA_PLAY':
      case 'PLAY':
        result = await tvClient.mediaPlay();
        break;

      case 'MEDIA_PAUSE':
      case 'PAUSE':
        result = await tvClient.mediaPause();
        break;

      case 'MEDIA_STOP':
      case 'STOP':
        result = await tvClient.mediaStop();
        break;

      case 'MEDIA_REWIND':
      case 'REWIND':
        result = await tvClient.mediaRewind();
        break;

      case 'MEDIA_FAST_FORWARD':
      case 'FAST_FORWARD':
        result = await tvClient.mediaFastForward();
        break;

      // Pointer mouse simulation
      case 'CLICK':
        result = await tvClient.pointerClick();
        break;

      case 'MOVE':
        result = await tvClient.pointerMove(payload?.dx || 0, payload?.dy || 0, Boolean(payload?.drag));
        break;

      case 'TOAST':
        if (!payload?.message) {
          res.status(400).json({ success: false, error: 'Toast message is required' });
          return;
        }
        result = await tvClient.showToast(payload.message);
        break;

      default:
        res.status(400).json({ success: false, error: `Unknown command action: ${action}` });
        return;
    }

    res.json({
      success: true,
      action: normalizedAction,
      result,
      status: tvClient.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      action: normalizedAction,
      error: err.message || 'Command execution failed on LG TV',
      status: tvClient.getStatus(),
    });
  }
});

/**
 * Text and Keyboard Input
 */
commandsRouter.post('/keyboard', async (req: Request, res: Response) => {
  const { type = 'insert', text = '', count = 1 } = req.body;

  try {
    let success = false;
    if (type === 'insert') {
      success = await tvClient.insertText(String(text));
    } else if (type === 'enter') {
      success = await tvClient.sendEnterKey();
    } else if (type === 'delete') {
      success = await tvClient.deleteCharacters(Number(count) || 1);
    } else {
      res.status(400).json({ success: false, error: 'Invalid keyboard type (insert, enter, delete)' });
      return;
    }

    res.json({ success, type });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Keyboard input failed',
    });
  }
});

/**
 * App list
 */
commandsRouter.get('/apps', async (_req: Request, res: Response) => {
  try {
    const apps = await tvClient.listApps();
    res.json({ success: true, apps });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to list TV applications',
    });
  }
});

/**
 * Launch App
 */
commandsRouter.post('/apps/launch', async (req: Request, res: Response) => {
  const { appId, params } = req.body;

  if (!appId) {
    res.status(400).json({ success: false, error: 'appId is required' });
    return;
  }

  try {
    const launched = await tvClient.launchApp(appId, params);
    res.json({ success: launched, appId });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || `Failed to launch app ${appId}`,
    });
  }
});
