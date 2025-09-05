import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useGameStore } from "@/src/store/gameStore";
import { useEffect } from "react";
import { userService } from "@/src/services/userService";

export const useOnlineUsers = () => {
  const setOnlineUsers = useGameStore((state) => state.setOnlineUsers);
  const onlineUsers = useGameStore((state) => state.onlineUsers);
  const queryResult = useQuery({
    queryKey: ["onlineUsers"],
    queryFn: () => userService.getOnlineUsers(),
    staleTime: STALE_TIME,
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
    data: Object.values(onlineUsers),
  };
};
