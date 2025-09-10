import type { HistoryOfGameMatch } from "@/src/API/types/match.types";
import { Link } from "@/src/components/Goose-UI/Link";
import { tapGooseMatchHistoryPath } from "@/src/router/paths";

const MatchItem: React.FC<{ match: HistoryOfGameMatch }> = ({ match }) => {
  return (
    <li
      role="listitem"
      key={match.id}
      className="border border-gray-700 rounded p-3 cursor-pointer hover:bg-blue-900 transition-colors ease-in-out duration-300"
    >
      <Link
        target="_blank"
        to={tapGooseMatchHistoryPath}
        params={{ matchId: match.id }}
        className="block text-white no-underline hover:text-white"
      >
        <p className="font-semibold">{match.title}</p>
        {match.createdTime && (
          <p className="text-xs text-gray-400 mt-1">Создан: {new Date(match.createdTime).toLocaleString()}</p>
        )}
      </Link>
    </li>
  );
};

interface MatchesHistoryProps extends React.HTMLAttributes<HTMLElement> {
  matchesHistory: HistoryOfGameMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const MatchesHistory: React.FC<MatchesHistoryProps> = (props: MatchesHistoryProps) => {
  const { matchesHistory, isLoading, isError, error } = props;
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-white">История ваших матчей</h2>

      {isLoading && <p className="text-gray-400">Загрузка истории матчей...</p>}

      {isError && (
        <p className="text-red-400" role="alert">
          Ошибка загрузки истории: {error?.message}
        </p>
      )}

      {!isLoading && !isError && (
        <ul role="list" className="scrollbar overflow-auto space-y-3 max-h-96">
          {matchesHistory?.length === 0 ? (
            <li className="text-gray-400">История матчей пуста</li>
          ) : (
            matchesHistory!.map((match) => <MatchItem key={match.id} match={match} />)
          )}
        </ul>
      )}
    </>
  );
};
