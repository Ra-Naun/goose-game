import { USER_WEBSOCKET_HANDSHAKE_PATH, USER_WEBSOCKET_URL, USER_WEBSOCKETS_NAMESPACE } from "@/src/config/env";
import { WebsocketClient } from "@/src/client/websocketClient";

export const wsClientUser = new WebsocketClient(
  USER_WEBSOCKET_URL,
  USER_WEBSOCKETS_NAMESPACE,
  USER_WEBSOCKET_HANDSHAKE_PATH
);
