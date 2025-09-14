// src/API/routes/match.ts
import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import { apiClient } from "../client/apiClient";
import { wsClientTapGoose } from "../client/wsClientTapGoose";
import type {
  GameMatchFromServer,
  HistoryOfGameMatch,
  JoinToMatchPayload,
  CreateMatchPayload,
  TapGoosePayload,
  ActiveMatchIsEnded,
} from "../types/match.types";
import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";

const NAMESPACE = "/tap-goose-game";

/**
 * API методы для работы с матчами в игре.
 *
 * Объект matchAPI предоставляет методы для получения списка доступных матчей,
 * активного матча игрока, истории матчей, а также для создания и управления
 * матчами через WebSocket.
 *
 * Методы возвращают промисы, которые разрешаются соответствующими типизированными данными
 * или Void в случае действий без возвращаемого значения.
 *
 * @namespace matchAPI
 *
 * @example
 * Получить список доступных матчей
 * const matches = await matchAPI.getAvailableMatches();
 *
 * @example
 * // Получить активный матч игрока
 * const activeMatch = await matchAPI.getPlayerActiveMatch("matchId123");
 *
 * @example
 * // Получить историю матчей пользователя
 * const userHistory = await matchAPI.getUserMatchesHistory("userId123");
 *
 * @example
 * // Получить историю конкретного матча
 * const matchHistory = await matchAPI.getUserMatchHistory("matchId123");
 *
 * @example
 * // Создать новый матч через WebSocket
 * const matchId = await matchAPI.createMatchWS({ title: "Test Match", maxPlayers: 4 });
 *
 * @example
 * // Присоединиться к матчу через WebSocket
 * await matchAPI.joinToMatchWS({ matchId: "matchId123" });
 *
 * @example
 * // Отправить "тап" в матч через WebSocket
 * await matchAPI.tapGooseWS({ matchId: "matchId123" });
 */
export const matchAPI = {
  /**
   * Получить список доступных матчей.
   *
   * Выполняет HTTP GET запрос к серверу для получения массива матчей,
   * которые доступны для присоединения или просмотра.
   *
   * @returns {Promise<GameMatchFromServer[]>} Промис, разрешающийся массивом матчей.
   *
   * @throws {Error} Генерирует ошибку, преобразованную через transformAxiosError,
   *                 если запрос завершился неудачей.
   *
   * @example
   * const matches = await matchAPI.getAvailableMatches();
   */
  getAvailableMatches: async (): Promise<GameMatchFromServer[]> => {
    try {
      return await apiClient.get<GameMatchFromServer[]>(`${NAMESPACE}/matches/available`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить активный матч, в котором участвует игрок.
   *
   * Выполняет HTTP GET запрос, возвращая объект с деталями активного матча
   * или объект, указывающий, что матч уже завершён.
   *
   * @param {string} matchId - Идентификатор матча.
   * @returns {Promise<GameMatchFromServer | ActiveMatchIsEnded>} Промис, разрешающийся объектом матча или статусом завершения.
   *
   * @throws {Error} Генерирует ошибку при неудаче HTTP запроса.
   *
   * @example
   * const activeMatch = await matchAPI.getPlayerActiveMatch("matchId123");
   */
  getPlayerActiveMatch: async (matchId: string): Promise<GameMatchFromServer | ActiveMatchIsEnded> => {
    try {
      return await apiClient.get<GameMatchFromServer | ActiveMatchIsEnded>(`${NAMESPACE}/match/active/${matchId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить историю всех матчей пользователя.
   *
   * Выполняет HTTP GET запрос для получения массива историй матчей,
   * связанных с указанным пользователем.
   *
   * @param {string} userId - Идентификатор пользователя.
   * @returns {Promise<HistoryOfGameMatch[]>} Промис с массивом истории матчей.
   *
   * @throws {Error} Генерирует ошибку при ошибке запроса.
   *
   * @example
   * const history = await matchAPI.getUserMatchesHistory("userId123");
   */
  getUserMatchesHistory: async (userId: string): Promise<HistoryOfGameMatch[]> => {
    try {
      return await apiClient.get<HistoryOfGameMatch[]>(`${NAMESPACE}/matches/history/user/${userId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить историю конкретного матча.
   *
   * Выполняет HTTP GET запрос и возвращает историю (детали) указанного матча.
   *
   * @param {string} matchId - Идентификатор матча.
   * @returns {Promise<HistoryOfGameMatch>} Промис с деталями истории матча.
   *
   * @throws {Error} Генерирует ошибку при ошибке запроса.
   *
   * @example
   * const matchHistory = await matchAPI.getUserMatchHistory("matchId123");
   */
  getUserMatchHistory: async (matchId: string): Promise<HistoryOfGameMatch> => {
    try {
      return await apiClient.get<HistoryOfGameMatch>(`${NAMESPACE}/matches/history/match/${matchId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Создать новый матч через WebSocket.
   *
   * Принимает параметры нового матча и отправляет запрос на сервер для создания.
   * Возвращает уникальный идентификатор созданного матча.
   *
   * @param {CreateMatchPayload} payload - Параметры создания матча (название, максимальные игроки, длительность и др).
   * @returns {Promise<string>} Промис с ID созданного матча.
   *
   * @throws {Error} Генерирует ошибку через transformWebsocketsError при проблемах связи.
   *
   * @example
   * const newMatchId = await matchAPI.createMatchWS({ title: "New Game", maxPlayers: 4 });
   */
  createMatchWS: async (payload: CreateMatchPayload): Promise<string> => {
    try {
      const res = await wsClientTapGoose.send<{ matchId: string }>(WEBSOCKET_CHANEL_SEND.CREATE_MATCH, payload);
      return res.matchId;
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  /**
   * Присоединиться к матчу через WebSocket.
   *
   * Отправляет запрос для присоединения к уже существующему матчу.
   *
   * @param {JoinToMatchPayload} payload - Объект с идентификатором матча для присоединения.
   * @returns {Promise<void>} Промис, который разрешается после успешного присоединения.
   *
   * @throws {Error} Генерирует ошибку, если соединение по WebSocket не удалось.
   *
   * @example
   * await matchAPI.joinToMatchWS({ matchId: "matchId123" });
   */
  joinToMatchWS: async (payload: JoinToMatchPayload) => {
    try {
      return await wsClientTapGoose.send(WEBSOCKET_CHANEL_SEND.MATCH_USER_JOIN, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  /**
   * Отправить действие "тап" в матче через WebSocket.
   *
   * Отправляет событие игрового действия (тапа) на сервер для обновления состояния матча.
   *
   * @param {TapGoosePayload} payload - Объект с идентификатором матча для действия.
   * @returns {Promise<void>} Промис, который разрешается после успешной отправки.
   *
   * @throws {Error} Генерирует ошибку при проблемах передачи по WebSocket.
   *
   * @example
   * await matchAPI.tapGooseWS({ matchId: "matchId123" });
   */
  tapGooseWS: async (payload: TapGoosePayload): Promise<void> => {
    try {
      await wsClientTapGoose.send(WEBSOCKET_CHANEL_SEND.GOOSE_TAP, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
