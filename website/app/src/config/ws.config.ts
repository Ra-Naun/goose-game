export class WEBSOCKET_CHANEL_SEND {
  static readonly ONLINE_USER = "imOnline";

  static readonly CREATE_MATCH = "tapGooseMatchCreate";

  static readonly MATCH_USER_JOIN = "tapGooseMatchUserJoin";
  static readonly MATCH_USER_LEAVE = "tapGooseMatchUserLeave";

  static readonly GOOSE_TAP = "tapGoose";

  static readonly SEND_MESSAGE = "sendMessage";
  static readonly DELETE_MESSAGE = "deleteMessage";
  static readonly DELETE_ALL_MESSAGES = "deleteAllMessages";
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly ONLINE_USERS_CHANGED = "onlineUsersChanged";

  static readonly MATCH_CREATED = "tapGooseMatchCreated";
  static readonly MATCH_STARTED = "tapGooseMatchStateStarted";
  static readonly MATCH_ENDED = "tapGooseMatchStateEnded";

  static readonly USER_JOINED = "tapGooseMatchUserJoined";
  static readonly USER_LEAVE = "tapGooseMatchUserLeaveSuccess";

  static readonly GOOSE_TAP_SUCCESS = "tapGooseSuccess";

  static readonly SENDED_MESSAGE = "sendedMessage";
  static readonly DELETED_MESSAGE = "deletedMessage";
  static readonly DELETED_ALL_MESSAGES = "deletedAllMessages";
}

export const I_AM_ONLINE_INTERVAL = 30 * 1000; // 30 sec
