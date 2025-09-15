import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";
import { apiClient } from "../client/apiClient";
import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import type { UserFromServer, UserInfoFromServer } from "../types/user.types";
import { wsClientUser } from "../client/wsClientUser";

const NAMESPACE = "/user";

/**
 * API методы для работы с пользователями.
 *
 * Объект userAPI предоставляет методы для получения информации о текущем пользователе,
 * списка онлайн пользователей, а также отправки сигнала через WebSocket, что текущий пользователь в сети.
 *
 * Методы возвращают промисы с данными или void в случае событий.
 *
 * @namespace userAPI
 *
 * @example
 * // Получить данные текущего пользователя
 * const currentUser = await userAPI.getCurrentUser();
 *
 * @example
 * // Получить список пользователей онлайн
 * const onlineUsers = await userAPI.getOnlineUsers();
 *
 * @example
 * // Отправить сигнал через WebSocket, что текущий пользователь в сети
 * userAPI.IAMOnlineWS(onOnlineUsersUpdate);
 */
export const userAPI = {
  /**
   * Получить информацию о текущем пользователе.
   *
   * Выполняет HTTP GET запрос к серверу для получения данных авторизованного пользователя.
   *
   * @returns {Promise<UserFromServer>} Промис с объектом пользователя, включая id, email, username, avatarUrl, роли и статус активности игры.
   *
   * @throws {Error} Генерируется при ошибках запроса, преобразуется через transformAxiosError.
   *
   * @example
   * const user = await userAPI.getCurrentUser();
   */
  getCurrentUser: async (): Promise<UserFromServer> => {
    try {
      return await apiClient.get<UserFromServer>(`${NAMESPACE}/me`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Получить список онлайн пользователей.
   *
   * Выполняет HTTP GET запрос для получения массива пользователей, которые сейчас онлайн.
   *
   * @returns {Promise<UserInfoFromServer[]>} Промис с массивом объектов пользователей с базовой информацией и статусом онлайн.
   *
   * @throws {Error} Генерируется при ошибках HTTP запроса.
   *
   * @example
   * const onlineUsers = await userAPI.getOnlineUsers();
   */
  getOnlineUsers: async (): Promise<Array<UserInfoFromServer>> => {
    try {
      return await apiClient.get<Array<UserInfoFromServer>>(`${NAMESPACE}/online-users`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Отправляет периодический сигнал «я в сети» на сервер через WebSocket.
   *
   * Этот метод организует отправку сигнала на сервер каждые 30 секунд,
   * чтобы поддерживать статус текущего пользователя как онлайн.
   * Используется для информирования сервера, что пользователь активен
   * и находится в сети.
   *
   * @returns {void}
   *
   * @example
   * userAPI.IAMOnlineWS((users) => {
   *   console.log("Пользователи онлайн:", users);
   * });
   */
  IAMOnlineWS: async () => {
    try {
      await wsClientUser.send(WEBSOCKET_CHANEL_SEND.ONLINE_USER);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
