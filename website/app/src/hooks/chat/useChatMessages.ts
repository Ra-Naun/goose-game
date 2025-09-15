import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { chatService } from "@/src/services/chatService";
import type { ChatMessage } from "@/src/store/types";
import { wsClientChat } from "@/src/API/client/wsClientChat";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useWebSocketStore } from "@/src/store/ws/webSocketStore";
import { useChatStore } from "@/src/store/chat/chatStore";

export const useChatMessages = (channelId: string) => {
  const isConnected = useWebSocketStore((state) => state.connectedStatuses[wsClientChat.id]);
  const setMessages = useChatStore((state) => state.setMessages);
  const messages = useChatStore((state) => state.messages);
  const queryResult = useQuery<ChatMessage[]>({
    queryKey: ["chatMessages"],
    queryFn: () => chatService.getChatHistory(channelId),
    staleTime: STALE_TIME,
    enabled: !!isConnected,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!queryResult.data) return;
    setMessages(queryResult.data);
  }, [queryResult.data]);

  return useMemo(
    () => ({
      ...queryResult,
      isLoading: !isConnected || queryResult.isLoading,
      data: Object.values(messages),
    }),
    [queryResult, messages]
  );
};
