import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { getUserInitials } from "@/src/utils";
import { WidgetPanel } from "@/src/components/WidgetPanel";
import Modal from "@/src/components/Goose-UI/Modal";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import { SelectFile } from "@/src/components/Goose-UI/Forms/Input";
import type { User } from "@/src/store/types";
import { CircleArrow } from "@/src/components/Goose-UI/Icons/CircleArrow";

type AvatarImageProps = {
  user: User;
  isModalOpen: boolean;
  openModal: () => void;
};

const AvatarImage: React.FC<AvatarImageProps> = (props) => {
  const { user, isModalOpen, openModal } = props;

  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isModalOpen}
        onClick={openModal}
        className="relative flex items-center justify-center w-20 h-20 rounded-full focus:outline-none cursor-pointer group"
      >
        <img
          src={user.avatarUrl}
          alt={getUserInitials(user.username)}
          className="rounded-full bg-gray-700 w-20 h-20 object-cover transition duration-300 group-hover:brightness-75"
        />
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 text-white transition-opacity duration-300 group-hover:opacity-100 select-none"
          aria-hidden="true"
        >
          <CircleArrow className="h-6 w-6" />
        </div>
      </button>
      <div className="text-white">
        <h2 className="text-xl font-semibold">{user.username}</h2>
        <p className="text-gray-400">{user.email}</p>
      </div>
    </div>
  );
};

export const Profile: React.FC = () => {
  const user = useUserStore((state) => state.user!);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Имитация функции сохранения аватарки, заменить на реальную логику
  const saveAvatar = (file: File) => {
    console.log("Сохраняем аватарку", file);
    // TODO Реализовать загрузку файла и обновление аватара пользователя
    setModalOpen(false);
    setSelectedFile(null);
  };

  // Пример истории активности
  const activityHistory = [
    { id: 1, action: "Зарегестрировался", date: "2025-08-19" },
    { id: 3, action: "Вышел с сайта", date: "2025-08-19" },
    { id: 4, action: "Вошел на сайт", date: "2025-08-20" },
    { id: 5, action: "Создал матч", date: "2025-08-20" },
    { id: 6, action: "Вышел с сайта", date: "2025-08-20" },
    { id: 7, action: "Вошел на сайт", date: "2025-09-02" },
    { id: 8, action: "Присоединился к игре", date: "2025-09-02" },
  ];

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row gap-6 pt-3 pb-3 sm:pt-6 sm:pb-6 sm:justify-between overflow-x-hidden">
      <main className="flex flex-col gap-6 flex-shrink-0 xl:w-1/4 md:w-1/3 sm:w-1/2 w-full">
        <WidgetPanel className="h-1/2">
          <h1 className="text-white text-2xl font-bold mb-4">Профиль пользователя</h1>
          <AvatarImage user={user} isModalOpen={isModalOpen} openModal={openModal} />
          <div className="text-white">
            <p>Роли: {user.roles.join(", ")}</p>
            <p>Дата регистрации: {new Date(user.createdAt).toLocaleDateString()}</p>
            {user.updatedAt && <p>Последнее обновление: {new Date(user.updatedAt).toLocaleDateString()}</p>}
          </div>
        </WidgetPanel>
        <WidgetPanel className="h-1/2">
          <h2 className="text-xl font-bold text-white">Здесь что-нибудь будет</h2>
          <h3 className="text-md font-bold mb-4 border-b border-gray-700 pb-2 text-gray-500">(in develop...)</h3>
        </WidgetPanel>
      </main>

      <aside className="flex flex-col gap-6 flex-shrink-0 xl:w-1/4 md:w-1/3 sm:w-1/2 w-full">
        <WidgetPanel className="md:h-full h-1/2">
          <>
            <h2 className="text-xl font-bold text-white">История активности</h2>
            <h3 className="text-md font-bold mb-4 border-b border-gray-700 pb-2 text-gray-500">(in develop...)</h3>
            <ul className="overflow-auto">
              {activityHistory.length === 0 ? (
                <li className="text-gray-400">Активность отсутствует</li>
              ) : (
                activityHistory.map((item) => (
                  <li key={item.id} className="py-2 px-3 rounded hover:bg-blue-900 cursor-default text-white">
                    <div className="font-semibold">{item.action}</div>
                    <div className="text-gray-400 text-sm">{item.date}</div>
                  </li>
                ))
              )}
            </ul>
          </>
        </WidgetPanel>
      </aside>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4 text-gray-100">Выберите новую аватарку</h2>
          <SelectFile className="w-full" selectedFile={selectedFile} handleFileChange={handleFileChange} />
          <div className="mt-6 flex justify-between gap-4">
            <Button
              color="danger"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-400 rounded flex-1 hover:bg-gray-100"
            >
              Отмена
            </Button>
            <Button
              onClick={() => selectedFile && saveAvatar(selectedFile)}
              disabled={!selectedFile}
              className={`flex-1 ${
                selectedFile ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              }`}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
