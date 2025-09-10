import type { MatchPlayers, PlayerScores } from "@/src/API/types/match.types";
import type { ScoreWithPosition } from "@/src/API/types/tap-goose.types";
import { useMemo } from "react";

export const useSortedScores = (players?: MatchPlayers, scores?: PlayerScores) => {
  const sortedScores: Record<string, ScoreWithPosition> = useMemo(() => {
    if (!players || !scores) {
      return {};
    }
    return Object.entries(scores)
      .slice()
      .sort(([, aScore], [, bScore]) => bScore - aScore)
      .reduce(
        (acc, [playerId, score], i) => {
          const playerInfo = players[playerId];
          acc[playerId] = {
            playerId,
            score,
            position: i + 1,
            username: playerInfo.username,
            email: playerInfo.email,
          };
          return acc;
        },
        {} as Record<string, ScoreWithPosition>
      );
  }, [scores, players]);
  return sortedScores;
};
