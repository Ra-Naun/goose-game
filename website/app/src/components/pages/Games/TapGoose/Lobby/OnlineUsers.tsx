import { Input } from "@/src/components/Goose-UI/Forms/Input";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { useOnlineUsers } from "@/src/hooks/games/tapGoose/useOnlineUsers";
import { DEFAULT_AVATAR_URL } from "@/src/pages/Profile";
import { getUserInitials } from "@/src/utils";
import { useMemo, useState } from "react";

type OnlineUserItemProps = {
  username: string;
  email: string;
  avatarUrl: string | null;
  isOnline: boolean;
};

const OnlineUserItem: React.FC<OnlineUserItemProps> = (props) => {
  const { username, email, avatarUrl, isOnline } = props;
  return (
    <li
      className="flex items-center py-2 px-3 rounded hover:bg-blue-900 cursor-pointer text-white space-x-3 transition"
      role="listitem"
      tabIndex={0}
    >
      <img
        src={avatarUrl || DEFAULT_AVATAR_URL}
        alt={`${getUserInitials(username)} avatar`}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-semibold">{username}</span>
        <span className="text-xs text-gray-400">{email}</span>
      </div>
      {isOnline && (
        <span
          className="ml-auto w-3 h-3 bg-green-500 rounded-full"
          title="Online"
          aria-label="Пользователь онлайн"
        ></span>
      )}
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
