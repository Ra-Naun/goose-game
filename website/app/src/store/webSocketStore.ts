import { create } from "zustand";

interface WebSocketState {
  connectedStatuses: Record<string, boolean>;

  setConnected: (id: string, isConnected: boolean) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connectedStatuses: {},
  setConnected: (id, isConnected) =>
    set((state) => ({
      connectedStatuses: {
        ...state.connectedStatuses,
        [id]: isConnected,
      },
    })),
}));
