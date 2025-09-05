import type { AxiosError } from "axios";
import { ApiError, WebsocketError } from "../helpers/errors";

export function transformAxiosError(err: unknown): ApiError {
  if (err && typeof err === "object" && "isAxiosError" in err && (err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      const message = (axiosErr.response.data as any)?.message || axiosErr.message;
      const status = axiosErr.response.status;
      const data = axiosErr.response.data;
      return new ApiError(message, status, data);
    }
    // Ошибка сети или таймаут
    return new ApiError(axiosErr.message, 0);
  }
  return new ApiError("Unknown error occurred", 0);
}

export function transformWebsocketsError(err: unknown): WebsocketError {
  if (err instanceof Error) {
    return new WebsocketError(err.message);
  }

  if (err && typeof err === "object") {
    const maybeErr = err as { message?: string; code?: number | string; data?: any };

    const message = maybeErr.message || "Unknown websocket error";
    const code = maybeErr.code;
    const data = maybeErr.data;

    return new WebsocketError(message, code, data);
  }

  return new WebsocketError("Unknown websocket error");
}
