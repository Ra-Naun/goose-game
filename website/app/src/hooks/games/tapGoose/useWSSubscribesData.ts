import { useMemo } from "react";
import { useGameStore } from "@/src/store/gameStore";
import { WEBSOCKET_CHANEL_LISTEN } from "@/src/config/ws.config";
import type { GameMatch } from "@/src/API/types/match.types";
import type { WSSubscribesData } from "@/src/hooks/types";
import type { UpdateGameMatchDataFromServer, UpdatePartialOnlineUsers } from "@/src/store/types";
import { UserNotificationService } from "@/src/services/userNotificationService";

export function useWSSubscribesData(): WSSubscribesData {
  const updateOnlineUsers = useGameStore((state) => state.updateOnlineUsers);
  const addMatch = useGameStore((state) => state.addMatch);
  const updateMatchState = useGameStore((state) => state.updateMatchState);
  const addUserToMatch = useGameStore((state) => state.addUserToMatch);
  const removeUserFromMatch = useGameStore((state) => state.removeUserFromMatch);
  const addTapEvent = useGameStore((state) => state.addTapEvent);

  const wsSubscribesData = useMemo(
    () =>
      ({
        [WEBSOCKET_CHANEL_LISTEN.ONLINE_USERS_CHANGED]: (data: UpdatePartialOnlineUsers) => {
          updateOnlineUsers(data);
        },
        [WEBSOCKET_CHANEL_LISTEN.ONLINE_USER_ERROR]: ({ message }: { message: string }) => {
          UserNotificationService.showError(`Online user error received: ${message}`);
          console.warn("Online user error received: ", message);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_CREATED]: (match: GameMatch) => addMatch(match),
        [WEBSOCKET_CHANEL_LISTEN.CREATE_MATCH_ERROR]: ({ message }: { message: string }) => {
          UserNotificationService.showError(`Error creating match: ${message}`);
          console.warn("Error creating match: ", message);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_STATE_UPDATE]: (matchUpdate: UpdateGameMatchDataFromServer) => {
          updateMatchState(matchUpdate);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_USER_JOIN_SUCCESS]: ({
          playerId,
          matchId,
        }: {
          playerId: string;
          matchId: string;
        }) => {
          addUserToMatch(playerId, matchId);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_USER_JOIN_ERROR]: ({ message }: { message: string }) => {
          UserNotificationService.showError(`Error joining match: ${message}`);
          console.warn("Error joining match:", message);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_USER_LEFT_SUCCESS]: ({
          playerId,
          matchId,
        }: {
          playerId: string;
          matchId: string;
        }) => {
          removeUserFromMatch(playerId, matchId);
        },
        [WEBSOCKET_CHANEL_LISTEN.MATCH_USER_LEFT_ERROR]: ({ message }: { message: string }) => {
          UserNotificationService.showError(`Error leaving match: ${message}`);
          console.warn("Error leaving match:", message);
        },
        [WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP_SUCCESS]: (tapData: TapSuccessServerResponse) => {
          addTapEvent(tapData);
        },
        [WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP_ERROR]: ({ message }: { message: string }) => {
          UserNotificationService.showError(`Tap error received: ${message}`);
          console.warn("Tap error received:", message);
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
