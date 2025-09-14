import { apiClient } from "../client/apiClient";
import type { LoginReturn, LogoutReturn, RegisterReturn } from "../types/auth.types";
import { transformAxiosError } from "../utils/parseError";

const NAMESPACE = "/auth";

/**
Набор методов API для работы с аутентификацией пользователей.

Объект authAPI предоставляет асинхронные методы для входа,

выхода и регистрации пользователей, взаимодействуя с сервером через HTTP-запросы.

Все методы возвращают промисы с соответствующими данными или ошибками.

Методы:

login: Выполняет вход пользователя с email и паролем, возвращает токен.

logout: Выполняет выход пользователя.

register: Регистрирует нового пользователя с email, username и паролем, возвращает токен.

Ошибки запросов обрабатываются и трансформируются для единообразия UI.

@namespace authAPI

@example

// Выполнить вход пользователя

const response = await authAPI.login("user@example.com", "password123");

console.log(response.token);

@example

// Выполнить выход

const logoutResponse = await authAPI.logout();

console.log(logoutResponse.message);

@example

// Зарегистрировать нового пользователя

const registerResponse = await authAPI.register("new@example.com", "newuser", "securepassword");

console.log(registerResponse.token);
*/
export const authAPI = {
  /**
   * Выполнить вход пользователя.
   *
   * Отправляет POST-запрос для аутентификации пользователя с указанными email и password.
   *
   * @param {string} email - Электронная почта пользователя.
   * @param {string} password - Пароль пользователя.
   * @returns {Promise<LoginReturn>} Промис с объектом, содержащим токен аутентификации.
   *
   * @throws {Error} Выбрасывает ошибку, преобразованную через transformAxiosError, при неудачном запросе.
   *
   * @example
   * const response = await authAPI.login("user@example.com", "password123");
   * console.log(response.token);
   */
  login: async (email: string, password: string) => {
    try {
      return await apiClient.post<LoginReturn>(`${NAMESPACE}/login`, { email, password });
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Выполнить выход пользователя.
   *
   * Отправляет POST-запрос для завершения сессии пользователя.
   *
   * @returns {Promise<LogoutReturn>} Промис с объектом, содержащим сообщение о выходе.
   *
   * @throws {Error} Выбрасывает ошибку, преобразованную через transformAxiosError, при неудаче.
   *
   * @example
   * const response = await authAPI.logout();
   * console.log(response.message);
   */
  logout: async () => {
    try {
      return await apiClient.post<LogoutReturn>(`${NAMESPACE}/logout`);
    } catch (error) {
      throw transformAxiosError(error);
    }
  },

  /**
   * Зарегистрировать нового пользователя.
   *
   * Отправляет POST-запрос с параметрами email, username и password для создания новой учетной записи.
   *
   * @param {string} email - Электронная почта нового пользователя.
   * @param {string} username - Имя пользователя.
   * @param {string} password - Пароль для новой учетной записи.
   * @returns {Promise<RegisterReturn>} Промис с объектом, содержащим токен аутентификации.
   *
   * @throws {Error} Выбрасывает ошибку, преобразованную через transformAxiosError, при неудачном запросе.
   *
   * @example
   * const response = await authAPI.register("new@example.com", "newuser", "securepassword");
   * console.log(response.token);
   */
  register: async (email: string, username: string, password: string) => {
    try {
      return await apiClient.post<RegisterReturn>(`${NAMESPACE}/register`, { email, username, password });
    } catch (error) {
      throw transformAxiosError(error);
    }
  },
};
