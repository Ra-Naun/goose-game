export class REDIS_KEYS {
  static getMatchKey(matchId: string) {
    return `goose:match:${matchId}`;
  }
  static getUserOnlineKey(playerId: string) {
    return `goose:user:${playerId}:online`;
  }

  static getTapThrottleKey(matchId: string, playerId: string) {
    return `goose-tap-throttle:${matchId}:${playerId}`;
  }
}

export class REDIS_EVENTS {
  static readonly GOOSE_MATCH_CREATED = 'goose:match:created';
  static readonly GOOSE_MATCH_USER_JOINED = 'goose:match:user_joined';
  static readonly GOOSE_MATCH_USER_LEFT = 'goose:match:user_left';
  static readonly ONLINE_USERS_CHANGED = 'goose:users:online_changed';
  static readonly GOOSE_MATCH_STATE = 'goose:match:state';
  static readonly GOOSE_MATCH_TAP = 'goose:match:tap';
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly ONLINE_USER = 'imOnline';

  static readonly CREATE_MATCH = 'createMatch';

  static readonly MATCH_USER_JOIN = 'matchUserJoin';
  static readonly MATCH_USER_LEFT = 'matchUserLeft';

  static readonly GOOSE_TAP = 'tapGoose';
}

export class WEBSOCKET_CHANEL_SEND {
  static readonly ONLINE_USER_ERROR = 'imOnlineError';

  static readonly ONLINE_USERS_CHANGED = 'onlineUsersChanged';
  static readonly CREATE_MATCH_ERROR = 'createMatchError';
  static readonly MATCH_CREATED = 'matchCreated';
  static readonly MATCH_STATE_UPDATE = 'matchStateUpdate';

  static readonly MATCH_USER_JOIN_SUCCESS = 'matchUserJoined';
  static readonly MATCH_USER_JOIN_ERROR = 'matchUserJoinedError';
  static readonly MATCH_USER_LEFT_SUCCESS = 'matchUserLeftSuccess';
  static readonly MATCH_USER_LEFT_ERROR = 'matchUserLeftError';

  static readonly GOOSE_TAP_SUCCESS = 'tapSuccess';
  static readonly GOOSE_TAP_ERROR = 'tapError';
}

export class WEBSOCKET_ROOM {
  static getMatchRoomKey(matchId: string) {
    return `match_${matchId}`;
  }
}

export const USER_ONLINE_EXPIRATION = 30; // seconds
