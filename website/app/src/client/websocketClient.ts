import { io, Socket } from "socket.io-client";
import { authTokenService } from "../services/authTokenService";
import { useWebSocketStore } from "../store/webSocketStore";

type EventCallback = (data: any) => void;

interface Listeners {
  [event: string]: Set<EventCallback>;
}

// export const getStatusOkResponse = (payload: Record<string, any> = {}) => ({
//   status: 'ok',
//   ...payload,
// });

// export const getStatusErrorResponse = (message: string) => ({
//   status: 'error',
//   message,
// });

type StatusOkResponse<R> = {
  status: "ok";
} & R;

type StatusErrorResponse = {
  status: "error";
  message: string;
};

export class WebsocketClient {
  private socket: Socket | null = null;
  private listeners: Listeners = {};
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly url: string;
  private readonly namespace: string;
  private readonly path: string;

  constructor(url: string, namespace = "", path = "/socket.io") {
    this.url = url;
    this.namespace = namespace;
    this.path = path;
  }

  connect() {
    if (this.isConnected) {
      return;
    }

    const endpoint = this.namespace ? `${this.url}/${this.namespace}` : this.url;
    const token = authTokenService.get();

    this.socket = io(endpoint, {
      autoConnect: false,
      path: this.path,
      transports: ["websocket"],
      reconnectionAttempts: this.maxReconnectAttempts,
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.info(`WebSocket connected [id=${this.socket?.id}]`);
      this.reconnectAttempts = 0;
      if (!!this.socket?.id) {
        useWebSocketStore.getState().setConnected(true);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.warn(`WebSocket disconnected: ${reason}`);
      useWebSocketStore.getState().setConnected(false);
      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      console.error(`WebSocket connect error #${this.reconnectAttempts}:`, error);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max WebSocket reconnect attempts reached");
        this.disconnect();
      }
    });

    this.socket.onAny((event, ...args) => {
      this.emitListeners(event, args.length > 1 ? args : args[0]);
    });

    this.socket.connect();
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    console.info("WebSocket disconnected by client");
  }

  private emitListeners(event: string, data: any) {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;
    eventListeners.forEach((cb) => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in listener for event "${event}":`, error);
      }
    });
  }

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);

    return () => {
      this.listeners[event].delete(callback);
      if (this.listeners[event].size === 0) {
        delete this.listeners[event];
      }
    };
  }

  private parseResponse = <R>(res: StatusOkResponse<R> | StatusErrorResponse) => {
    if (res.status === "error") {
      throw new Error(res.message);
    }
    return res;
  };

  async send<R>(event: string, data?: any, timeoutMs: number = 5000): Promise<StatusOkResponse<R>> {
    const res: StatusOkResponse<R> | StatusErrorResponse = await new Promise((resolve, reject) => {
      if (!this.isConnected) {
        this.connect();
      }
      if (!this.isConnected) {
        console.warn(`WebSocket not connected, cannot send event "${event}"`);
        return reject(new Error("WebSocket not connected"));
      }

      let timeoutHandle: NodeJS.Timeout | null = null;

      if (timeoutMs > 0) {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Timeout waiting for ack from event: ${event}`));
        }, timeoutMs);
      }

      this.socket!.emit(event, data, (response: any) => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        resolve(response);
      });
    });

    return this.parseResponse(res);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
