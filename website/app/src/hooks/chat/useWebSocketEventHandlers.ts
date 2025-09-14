import { useEffect } from "react";
import { useWebSocketStore } from "@/src/store/ws/webSocketStore";
import { useWSSubscribesData } from "./useWSSubscribesData";
import { useConnectWebSocket } from "../ws/useConnectWebSocket";
import { wsClientChat } from "@/src/API/client/wsClientChat";

export function useWebSocketEventHandlers() {
  useConnectWebSocket(wsClientChat);
  const subscribesData = useWSSubscribesData();
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientChat.id]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const unsubs: Array<ReturnType<typeof wsClientChat.subscribe>> = Object.entries(subscribesData).map(
      ([websocketChanelName, callback]) => {
        return wsClientChat.subscribe(websocketChanelName, callback);
      }
    );

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [isConnected, subscribesData]);
}
