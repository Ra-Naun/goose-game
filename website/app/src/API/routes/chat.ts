import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import { apiClient } from "../client/apiClient";
import { wsClientChat } from "../client/wsClientChat";
import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";
import type { ChatMessage } from "@/src/store/types";
import type { ClearMessagePayload, DeleteMessagePayload, SendMessageInCommonChatPayload } from "../types/chat.types";

const NAMESPACE = "/chat";

/**

API методы для работы с чатом

Объект chatAPI содержит набор асинхронных методов для взаимодействия с сервером

с целью управления сообщениями чата и чат-каналами. Методы используют HTTP или WebSocket

для запросов и обеспечивают обработку ошибок.

Методы:

getChatHistory: Получение истории сообщений указанного канала через HTTP GET.

sendMessageWS: Отправка сообщения в чат через WebSocket.

deleteMessageWS: Удаление сообщения по идентификатору через WebSocket.

deleteAllMessagesWS: Очистка всех сообщений указанного канала через WebSocket.

Все методы возвращают промисы, которые разрешаются с результатом вызова или отклоняются

с обработанной ошибкой.

@namespace chatAPI

@example

// Получить историю сообщений канала

const messages = await chatAPI.getChatHistory("channel-123");

@example

// Отправить сообщение в чат

await chatAPI.sendMessageWS({ channelId: "abc123", content: "Hello, world!" });

@example

// Удалить сообщение по id

await chatAPI.deleteMessageWS({ messageId: "msg123" });

@example

// Очистить все сообщения в канале

await chatAPI.deleteAllMessagesWS({ channelId: "channel123" });
*/
export const chatAPI = {
  /**
   * Получить историю сообщений чата.
   *
   * Выполняет HTTP GET запрос к серверу для получения истории сообщений
   * указанного канала чата.
   *
   * @param {string} channelId - Идентификатор канала чата, для которого
   *                             запрашивается история сообщений.
   *
   * @returns {Promise<ChatMessage[]>} Промис, который разрешается массивом
   *                                   сообщений типа ChatMessage.
   *
   * @throws {Error} Бросает ошибку, преобразованную через transformAxiosError,
   *                 при неудачном запросе к серверу.
   *
   * @example
   * const messages = await chatAPI.getChatHistory("channel-123");
   */
  getChatHistory: async (channelId: string): Promise<ChatMessage[]> => {
    try {
      return await apiClient.get<ChatMessage[]>(`${NAMESPACE}/history/${channelId}`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Отправить сообщение в чат через WebSocket.
   *
   * @param {SendMessageInCommonChatPayload} payload -
   *          Объект с параметрами текст сообщения и идентификатор чата.
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Может выбрасывать ошибки, преобразованные через transformWebsocketsError,
   *          если соединение недоступно или произошла ошибка передачи.
   *
   * @example
   * await chatAPI.sendMessageWS({ channelId: "abc123", content: "Hello, world!" });
   */
  sendMessageWS: async (payload: SendMessageInCommonChatPayload): Promise<void> => {
    try {
      await wsClientChat.send(WEBSOCKET_CHANEL_SEND.SEND_MESSAGE, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  /**
   * Удалить сообщение из чата по идентификатору через WebSocket.
   *
   * Отправляет запрос на сервер на удаление сообщения с указанным messageId
   *
   * @param {DeleteMessagePayload} payload - Объект с параметрами запроса,
   *        содержащий уникальный идентификатор сообщения для удаления.
   *
   * @returns {Promise<void>} Промис, который разрешается при успешном удалении,
   *          либо отклоняется с ошибкой при неудаче.
   *
   * @throws {Error} Ошибка может быть выброшена, если произошла проблема с соединением
   *         или обработкой запроса, преобразуется через transformWebsocketsError.
   *
   * @example
   * await chatAPI.deleteMessageWS({ messageId: "msg123" });
   */
  deleteMessageWS: async (payload: DeleteMessagePayload): Promise<void> => {
    try {
      await wsClientChat.send(WEBSOCKET_CHANEL_SEND.DELETE_MESSAGE, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },

  /**
   * Очистить все сообщения в канале чата через WebSocket.
   *
   * Отправляет запрос на сервер для удаления всей истории сообщений в указанном канале.
   *
   * @param {ClearMessagePayload} payload - Объект с параметрами запроса,
   *        содержащий идентификатор канала.
   *
   * @returns {Promise<void>} Промис, который разрешается при успешном выполнении операции,
   *          либо отклоняется с ошибкой в случае неудачи.
   *
   * @throws {Error} Может выбрасывать ошибки, преобразованные через transformWebsocketsError,
   *         если произошла ошибка соединения или обработки.
   *
   * @example
   * await chatAPI.deleteAllMessagesWS({ channelId: "channel123" });
   */
  deleteAllMessagesWS: async (payload: ClearMessagePayload): Promise<void> => {
    try {
      await wsClientChat.send(WEBSOCKET_CHANEL_SEND.DELETE_ALL_MESSAGES, payload);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
