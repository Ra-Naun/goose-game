import { USER_WEBSOCKET_HANDSHAKE_PATH, USER_WEBSOCKETS_NAMESPACE, WEBSOCKET_URL } from "@/src/config/env";
import { WebsocketClient } from "@/src/client/websocketClient";

export const wsClientUser = new WebsocketClient(
  WEBSOCKET_URL,
  USER_WEBSOCKETS_NAMESPACE,
  USER_WEBSOCKET_HANDSHAKE_PATH
);
