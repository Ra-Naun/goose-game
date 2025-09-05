import { useEffect } from "react";
import { wsClient } from "@/src/API/client/wsClient";
import { useWebSocketStore } from "@/src/store/webSocketStore";
import { useWSSubscribesData } from "./games/tapGoose/useWSSubscribesData";

export function useWebSocketEventHandlers() {
  const tapGooseSubscribesData = useWSSubscribesData();
  const isConnected = useWebSocketStore((state) => state.connected);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const unsubs: Array<ReturnType<typeof wsClient.subscribe>> = Object.entries(tapGooseSubscribesData).map(
      ([websocketChanelName, callback]) => {
        return wsClient.subscribe(websocketChanelName, callback);
      },
    );

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [isConnected, tapGooseSubscribesData]);
}
