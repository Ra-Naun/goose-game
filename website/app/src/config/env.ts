export const USER_WEBSOCKET_URL = import.meta.env.VITE_USER_WEBSOCKET_URL || "ws://localhost";
export const USER_WEBSOCKETS_NAMESPACE = import.meta.env.VITE_USER_WEBSOCKETS_NAMESPACE || "";
export const USER_WEBSOCKET_HANDSHAKE_PATH = import.meta.env.VITE_USER_WEBSOCKET_HANDSHAKE_PATH || "/socket.io";

export const TAP_GOOSE_WEBSOCKET_URL = import.meta.env.VITE_TAP_GOOSE_WEBSOCKET_URL || "ws://localhost";
export const TAP_GOOSE_WEBSOCKETS_NAMESPACE = import.meta.env.VITE_TAP_GOOSE_WEBSOCKETS_NAMESPACE || "";
export const TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH =
  import.meta.env.VITE_TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH || "/socket.io";
