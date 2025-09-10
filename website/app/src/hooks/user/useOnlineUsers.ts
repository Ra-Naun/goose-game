import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useEffect } from "react";
import { userService } from "@/src/services/userService";
import { useOnlineUsersStore } from "@/src/store/onlineUsersStore";
import { useWebSocketStore } from "@/src/store/webSocketStore";
import { wsClientUser } from "@/src/API/client/wsClientUser";

export const useOnlineUsers = () => {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientUser.id]);
  const setOnlineUsers = useOnlineUsersStore((state) => state.setOnlineUsers);
  const onlineUsers = useOnlineUsersStore((state) => state.onlineUsers);
  const queryResult = useQuery({
    queryKey: ["onlineUsers"],
    queryFn: () => userService.getOnlineUsers(),
    enabled: !!isConnected,
    staleTime: STALE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!queryResult.data) return;
    const onlyNewOnlineUsers = queryResult.data.filter((newUser) => {
      return !onlineUsers[newUser.id];
    });
    if (onlyNewOnlineUsers.length === 0) return;
    const updateDataOnlineUsers = [...Object.values(onlineUsers), ...onlyNewOnlineUsers];
    setOnlineUsers(updateDataOnlineUsers);
  }, [queryResult.data, setOnlineUsers, onlineUsers]);

  return {
    ...queryResult,
    isLoading: !isConnected || queryResult.isLoading,
    data: Object.values(onlineUsers),
  };
};
