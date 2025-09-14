import { chatAPI } from "../API/routes/chat";
import { UserRoleEnum, type ChatMessage, type UserInfo } from "../store/types";

/**
 * Сервис бизнес-логики работы с чатом
 */
export const chatService = {
  /**
   * Получить историю сообщений чата
   * @returns {Promise<ChatMessage[]>}
   */
  async getChatHistory(channelId: string): Promise<ChatMessage[]> {
    const messages = await chatAPI.getChatHistory(channelId);
    return messages;
  },

  /**
   * Отправить сообщение в чат через WebSocket
   * @param content - текст сообщения
   * @returns {Promise<void>}
   */
  async sendMessage(channelId: string, content: string): Promise<void> {
    await chatAPI.sendMessageWS({ channelId, content });
  },

  /**
   * Удалить сообщение из чата по id через WebSocket
   * @param messageId
   * @returns {Promise<void>}
   */
  deleteMessageWS: async (messageId: string): Promise<void> => {
    await chatAPI.deleteMessageWS({ messageId });
  },

  /**
   * Удалить все сообщения из чата по id через WebSocket
   * @param channelId
   * @returns {Promise<void>}
   */
  deleteAllMessagesWS: async (channelId: string): Promise<void> => {
    await chatAPI.deleteAllMessagesWS({ channelId });
  },

  /**
   * Проверка прав пользователя на удаление сообщений
   */
  canUserDeleteMessage(user: UserInfo, messageAuthorId: string): boolean {
    return user.roles.includes(UserRoleEnum.ADMIN) || user.id === messageAuthorId;
  },
};

export const COMMON_CHAT_ID = "common";
