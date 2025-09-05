export class WEBSOCKET_CHANEL_SEND {
  static readonly ONLINE_USER = "imOnline";

  static readonly CREATE_MATCH = "createMatch";

  static readonly MATCH_USER_JOIN = "matchUserJoin";
  static readonly MATCH_USER_LEFT = "matchUserLeft";

  static readonly GOOSE_TAP = "tapGoose";
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly ONLINE_USERS_CHANGED = "onlineUsersChanged";
  static readonly ONLINE_USER_ERROR = "imOnlineError";
  static readonly CREATE_MATCH_ERROR = "createMatchError";
  static readonly MATCH_CREATED = "matchCreated";
  static readonly MATCH_STATE_UPDATE = "matchStateUpdate";

  static readonly MATCH_USER_JOIN_SUCCESS = "matchUserJoined";
  static readonly MATCH_USER_JOIN_ERROR = "matchUserJoinedError";
  static readonly MATCH_USER_LEFT_SUCCESS = "matchUserLeftSuccess";
  static readonly MATCH_USER_LEFT_ERROR = "matchUserLeftError";

  static readonly GOOSE_TAP_SUCCESS = "tapSuccess";
  static readonly GOOSE_TAP_ERROR = "tapError";
}

export const I_AM_ONLINE_INTERVAL = 30 * 1000; // 30 sec
