import { authAPI } from "@/src/API/routes/auth";
import { userAPI } from "@/src/API/routes/user";
import type { User, OnlineUserInfo } from "@/src/store/types";
import { authTokenService } from "./authTokenService";
import { parseServerUserInfoToClientUserInfo, parseServerUserToClientUser } from "./utils";
import { useUserStore } from "@/src/store/userStore";

/**
 * Сервис для бизнес-логики пользователя: логин, регистрация, получение профиля, логаут.
 */
export const userService = {
  /**
   * Логин пользователя и получение его профиля.
   * @param email
   * @param password
   * @returns {Promise<User>}
   */
  async loginAndFetchUser(email: string, password: string): Promise<User> {
    const { token } = await authAPI.login(email, password);
    authTokenService.set(token);

    const user = await userAPI.getCurrentUser();
    return parseServerUserToClientUser(user);
  },

  /**
   * Регистрация пользователя и получение его профиля.
   * @param email
   * @param username
   * @param password
   * @returns {Promise<User>}
   */
  async registerAndFetchUser(email: string, username: string, password: string): Promise<User> {
    const { token } = await authAPI.register(email, username, password);
    authTokenService.set(token);

    const user = await userAPI.getCurrentUser();
    return parseServerUserToClientUser(user);
  },

  /**
   * Получить текущего пользователя.
   * @returns {Promise<User>}
   */
  async getCurrentUser(): Promise<User> {
    const user = await userAPI.getCurrentUser();
    return parseServerUserToClientUser(user);
  },

  /**
   * Получить пользователей онлайн.
   * @returns {Promise<User>}
   */
  async getOnlineUsers(): Promise<Array<OnlineUserInfo>> {
    const usersInfo = await userAPI.getOnlineUsers();
    const parsedUsersInfo = usersInfo.map((item) => parseServerUserInfoToClientUserInfo(item));
    return parsedUsersInfo;
  },

  /**
   * Логаут пользователя.
   */
  async logout(): Promise<void> {
    await authAPI.logout();
    useUserStore.getState().setUser(null);
    authTokenService.remove();
  },

  /**
   * Сообщить серверу через WebSocket, что пользователь онлайн.
   */
  async IAMOnline(): Promise<void> {
    await userAPI.IAMOnlineWS();
  },
};
