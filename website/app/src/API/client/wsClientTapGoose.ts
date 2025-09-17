import { TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH, TAP_GOOSE_WEBSOCKETS_NAMESPACE, WEBSOCKET_URL } from "@/src/config/env";
import { WebsocketClient } from "@/src/client/websocketClient";

export const wsClientTapGoose = new WebsocketClient(
  WEBSOCKET_URL,
  TAP_GOOSE_WEBSOCKETS_NAMESPACE,
  TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH
);
