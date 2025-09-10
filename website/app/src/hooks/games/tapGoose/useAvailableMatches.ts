import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/src/services/matchService";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useAvailableGamesStore } from "@/src/store/availableGamesStore";
import { useEffect, useMemo } from "react";
import { useWebSocketStore } from "@/src/store/webSocketStore";
import { wsClientTapGoose } from "@/src/API/client/wsClientTapGoose";

export const useAvailableMatches = () => {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientTapGoose.id]);
  const addMatch = useAvailableGamesStore((state) => state.addMatch);
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
    queryResult.data.forEach((match) => {
      if (!matches[match.id]) {
        addMatch(match);
      }
    });
  }, [queryResult.data, addMatch, matches]);

  return useMemo(
    () => ({
      ...queryResult,
      isLoading: !isConnected || queryResult.isLoading,
      data: Object.values(matches),
    }),
    [queryResult, matches]
  );
};
