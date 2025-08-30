export class REDIS_KEYS {
  static getMatchKey(matchId: string) {
    return `goose:match:${matchId}`;
  }
  static getTapThrottleKey(matchId: string, playerId: string) {
    return `goose-tap-throttle:${matchId}:${playerId}`;
  }
}

export class REDIS_EVENTS {
  static readonly GOOSE_MATCH_CREATED = 'goose:match:created';
  static readonly GOOSE_MATCH_USER_JOINED = 'goose:match:user_joined';
  static readonly GOOSE_MATCH_USER_LEFT = 'goose:match:user_left';
  static readonly GOOSE_MATCH_STATE = 'goose:match:state';
  static readonly GOOSE_MATCH_TAP = 'goose:match:tap';
}

export class WEBSOCKET_CHANEL {
  static readonly CREATE_MATCH = 'createMatch';
  static readonly CREATE_MATCH_ERROR = 'createMatchError';
  static readonly MATCH_CREATED = 'matchCreated';

  static readonly MATCH_USER_JOIN = 'matchUserJoin';
  static readonly MATCH_USER_JOIN_SUCCESS = 'matchUserJoined';
  static readonly MATCH_USER_JOIN_ERROR = 'matchUserJoinedError';
  static readonly MATCH_USER_LEFT = 'matchUserLeft';
  static readonly MATCH_USER_LEFT_SUCCESS = 'matchUserLeftSuccess';
  static readonly MATCH_USER_LEFT_ERROR = 'matchUserLeftError';

  static readonly GOOSE_TAP = 'tapGoose';
  static readonly GOOSE_TAP_SUCCESS = 'tapSuccess';
  static readonly GOOSE_TAP_ERROR = 'tapError';

  static readonly MATCH_STATE = 'matchState';
}

export class WEBSOCKET_ROOM {
  static getMatchRoomKey(matchId: string) {
    return `match_${matchId}`;
  }
}
