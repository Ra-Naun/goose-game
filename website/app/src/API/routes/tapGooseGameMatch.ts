// src/API/routes/match.ts
import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import { apiClient } from "../client/apiClient";
import { wsClientTapGoose } from "../client/wsClientTapGoose";
import type {
  GameMatch,
  GameMatchFromServer,
  HistoryOfGameMatch,
  JoinToMatchPayload,
  CreateMatchPayload,
  TapGoosePayload,
  ActiveMatchIsEnded,
} from "../types/match.types";
import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";

const NAMESPACE = "/tap-goose-game";

export const matchAPI = {
  /**
   * Получить список доступных матчей
   * @returns {Promise<GameMatchFromServer[]>}
   */
  getAvailableMatches: async (): Promise<GameMatchFromServer[]> => {
    try {
      return await apiClient.get<GameMatchFromServer[]>(`${NAMESPACE}/matches/available`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить данные о матче, в котором участвует игрок
   * @returns {Promise<GameMatchFromServer>}
   */
  getPlayerActiveMatch: async (matchId: string): Promise<GameMatchFromServer | ActiveMatchIsEnded> => {
    try {
      return await apiClient.get<GameMatchFromServer | ActiveMatchIsEnded>(`${NAMESPACE}/match/active/${matchId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить историю матчей пользователя
   * @param userId
   * @returns {Promise<HistoryOfGameMatch[]>}
   */
  getUserMatchesHistory: async (userId: string): Promise<HistoryOfGameMatch[]> => {
    try {
      return await apiClient.get<HistoryOfGameMatch[]>(`${NAMESPACE}/matches/history/user/${userId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить историю матча пользователя
   * @param userId
   * @returns {Promise<HistoryOfGameMatch>}
   */
  getUserMatchHistory: async (matchId: string): Promise<HistoryOfGameMatch> => {
    try {
      return await apiClient.get<HistoryOfGameMatch>(`${NAMESPACE}/matches/history/match/${matchId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  createMatchWS: async (payload: CreateMatchPayload): Promise<string> => {
    try {
      const res = await wsClientTapGoose.send<{ matchId: string }>(WEBSOCKET_CHANEL_SEND.CREATE_MATCH, payload);
      return res.matchId;
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  joinToMatchWS: async (payload: JoinToMatchPayload) => {
    try {
      return await wsClientTapGoose.send(WEBSOCKET_CHANEL_SEND.MATCH_USER_JOIN, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  /**
   * Отправить действие "тап" в матч через WebSocket
   * @param matchId
   * @returns {Promise<void>}
   */
  tapGooseWS: async (payload: TapGoosePayload): Promise<void> => {
    try {
      await wsClientTapGoose.send(WEBSOCKET_CHANEL_SEND.GOOSE_TAP, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
