import { AvatarImage } from "@/src/components/Goose-UI/Avatar/AvatarImage";
import { Input } from "@/src/components/Goose-UI/Forms/Input";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { OnlineStatus } from "@/src/components/Goose-UI/Avatar/OnlineStatus";
import { useOnlineUsers } from "@/src/hooks/user/useOnlineUsers";
import { useMemo, useState } from "react";

type OnlineUserItemProps = {
  username: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
};

const OnlineUserItem: React.FC<OnlineUserItemProps> = (props) => {
  const { username, email, avatarUrl, isOnline } = props;
  return (
    <li
      className="flex items-center py-2 px-3 rounded hover:bg-blue-900 cursor-pointer text-white space-x-3 transition-colors ease-in-out duration-300"
      role="listitem"
      tabIndex={0}
    >
      <AvatarImage avatarUrl={avatarUrl} username={username} />
      <div className="flex flex-col">
        <span className="font-semibold">{username}</span>
        <span className="text-xs text-gray-400">{email}</span>
      </div>

      <OnlineStatus isOnline={isOnline} />
    </li>
  );
};

export const OnlineUsers: React.FC = () => {
  const { data: onlineUsers, isLoading, isError } = useOnlineUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return onlineUsers.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()));
  }, [onlineUsers, search]);

  return (
    <>
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-white">
        Онлайн пользователи ({onlineUsers.length})
      </h2>

      <Input
        type="text"
        color="secondary"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск пользователя..."
        className="w-full"
        aria-label="Поиск пользователя"
      />

      {isLoading && <Loading className="mt-20" />}
      {isError && <p className="mt-4 text-center text-red-500">Ошибка при загрузке пользователей.</p>}

      {!isLoading && !isError && (
        <ul className="scrollbar overflow-auto space-y-3 mt-4">
          {filteredUsers.length === 0 ? (
            <li className="text-gray-400">Пользователи не найдены</li>
          ) : (
            filteredUsers.map((user) => (
              <OnlineUserItem
                key={user.id}
                username={user.username}
                email={user.email}
                avatarUrl={user.avatarUrl}
                isOnline={true}
              />
            ))
          )}
        </ul>
      )}
    </>
  );
};
