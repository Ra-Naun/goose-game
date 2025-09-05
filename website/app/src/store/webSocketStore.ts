import { create } from "zustand";

interface WebSocketState {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
