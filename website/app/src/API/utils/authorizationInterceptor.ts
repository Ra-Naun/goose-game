import type { InternalAxiosRequestConfig } from "axios";
import { TOKEN_KEY } from "../config";

export const AuthorizationInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
};
