import type { ChatMessage } from "@/src/store/types";
import { UserRoleEnum } from "@/src/store/types";
import { AskDeleteMessageModal } from "./AskDeleteMessageModal";
import { useState } from "react";

interface MessageItemProps {
  message: ChatMessage;
  currentUserId?: string;
  currentUserRoles?: UserRoleEnum[];
  onDelete: (messageId: string, authorId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  currentUserRoles = [],
  onDelete,
}) => {
  const isAuthor = message.userInfo.id === currentUserId;
  const isAdmin = currentUserRoles.includes(UserRoleEnum.ADMIN);
  const canDelete = isAuthor || isAdmin;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmDelete = () => {
    onDelete(message.id, message.userInfo.id);
    closeModal();
  };

  return (
    <>
      <div
        key={message.id}
        className={`p-2 rounded ${isAuthor ? "bg-blue-600 self-end" : "bg-gray-700"} relative`}
        aria-label={`Сообщение от ${message.userInfo.username}`}
      >
        <div className="text-sm font-semibold">{message.userInfo.username}</div>
        <div className="text-base mt-1 whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs text-gray-300 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString()}</div>
        {canDelete && (
          <button
            onClick={openModal}
            className="absolute top-1 right-1 px-1 text-red-200 hover:text-red-500 transition-colors"
            aria-label="Удалить сообщение"
          >
            &times;
          </button>
        )}
      </div>
      <AskDeleteMessageModal onClose={closeModal} isOpen={isModalOpen} confirmDelete={confirmDelete} />
    </>
  );
};
