import { matchAPI } from "@/src/API/routes/match";
import type { GameMatch, HistoryOfGameMatch, JoinToMatchPayload, NewMatchPayload } from "@/src/API/types/match.types";

/**
 * Сервис для бизнес-логики работы с матчами: получение матчей, создание и история.
 */
export const matchService = {
  /**
   * Получить доступные матчи.
   * @returns {Promise<Match[]>}
   */
  async getAvailableMatches(): Promise<GameMatch[]> {
    const matches = await matchAPI.getAvailableMatches();
    return matches;
  },

  /**
   * Получить историю матчей пользователя по userId.
   * @param userId
   * @returns {Promise<HistoryOfGameMatch[]>}
   */
  async getUserMatchesHistory(userId: string): Promise<HistoryOfGameMatch[]> {
    const history = await matchAPI.getUserMatchesHistory(userId);
    return history;
  },

  /**
   * Получить историю матча по matchId.
   * @param matchId
   * @returns {Promise<HistoryOfGameMatch>}
   */
  async getUserMatchHistory(matchId: string): Promise<HistoryOfGameMatch> {
    const history = await matchAPI.getUserMatchHistory(matchId);
    return history;
  },

  /**
   * Создать новый матч.
   * @param payload
   * @returns {Promise<void>}
   */
  async createMatchWS(payload: NewMatchPayload): Promise<string> {
    return await matchAPI.createMatchWS(payload);
  },

  /**
   * Присоедениться к матчу.
   * @param payload
   * @returns {Promise<void>}
   */
  async joinToMatchWS(payload: JoinToMatchPayload): Promise<void> {
    await matchAPI.joinToMatchWS(payload);
  },
};
