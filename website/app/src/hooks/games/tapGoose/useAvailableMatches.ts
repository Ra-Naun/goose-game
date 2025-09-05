import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/src/services/matchService";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useGameStore } from "@/src/store/gameStore";
import { useEffect } from "react";

export const useAvailableMatches = () => {
  const addMatch = useGameStore((state) => state.addMatch);
  const matches = useGameStore((state) => state.matches);
  const queryResult = useQuery({
    queryKey: ["availableMatches"],
    queryFn: () => matchService.getAvailableMatches(),
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (!queryResult.data) return;
    queryResult.data.forEach((match) => {
      if (!matches[match.id]) {
        addMatch(match);
      }
    });
  }, [queryResult.data, addMatch, matches]);
  return {
    ...queryResult,
    data: Object.values(matches),
  };
};
