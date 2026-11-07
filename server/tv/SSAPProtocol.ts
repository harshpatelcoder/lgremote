/**
 * LG webOS SSAP (Second Screen Application Protocol) Constants & Payloads
 */

export const SSAP_PORTS = {
  PLAIN: 3000,
  SECURE: 3001,
};

export const SSAP_URIS = {
  // Power
  POWER_OFF: 'ssap://system/turnOff',

  // Audio / Volume
  VOLUME_UP: 'ssap://audio/volumeUp',
  VOLUME_DOWN: 'ssap://audio/volumeDown',
  SET_VOLUME: 'ssap://audio/setVolume',
  GET_VOLUME: 'ssap://audio/getVolume',
  SET_MUTE: 'ssap://audio/setMute',
  GET_AUDIO_STATUS: 'ssap://audio/getStatus',

  // TV / Channels
  CHANNEL_UP: 'ssap://tv/channelUp',
  CHANNEL_DOWN: 'ssap://tv/channelDown',
  GET_CHANNEL_LIST: 'ssap://tv/getChannelList',
  GET_CURRENT_CHANNEL: 'ssap://tv/getCurrentChannel',

  // Media Controls
  MEDIA_PLAY: 'ssap://media.controls/play',
  MEDIA_PAUSE: 'ssap://media.controls/pause',
  MEDIA_STOP: 'ssap://media.controls/stop',
  MEDIA_REWIND: 'ssap://media.controls/rewind',
  MEDIA_FAST_FORWARD: 'ssap://media.controls/fastForward',

  // System & Apps
  LAUNCH_APP: 'ssap://system.launcher/launch',
  CLOSE_APP: 'ssap://system.launcher/close',
  LIST_APPS: 'ssap://com.webos.applicationManager/listLaunchPoints',
  TOAST: 'ssap://system.notifications/createToast',

  // Inputs
  GET_INPUTS: 'ssap://tv/getExternalInputList',
  SWITCH_INPUT: 'ssap://tv/switchInput',

  // Network Input / Pointer Socket
  GET_POINTER_INPUT_SOCKET: 'ssap://com.webos.service.networkinput/getPointerInputSocket',

  // IME / Keyboard
  INSERT_TEXT: 'ssap://com.webos.service.ime/insertText',
  SEND_ENTER_KEY: 'ssap://com.webos.service.ime/sendEnterKey',
  DELETE_CHAR: 'ssap://com.webos.service.ime/deleteCharacters',
};

export const SSAP_PERMISSIONS = [
  'LAUNCH',
  'LAUNCH_WEBAPP',
  'APP_TO_APP',
  'CLOSE',
  'TEST_OPEN',
  'TEST_PROTECTED',
  'CONTROL_AUDIO',
  'CONTROL_INPUT_TEXT',
  'CONTROL_MOUSE_AND_KEYBOARD',
  'READ_INSTALLED_APPS',
  'READ_CURRENT_CHANNEL',
  'READ_RUNNING_APPS',
  'READ_TV_CHANNEL_LIST',
  'WRITE_NOTIFICATION_TOAST',
  'READ_INPUT_DEVICE_LIST',
];

export function createRegistrationPayload(clientKey?: string | null) {
  const payload: Record<string, any> = {
    forcePairing: false,
    pairingType: 'PROMPT',
    manifest: {
      manifestVersion: 1,
      appVersion: '1.0.0',
      signed: {
        created: '20240101',
        appId: 'com.antigravity.lgremote',
        vendorId: 'antigravity',
        localizedAppNames: {
          '': 'LG Remote Bridge',
          'en-US': 'LG Remote Bridge',
        },
        permissions: SSAP_PERMISSIONS,
        serial: '2f930260777',
      },
      permissions: SSAP_PERMISSIONS,
    },
  };

  if (clientKey) {
    payload['client-key'] = clientKey;
  }

  return payload;
}
