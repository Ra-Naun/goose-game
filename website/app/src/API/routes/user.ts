import { transformAxiosError, transformWebsocketsError } from "../utils/parseError";
import { apiClient } from "../client/apiClient";
import { wsClient } from "../client/wsClient";
import { WEBSOCKET_CHANEL_SEND } from "@/src/config/ws.config";
import type { UserFromServer, UserInfoFromServer } from "../types/user.types";

const NAMESPACE = "/user";

export const userAPI = {
  /**
   * Get current user info
   * @returns {Promise<UserFromServer>}
   */
  getCurrentUser: async (): Promise<UserFromServer> => {
    try {
      return apiClient.get<UserFromServer>(`${NAMESPACE}/me`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Get online users info
   * @returns {Promise<Array<UserInfoFromServer>>}
   */
  getOnlineUsers: async (): Promise<Array<UserInfoFromServer>> => {
    try {
      return await apiClient.get<Array<UserInfoFromServer>>(`${NAMESPACE}/online-users`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  IAMOnlineWS: async () => {
    try {
      await wsClient.send(WEBSOCKET_CHANEL_SEND.ONLINE_USER);
    } catch (error) {
      throw transformWebsocketsError(error);
    }
  },
};
