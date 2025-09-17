import { CHAT_WEBSOCKET_HANDSHAKE_PATH, CHAT_WEBSOCKETS_NAMESPACE, WEBSOCKET_URL } from "@/src/config/env";
import { WebsocketClient } from "@/src/client/websocketClient";

export const wsClientChat = new WebsocketClient(
  WEBSOCKET_URL,
  CHAT_WEBSOCKETS_NAMESPACE,
  CHAT_WEBSOCKET_HANDSHAKE_PATH
);
