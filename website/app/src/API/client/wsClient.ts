import { WEBSOCKET_HANDSHAKE_PATH, WEBSOCKET_URL, WEBSOCKETS_NAMESPACE } from "@/src/config/env";
import { WebsocketClient } from "../../client/websocketClient";

export const wsClient = new WebsocketClient(WEBSOCKET_URL, WEBSOCKETS_NAMESPACE, WEBSOCKET_HANDSHAKE_PATH);
