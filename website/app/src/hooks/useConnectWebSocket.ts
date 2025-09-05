import { useEffect } from "react";
import { wsClient } from "@/src/API/client/wsClient";
import { useWebSocketStore } from "@/src/store/webSocketStore";

export function useConnectWebSocket() {
  const isConnected = useWebSocketStore((state) => state.connected);

  useEffect(() => {
    if (!isConnected) {
      wsClient.connect();
    }
  }, [isConnected]);

  return isConnected;
}
