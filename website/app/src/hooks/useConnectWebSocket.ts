import { useEffect } from "react";
import { useWebSocketStore } from "@/src/store/webSocketStore";
import type { WebsocketClient } from "@/src/client/websocketClient";

export function useConnectWebSocket(wsClient: WebsocketClient) {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClient.id]);

  useEffect(() => {
    if (!isConnected) {
      wsClient.connect();
    }
  }, [isConnected]);

  return isConnected;
}
