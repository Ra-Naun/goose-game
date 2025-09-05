import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/src/services/matchService";
import { STALE_TIME } from "@/src/config/tanQuery";

export const useMatchesHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["matchesHistory", userId],
    queryFn: () => matchService.getUserMatchesHistory(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });
};

export const useMatchHistory = (matchId: string) => {
  return useQuery({
    queryKey: ["matchHistory", matchId],
    queryFn: () => matchService.getUserMatchHistory(matchId),
    enabled: !!matchId,
    staleTime: STALE_TIME,
  });
};
