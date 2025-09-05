import type { HistoryOfGameMatch } from "@/src/API/types/match.types";

interface MatchesHistoryProps extends React.HTMLAttributes<HTMLElement> {
  matchesHistory: HistoryOfGameMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  className?: string;
}

export const MatchesHistory: React.FC<MatchesHistoryProps> = (props: MatchesHistoryProps) => {
  const { matchesHistory, isLoading, isError, error } = props;
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-white">История ваших матчей</h2>
      {isLoading && <p className="text-gray-400">Загрузка истории матчей...</p>}
      {isError && <p className="text-red-400">Ошибка загрузки истории: {error?.message}</p>}
      <ul className="scrollbar overflow-auto space-y-3">
        {matchesHistory?.length === 0 ? (
          <li className="text-gray-400">История матчей пуста</li>
        ) : (
          matchesHistory?.map((match) => (
            <li key={match.id} className="border border-gray-700 rounded p-3 cursor-default hover:shadow">
              <p className="font-semibold text-white">{match.id}</p>
              {match.status && <p className="text-sm text-gray-300">Статус: {match.status}</p>}
            </li>
          ))
        )}
      </ul>
    </>
  );
};
