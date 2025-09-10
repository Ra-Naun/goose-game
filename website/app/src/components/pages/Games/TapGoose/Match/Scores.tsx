import type { MatchPlayers, PlayerScores } from "@/src/API/types/match.types";
import type { ScoreWithPosition } from "@/src/API/types/tap-goose.types";
import { AvatarImage } from "@/src/components/Goose-UI/Avatar/AvatarImage";
import { Description } from "@/src/components/Goose-UI/Avatar/Description";
import { OnlineStatus } from "@/src/components/Goose-UI/Avatar/OnlineStatus";
import { useSortedScores } from "@/src/hooks/games/tapGoose/useSortedScores";
import { getUserInitials } from "@/src/utils";
type UserScoreItemProps = ScoreWithPosition & {
  avatarUrl: string;
  isOnline: boolean;
  isCurrentUser: boolean;
};

const UserScoreItem: React.FC<UserScoreItemProps> = ({
  playerId,
  score,
  position,
  username,
  email,
  avatarUrl,
  isOnline,
  isCurrentUser,
}) => {
  return (
    <li
      className={`
        flex items-center py-2 px-3 cursor-pointer space-x-3 
        transition-colors ease-in-out duration-300
        hover:bg-blue-900
        text-gray-100
        ${isCurrentUser ? "bg-gray-700 font-semibold" : "bg-gray-900"}
      
      `}
      role="listitem"
      tabIndex={0}
      aria-current={isCurrentUser ? "true" : undefined}
    >
      <span className="flex-shrink-0 font-mono w-6 text-right">{`#${position}`}</span>
      <AvatarImage avatarUrl={avatarUrl} username={username} />
      <Description username={username} email={email} />
      <OnlineStatus isOnline={isOnline} />
      <span className="flex-shrink-0 font-semibold">{score}</span>
    </li>
  );
};

interface ScoresProps {
  players: MatchPlayers;
  scores: PlayerScores;
  userId: string;
  onlineUserIds: Set<string>;
}

export const Scores: React.FC<ScoresProps> = ({ players, scores, userId, onlineUserIds }) => {
  const sortedScores = useSortedScores(players, scores);
  const userScore = sortedScores[userId];

  return (
    <section aria-label="Таблица очков игроков" className="mt-6">
      <h3 className="font-semibold mb-4 text-white">Результаты</h3>
      {userScore && (
        <p className="mt-4  font-bold text-yellow-300">
          Ваш результат: {userScore.score} (#{userScore.position})
        </p>
      )}
      <ul
        role="list"
        className="max-h-72 overflow-auto scrollbar divide-y divide-gray-700 border border-gray-700 rounded"
      >
        {Object.values(sortedScores).length === 0 && (
          <li className="px-4 py-2 text-gray-400 text-center">Пока нет очков</li>
        )}
        {Object.values(sortedScores).map(({ playerId, score, position }) => {
          const player = players[playerId];
          if (!player) return null;

          return (
            <UserScoreItem
              key={playerId}
              playerId={playerId}
              username={player.username}
              email={player.email}
              score={score}
              position={position}
              avatarUrl={player.avatarUrl ?? null}
              isOnline={onlineUserIds.has(playerId)}
              isCurrentUser={playerId === userId}
            />
          );
        })}
      </ul>
    </section>
  );
};
