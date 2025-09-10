import { matchAPI } from "@/src/API/routes/tapGooseGameMatch";
import type {
  GameMatch,
  HistoryOfGameMatch,
  JoinToMatchPayload,
  CreateMatchPayload,
  TapGoosePayload,
  ActiveMatchIsEnded,
} from "@/src/API/types/match.types";
import { parseServerMatchDataToClientMatchData, parseServerMatchDataToClientMatchDataWithEndedMatches } from "./utils";

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
    return matches.map((item) => parseServerMatchDataToClientMatchData(item));
  },

  /**
   * Получить данные о матче, в котором участвует игрок
   * @returns {Promise<GameMatch>}
   */
  getPlayerActiveMatch: async (matchId: string): Promise<GameMatch | ActiveMatchIsEnded> => {
    const match = await matchAPI.getPlayerActiveMatch(matchId);
    return parseServerMatchDataToClientMatchDataWithEndedMatches(match);
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
  async createMatchWS(payload: CreateMatchPayload): Promise<string> {
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

  /**
   * Отправить действие "тап" в матч через WebSocket
   * @param matchId
   * @returns {Promise<void>}
   */
  tapGooseWS: async (payload: TapGoosePayload): Promise<void> => {
    await matchAPI.tapGooseWS(payload);
  },
};
