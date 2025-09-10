import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAvailableGamesStore } from "@/src/store/availableGamesStore";
import { WEBSOCKET_CHANEL_LISTEN } from "@/src/config/ws.config";
import {
  MatchStatus,
  type GameMatch,
  type GameMatchFromServer,
  type MatchPlayerInfo,
} from "@/src/API/types/match.types";
import type { WSSubscribesData } from "@/src/hooks/types";
import type { EndedGameMatchDataFromServer, StartedGameMatchDataFromServer } from "@/src/store/types";
import { useActiveUserGameStore } from "@/src/store/activeUserGamesStore";
import { useUserStore } from "@/src/store/userStore";
import { parseServerMatchDataToClientMatchData } from "@/src/services/utils";

export function useWSSubscribesData(): WSSubscribesData {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const addAvailableMatch = useAvailableGamesStore((state) => state.addMatch);
  const removeAvailableMatch = useAvailableGamesStore((state) => state.removeMatch);
  const updateAvailableMatchState = useAvailableGamesStore((state) => state.updateMatchState);
  const getAvailableMatchById = useAvailableGamesStore((state) => state.getMatchById);
  const addUserToAvailableMatch = useAvailableGamesStore((state) => state.addUserToMatch);
  const removeUserFromAvailableMatch = useAvailableGamesStore((state) => state.removeUserFromMatch);

  const setActiveMatch = useActiveUserGameStore((state) => state.setMatch);
  const getActiveMatch = useActiveUserGameStore((state) => state.getMatch);
  const removeActiveMatch = useActiveUserGameStore((state) => state.removeMatch);
  const updateActiveMatchState = useActiveUserGameStore((state) => state.updateMatchState);
  const addUserToActiveMatch = useActiveUserGameStore((state) => state.addUserToMatch);
  const removeUserFromActiveMatch = useActiveUserGameStore((state) => state.removeUserFromMatch);

  const isCurrentActiveMatch = (matchIdFromEvent: string) => {
    const activeMatch = getActiveMatch();
    return activeMatch && activeMatch.status !== MatchStatus.FINISHED && activeMatch.id === matchIdFromEvent;
  };

  const wsSubscribesData = useMemo(
    () =>
      ({
        [WEBSOCKET_CHANEL_LISTEN.MATCH_CREATED]: (match: GameMatchFromServer) => {
          addAvailableMatch(parseServerMatchDataToClientMatchData(match));
        },

        [WEBSOCKET_CHANEL_LISTEN.MATCH_STARTED]: (matchUpdate: StartedGameMatchDataFromServer) => {
          queryClient.invalidateQueries({ queryKey: [`activeMatch:${matchUpdate.id}`] });
          const availableMatch = getAvailableMatchById(matchUpdate.id);
          if (user && availableMatch?.players && !availableMatch.players[user.id]) {
            removeAvailableMatch(matchUpdate.id);
          } else {
            const matchUpdateWithStatus = { ...matchUpdate, status: MatchStatus.ONGOING };
            updateAvailableMatchState(matchUpdateWithStatus);
            updateActiveMatchState(matchUpdateWithStatus);
          }
        },

        [WEBSOCKET_CHANEL_LISTEN.MATCH_ENDED]: (matchUpdate: EndedGameMatchDataFromServer) => {
          queryClient.invalidateQueries({ queryKey: [`activeMatch:${matchUpdate.id}`] });
          const availableMatch = getAvailableMatchById(matchUpdate.id);
          if (availableMatch) {
            removeAvailableMatch(matchUpdate.id);
          }

          if (isCurrentActiveMatch(matchUpdate.id)) {
            setActiveMatch({
              status: MatchStatus.FINISHED,
            });
          }
        },

        [WEBSOCKET_CHANEL_LISTEN.USER_JOINED]: ({
          matchPlayerInfo,
          matchId,
        }: {
          matchPlayerInfo: MatchPlayerInfo;
          matchId: string;
        }) => {
          queryClient.invalidateQueries({ queryKey: [`activeMatch:${matchId}`] });
          addUserToAvailableMatch(matchPlayerInfo, matchId);
          if (isCurrentActiveMatch(matchId)) {
            addUserToActiveMatch(matchPlayerInfo);
          }
        },

        [WEBSOCKET_CHANEL_LISTEN.USER_LEAVE]: ({ playerId, matchId }: { playerId: string; matchId: string }) => {
          queryClient.invalidateQueries({ queryKey: [`activeMatch:${matchId}`] });
          removeUserFromAvailableMatch(playerId, matchId);
          const activeMatch = getActiveMatch();

          if (user && playerId === user.id) {
            removeActiveMatch();
          } else if (activeMatch && activeMatch.status !== MatchStatus.FINISHED && matchId === activeMatch.id) {
            removeUserFromActiveMatch(playerId);
          }
        },

        [WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP_SUCCESS]: (tapData: TapSuccessServerResponse) => {
          const activeMatch = getActiveMatch();
          const newPlayerScore = { [tapData.playerId]: tapData.score };
          const newPlayerScoreLastTimeUpdate = { [tapData.playerId]: Date.now() };
          if (activeMatch && activeMatch.status !== MatchStatus.FINISHED && tapData.matchId === activeMatch.id) {
            const scores: GameMatch["scores"] = { ...activeMatch.scores, ...newPlayerScore };
            const scoresLastTimeUpdate: GameMatch["scoresLastTimeUpdate"] = {
              ...activeMatch.scoresLastTimeUpdate,
              ...newPlayerScoreLastTimeUpdate,
            };

            updateActiveMatchState({ id: tapData.matchId, scores, scoresLastTimeUpdate });
          }

          const availableMatch = getAvailableMatchById(tapData.matchId);
          if (availableMatch && tapData.matchId === availableMatch.id) {
            const scores = { ...availableMatch.scores, ...newPlayerScore };
            updateAvailableMatchState({ id: tapData.matchId, scores });
          }
        },
      }) as const,
    []
  );
  return wsSubscribesData;
}

type TapSuccessServerResponse = {
  playerId: string;
  matchId: string;
  score: number;
};
