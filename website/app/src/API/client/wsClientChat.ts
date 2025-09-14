import { CHAT_WEBSOCKET_HANDSHAKE_PATH, CHAT_WEBSOCKET_URL, CHAT_WEBSOCKETS_NAMESPACE } from "@/src/config/env";
import { WebsocketClient } from "@/src/client/websocketClient";

export const wsClientChat = new WebsocketClient(
  CHAT_WEBSOCKET_URL,
  CHAT_WEBSOCKETS_NAMESPACE,
  CHAT_WEBSOCKET_HANDSHAKE_PATH
);
