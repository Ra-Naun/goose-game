import { create } from "zustand";
import type { ChatMessage } from "../types";

export interface ChatStore {
  messages: { [id: ChatMessage["id"]]: ChatMessage };
  setMessages: (messages: Array<ChatMessage>) => void;
  addMessage: (message: ChatMessage) => void;
  deleteAllMessages: () => void;
  removeMessage: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: {},

  setMessages: (messages) => {
    const messagesMap: Record<string, ChatMessage> = {};
    messages.forEach((message) => {
      messagesMap[message.id] = message;
    });
    set({ messages: messagesMap });
  },

  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.id]: message,
      },
    })),

  deleteAllMessages: () => set({ messages: {} }),

  removeMessage: (id) =>
    set((state) => {
      const newMessages = { ...state.messages };
      if (id in state.messages) {
        delete newMessages[id];
      }
      return { messages: newMessages };
    }),
}));
