export class REDIS_KEYS {
  static getUserOnlineKey(playerId: string) {
    return `user:${playerId}:online`;
  }
}

export const USER_ONLINE_KEY_REGEX = /^user:(.*):online$/;

export class REDIS_EVENTS {
  static readonly ONLINE_USERS_CHANGED = 'users:online:changed';
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly ONLINE_USER = 'imOnline';
}

export class WEBSOCKET_CHANEL_SEND {
  static readonly ONLINE_USERS_CHANGED = 'onlineUsersChanged';
}

export const USER_ONLINE_EXPIRATION = 30; // seconds
