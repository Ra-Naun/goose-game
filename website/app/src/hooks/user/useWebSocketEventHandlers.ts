import { useEffect } from "react";
import { useWebSocketStore } from "@/src/store/ws/webSocketStore";
import { useConnectWebSocket } from "../ws/useConnectWebSocket";
import { wsClientUser } from "@/src/API/client/wsClientUser";
import { useWSSubscribesData } from "./useWSSubscribesData";

export function useWebSocketEventHandlers() {
  useConnectWebSocket(wsClientUser);
  const subscribesData = useWSSubscribesData();
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientUser.id]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const unsubs: Array<ReturnType<typeof wsClientUser.subscribe>> = Object.entries(subscribesData).map(
      ([websocketChanelName, callback]) => {
        return wsClientUser.subscribe(websocketChanelName, callback);
      }
    );

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [isConnected, subscribesData]);
}
