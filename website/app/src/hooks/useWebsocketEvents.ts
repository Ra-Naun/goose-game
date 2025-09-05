import { useEffect } from "react";
import { wsClient } from "@/src/API/client/wsClient";
import { useWebSocketStore } from "@/src/store/webSocketStore";

export function useWebSocketEvent(event: string, handler: (data: any) => void) {
  const isConnected = useWebSocketStore((state) => state.connected);
  useEffect(() => {
    if (!isConnected) {
      return;
    }
    const unsubscribe = wsClient.subscribe(event, handler);

    return () => {
      unsubscribe();
    };
  }, [event, handler, isConnected]);
}
