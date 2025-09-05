import { useEffect, useRef } from "react";
import { userService } from "@/src/services/userService";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { I_AM_ONLINE_INTERVAL } from "@/src/config/ws.config";
import { useWebSocketStore } from "@/src/store/webSocketStore";

export function useIAMOnline() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = useWebSocketStore((state) => state.connected);

  useEffect(() => {
    if (isConnected) {
      const sendOnlineSignal = async () => {
        try {
          await userService.IAMOnline();
        } catch (error) {
          UserNotificationService.showError((error as Error).message);
        }
      };

      sendOnlineSignal();

      intervalRef.current = setInterval(sendOnlineSignal, I_AM_ONLINE_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected]);
}
