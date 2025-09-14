import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/src/services/matchService";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useEffect, useMemo } from "react";
import { useWebSocketStore } from "@/src/store/ws/webSocketStore";
import { wsClientTapGoose } from "@/src/API/client/wsClientTapGoose";
import { useActiveUserGameStore } from "@/src/store/games/tapGoose/activeUserGamesStore";

export const useActiveUserMatch = (matchId: string) => {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientTapGoose.id]);
  const setMatch = useActiveUserGameStore((state) => state.setMatch);
  const activeMatch = useActiveUserGameStore((state) => state.match);
  const queryResult = useQuery({
    queryKey: [`activeMatch:${matchId}`],
    queryFn: () => matchService.getPlayerActiveMatch(matchId),
    enabled: !!isConnected && !!matchId,
    staleTime: STALE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!queryResult.data) return;
    setMatch(queryResult.data);
  }, [queryResult.data]);

  return useMemo(
    () => ({
      ...queryResult,
      isLoading: !isConnected || !matchId || queryResult.isLoading,
      data: activeMatch,
    }),
    [queryResult, activeMatch]
  );
};
