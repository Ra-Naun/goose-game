import { useEffect } from "react";
import { wsClientTapGoose } from "@/src/API/client/wsClientTapGoose";
import { useWebSocketStore } from "@/src/store/webSocketStore";
import { useWSSubscribesData } from "./useWSSubscribesData";
import { useConnectWebSocket } from "../../useConnectWebSocket";

export function useWebSocketEventHandlers() {
  useConnectWebSocket(wsClientTapGoose);
  const subscribesData = useWSSubscribesData();
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientTapGoose.id]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const unsubs: Array<ReturnType<typeof wsClientTapGoose.subscribe>> = Object.entries(subscribesData).map(
      ([websocketChanelName, callback]) => {
        return wsClientTapGoose.subscribe(websocketChanelName, callback);
      }
    );

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [isConnected, subscribesData]);
}
