import { apiClient } from "../client/apiClient";
import type { LoginReturn, LogoutReturn, RegisterReturn } from "../types/auth.types";
import { transformAxiosError } from "../utils/parseError";

const NAMESPACE = "/auth";

// Auth API methods
export const authAPI = {
  /**
   * Login user
   * @param email
   * @param password
   * @returns {Promise<LoginReturn>}
   */
  login: async (email: string, password: string) => {
    try {
      return apiClient.post<LoginReturn>(`${NAMESPACE}/login`, { email, password });
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Logout user
   * @returns {Promise<LogoutReturn>}
   */
  logout: async () => {
    try {
      return apiClient.post<LogoutReturn>(`${NAMESPACE}/logout`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Register user
   * @param email
   * @param username
   * @param password
   * @returns {Promise<RegisterReturn>}
   */
  register: async (email: string, username: string, password: string) => {
    try {
      return apiClient.post<RegisterReturn>(`${NAMESPACE}/register`, { email, username, password });
    } catch (error) {
      throw transformAxiosError(error);
    }
  },
};
