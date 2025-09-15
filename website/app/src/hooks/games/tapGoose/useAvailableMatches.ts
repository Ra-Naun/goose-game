import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/src/services/matchService";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useEffect, useMemo } from "react";
import { useWebSocketStore } from "@/src/store/ws/webSocketStore";
import { wsClientTapGoose } from "@/src/API/client/wsClientTapGoose";
import { useAvailableGamesStore } from "@/src/store/games/tapGoose/availableGamesStore";

export const useAvailableMatches = () => {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientTapGoose.id]);
  const setMatches = useAvailableGamesStore((state) => state.setMatches);
  const matches = useAvailableGamesStore((state) => state.matches);
  const queryResult = useQuery({
    queryKey: ["availableMatches"],
    queryFn: () => matchService.getAvailableMatches(),
    enabled: !!isConnected,
    staleTime: STALE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!queryResult.data) return;
    setMatches(queryResult.data);
  }, [queryResult.data]);

  return useMemo(
    () => ({
      ...queryResult,
      isLoading: !isConnected || queryResult.isLoading,
      data: Object.values(matches),
    }),
    [queryResult, matches]
  );
};
