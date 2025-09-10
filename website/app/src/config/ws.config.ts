export class WEBSOCKET_CHANEL_SEND {
  static readonly ONLINE_USER = "imOnline";

  static readonly CREATE_MATCH = "tapGooseMatchCreate";

  static readonly MATCH_USER_JOIN = "tapGooseMatchUserJoin";
  static readonly MATCH_USER_LEAVE = "tapGooseMatchUserLeave";

  static readonly GOOSE_TAP = "tapGoose";
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly ONLINE_USERS_CHANGED = "onlineUsersChanged";

  static readonly MATCH_CREATED = "tapGooseMatchCreated";
  static readonly MATCH_STARTED = "tapGooseMatchStateStarted";
  static readonly MATCH_ENDED = "tapGooseMatchStateEnded";

  static readonly USER_JOINED = "tapGooseMatchUserJoined";
  static readonly USER_LEAVE = "tapGooseMatchUserLeaveSuccess";

  static readonly GOOSE_TAP_SUCCESS = "tapGooseSuccess";
}

export const I_AM_ONLINE_INTERVAL = 30 * 1000; // 30 sec
