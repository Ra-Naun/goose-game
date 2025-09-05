// src/API/routes/match.ts
import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import { apiClient } from "../client/apiClient";
import { wsClient } from "../client/wsClient";
import type { GameMatch, HistoryOfGameMatch, JoinToMatchPayload, NewMatchPayload } from "../types/match.types";
import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";
import { ROUND_DURATION, MAX_PLAYERS_IN_MATCH, COOLDOWN_DURATION } from "../config";

const NAMESPACE = "/tap-goose-game";

export const matchAPI = {
  /**
   * Получить список доступных матчей
   * @returns {Promise<GameMatch[]>}
   */
  getAvailableMatches: async (): Promise<GameMatch[]> => {
    try {
      return apiClient.get<GameMatch[]>(`${NAMESPACE}/matches/available`);
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
      return apiClient.get<HistoryOfGameMatch[]>(`${NAMESPACE}/matches/history/user/${userId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить историю матча пользователя
   * @param userId
   * @returns {Promise<GameMatch>}
   */
  getUserMatchHistory: async (matchId: string): Promise<HistoryOfGameMatch> => {
    try {
      return apiClient.get<HistoryOfGameMatch>(`${NAMESPACE}/matches/history/match/${matchId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  createMatchWS: async (payload: NewMatchPayload): Promise<string> => {
    try {
      const {
        title = "Новый матч",
        maxPlayers = MAX_PLAYERS_IN_MATCH,
        cooldownMs = COOLDOWN_DURATION,
        matchDurationSeconds = ROUND_DURATION,
      } = payload;

      const preparedPayload = {
        title,
        maxPlayers,
        cooldownMs,
        matchDurationSeconds,
      };
      const res = await wsClient.send<{ matchId: string }>(WEBSOCKET_CHANEL_SEND.CREATE_MATCH, preparedPayload);
      return res.matchId;
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  joinToMatchWS: async (payload: JoinToMatchPayload) => {
    try {
      return wsClient.send(WEBSOCKET_CHANEL_SEND.MATCH_USER_JOIN, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
