export class REDIS_EVENTS {
  static readonly SEND_MESSAGE = 'chat:message:new';
  static readonly DELETE_MESSAGE = 'chat:message:delete';
  static readonly DELETE_ALL_MESSAGES = 'chat:messages:delete';
}

export class WEBSOCKET_CHANEL_LISTEN {
  static readonly SEND_MESSAGE = 'sendMessage';
  static readonly DELETE_MESSAGE = 'deleteMessage';
  static readonly DELETE_ALL_MESSAGES = 'deleteAllMessages';
}

export class WEBSOCKET_CHANEL_SEND {
  static readonly SENDED_MESSAGE = 'sendedMessage';
  static readonly DELETED_MESSAGE = 'deletedMessage';
  static readonly DELETED_ALL_MESSAGES = 'deletedAllMessages';
}

export class WEBSOCKET_ROOM {
  static getChatRoomKey(channelId: string) {
    return `chat_${channelId}`;
  }
}

export const MAX_MESSAGE_LENGTH = 300;

export const COMMON_CHAT_ID = 'common';
