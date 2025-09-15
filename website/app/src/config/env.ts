export const USER_WEBSOCKET_URL = import.meta.env.VITE_USER_WEBSOCKET_URL || "wss://localhost/api";
export const USER_WEBSOCKETS_NAMESPACE = import.meta.env.VITE_USER_WEBSOCKETS_NAMESPACE || "";
export const USER_WEBSOCKET_HANDSHAKE_PATH =
  import.meta.env.VITE_USER_WEBSOCKET_HANDSHAKE_PATH || "/api/user/socket.io";

export const TAP_GOOSE_WEBSOCKET_URL = import.meta.env.VITE_TAP_GOOSE_WEBSOCKET_URL || "wss://localhost/api";
export const TAP_GOOSE_WEBSOCKETS_NAMESPACE = import.meta.env.VITE_TAP_GOOSE_WEBSOCKETS_NAMESPACE || "";
export const TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH =
  import.meta.env.VITE_TAP_GOOSE_WEBSOCKET_HANDSHAKE_PATH || "/api/tap-goose-game/socket.io";

export const CHAT_WEBSOCKET_URL = import.meta.env.VITE_CHAT_WEBSOCKET_URL || "wss://localhost/api";
export const CHAT_WEBSOCKETS_NAMESPACE = import.meta.env.VITE_CHAT_WEBSOCKETS_NAMESPACE || "";
export const CHAT_WEBSOCKET_HANDSHAKE_PATH =
  import.meta.env.VITE_CHAT_WEBSOCKET_HANDSHAKE_PATH || "/api/chat/socket.io";
