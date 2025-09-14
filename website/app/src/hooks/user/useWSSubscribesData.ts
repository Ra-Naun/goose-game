import { useMemo } from "react";
import { WEBSOCKET_CHANEL_LISTEN } from "@/src/config/ws.config";
import type { WSSubscribesData } from "@/src/hooks/types";
import type { UpdatePartialOnlineUsers } from "@/src/store/types";
import { useOnlineUsersStore } from "@/src/store/user/onlineUsersStore";

export function useWSSubscribesData(): WSSubscribesData {
  const updateOnlineUsers = useOnlineUsersStore((state) => state.updateOnlineUsers);

  const wsSubscribesData = useMemo(
    () =>
      ({
        [WEBSOCKET_CHANEL_LISTEN.ONLINE_USERS_CHANGED]: (data: UpdatePartialOnlineUsers) => {
          updateOnlineUsers(data);
        },
      }) as const,
    []
  );
  return wsSubscribesData;
}
