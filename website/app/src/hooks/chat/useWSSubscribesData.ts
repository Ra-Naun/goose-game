import { useMemo } from "react";
import { WEBSOCKET_CHANEL_LISTEN } from "@/src/config/ws.config";
import type { WSSubscribesData } from "@/src/hooks/types";
import type { ChatMessage } from "@/src/store/types";
import { useChatStore } from "@/src/store/chat/chatStore";

export function useWSSubscribesData(): WSSubscribesData {
  const addMessage = useChatStore((state) => state.addMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const deleteAllMessages = useChatStore((state) => state.deleteAllMessages);

  const wsSubscribesData = useMemo(
    () =>
      ({
        [WEBSOCKET_CHANEL_LISTEN.SENDED_MESSAGE]: (message: ChatMessage) => {
          addMessage(message);
        },
        [WEBSOCKET_CHANEL_LISTEN.DELETED_ALL_MESSAGES]: () => {
          deleteAllMessages();
        },
        [WEBSOCKET_CHANEL_LISTEN.DELETED_MESSAGE]: (data: { messageId: string }) => {
          removeMessage(data.messageId);
        },
      }) as const,
    []
  );
  return wsSubscribesData;
}
