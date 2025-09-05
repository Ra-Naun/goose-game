export class ApiError extends Error {
  public statusCode: number;
  public data?: any; // Дополнительные данные, например ошибки валидации

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;

    // В TypeScript и ES5+ нужно явно указать прототип для instanceof корректной работы
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class WebsocketError extends Error {
  public code?: number | string;
  public data?: any;

  constructor(message: string, code?: number | string, data?: any) {
    super(message);
    this.name = "WebsocketError";
    this.code = code;
    this.data = data;
  }
}
