import { useChatMessages } from "@/src/hooks/chat/useChatMessages";
import { chatService, COMMON_CHAT_ID } from "@/src/services/chatService";
import { useUserStore } from "@/src/store/user/userStore";
import { useEffect, useState, useRef, useCallback } from "react";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { ErrorMessage } from "@/src/components/Goose-UI/ErrorMessage";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { useWebSocketEventHandlers } from "@/src/hooks/chat/useWebSocketEventHandlers";
import { Input } from "@/src/components/Goose-UI/Forms/Input";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import { MessageItem } from "./MessageItem";

export const Chat: React.FC = () => {
  useWebSocketEventHandlers();
  const user = useUserStore((state) => state.user);
  const [selectedChannelId] = useState(COMMON_CHAT_ID);
  const { data: messages = [], isLoading, isError } = useChatMessages(selectedChannelId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при изменении списка сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !user || sending) return;

    setSending(true);
    try {
      await chatService.sendMessage(selectedChannelId, input.trim());
      setInput("");
    } catch (error) {
      UserNotificationService.showError(`Ошибка отправки сообщения: ${String(error)}`);
    } finally {
      setSending(false);
    }
  }, [input, user, sending, selectedChannelId]);

  const handleDeleteMessage = useCallback(
    async (messageId: string, authorId: string) => {
      if (!user) return;
      if (!chatService.canUserDeleteMessage(user, authorId)) {
        UserNotificationService.showError("У вас нет прав на удаление этого сообщения");
        return;
      }
      try {
        await chatService.deleteMessageWS(messageId);
      } catch (error) {
        UserNotificationService.showError(`Ошибка удаления сообщения: ${String(error)}`);
      }
    },
    [user],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorMessage>Ошибка загрузки сообщений</ErrorMessage>;

  return (
    <>
      {/* Канальный выборник (в перспективе - получить список каналов с сервера) */}
      {/* <ChannelSelector selectedChannelId={selectedChannelId} onChange={setSelectedChannelId} /> */}

      <div className="flex-grow overflow-y-auto mb-4 space-y-2 scrollbar text-gray-100">
        {messages.length === 0 && <p className="text-gray-400 text-center mt-6 select-none">Сообщения отсутствуют</p>}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            currentUserId={user?.id}
            currentUserRoles={user?.roles ?? []}
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex flex-col gap-2 text-gray-100"
      >
        <Input
          type="text"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          maxLength={500}
          aria-label="Введите сообщение"
          autoComplete="off"
        />
        <Button type="submit" disabled={sending || input.trim() === ""}>
          Отправить
        </Button>
      </form>
    </>
  );
};
