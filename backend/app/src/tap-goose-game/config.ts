export class REDIS_KEYS {
  static getMatchStatusKey(matchId: string) {
    return `goose:match:${matchId}:status`;
  }

  static MATCH_PLAYERS_PREFIX = 'goose:match:players:';
  static getMatchPlayersKey(matchId: string) {
    return `${REDIS_KEYS.MATCH_PLAYERS_PREFIX}${matchId}`;
  }

  static getMatchScoresKey(matchId: string) {
    return `goose:match:scores:${matchId}`;
  }

  static getUserRolesInMatchKey(matchId: string, playerId: string) {
    return `goose:match:${matchId}:user:${playerId}:roles`;
  }

  static getMatchTapsKey(matchId: string) {
    return `goose:match:taps:${matchId}`;
  }

  static getMatchKey(matchId: string) {
    return `goose:match:metadata:${matchId}`;
  }
  static getUserOnlineKey(playerId: string) {
    return `user:${playerId}:online`;
  }

  static getTapThrottleKey(matchId: string, playerId: string) {
    return `goose-tap-throttle:${matchId}:${playerId}`;
  }
}

export class REDIS_EVENTS {
  static readonly GOOSE_MATCH_CREATED = 'goose:match:created';
  static readonly GOOSE_MATCH_USER_JOINED = 'goose:match:user:joined';
  static readonly GOOSE_MATCH_USER_LEAVE = 'goose:match:user:leave';
  static readonly GOOSE_MATCH_STARTED = 'goose:match:started';
  static readonly GOOSE_MATCH_ENDED = 'goose:match:ended';
  static readonly GOOSE_MATCH_TAP = 'goose:match:tap';
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly CREATE_MATCH = 'tapGooseMatchCreate';

  static readonly MATCH_USER_JOIN = 'tapGooseMatchUserJoin';
  static readonly MATCH_USER_LEAVE = 'tapGooseMatchUserLeave';

  static readonly GOOSE_TAP = 'tapGoose';
}

export class WEBSOCKET_CHANEL_SEND {
  static readonly MATCH_CREATED = 'tapGooseMatchCreated';
  static readonly MATCH_STARTED = 'tapGooseMatchStateStarted';
  static readonly MATCH_ENDED = 'tapGooseMatchStateEnded';

  static readonly USER_JOINED = 'tapGooseMatchUserJoined';
  static readonly USER_LEAVE = 'tapGooseMatchUserLeaveSuccess';

  static readonly GOOSE_TAP_SUCCESS = 'tapGooseSuccess';
}

export class WEBSOCKET_ROOM {
  static getMatchRoomKey(matchId: string) {
    return `match_${matchId}`;
  }
}

export const USER_ONLINE_EXPIRATION = 30; // seconds
