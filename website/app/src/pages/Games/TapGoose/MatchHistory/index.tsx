import { useParams } from "@tanstack/react-router";
import { useWebSocketEventHandlers } from "@/src/hooks/games/tapGoose/useWebSocketEventHandlers";
import { useMatchHistory } from "@/src/hooks/games/tapGoose/useMatchHistory";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { ErrorMessage } from "@/src/components/Goose-UI/ErrorMessage";
import { WidgetPanel } from "@/src/components/Goose-UI/WidgetPanel";
import { useSortedScores } from "@/src/hooks/games/tapGoose/useSortedScores";
import { Cup } from "@/src/components/Goose-UI/Cup";
import { useUserStore } from "@/src/store/user/userStore";

interface MatchHistoryParams {
  matchId: string;
}

export function MatchHistory() {
  useWebSocketEventHandlers();
  const { matchId } = useParams({ strict: false }) as MatchHistoryParams;

  const user = useUserStore((store) => store.user);

  const { data, isLoading, error } = useMatchHistory(matchId);

  const sortedScores = useSortedScores(data?.players, data?.scores);

  if (isLoading) return <Loading />;

  if (error)
    return (
      <ErrorMessage role="alert" aria-live="assertive">
        Ошибка загрузки истории матча: {(error as Error).message}
      </ErrorMessage>
    );

  if (!data)
    return (
      <ErrorMessage role="alert" aria-live="assertive">
        История матча не найдена.
      </ErrorMessage>
    );

  return (
    <main className="max-w-xl mx-auto p-4" role="main" aria-label={`История матча: ${data.title}`}>
      <WidgetPanel className="w-full min-h-full text-gray-100">
        <h2 className="text-2xl mb-6 font-semibold text-gray-900 dark:text-white">{data.title}</h2>
        <table className="w-full border border-gray-500 border-collapse text-left" aria-describedby="match-summary">
          <thead className="">
            <tr>
              <th className="border border-gray-500 p-3">Позиция</th>
              <th className="border border-gray-500 p-3">Игрок</th>
              <th className="border border-gray-500 p-3 text-center">Очки</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sortedScores).map(([playerId, scoreItem]) => {
              const isMyScore = scoreItem.playerId === user?.id;
              return (
                <tr key={playerId} className={isMyScore ? "bg-gray-800 font-bold" : undefined}>
                  <td className="border border-gray-500 p-3 flex gap-4">
                    {scoreItem.position}
                    {scoreItem.position === 1 && <Cup color="gold" />}
                    {scoreItem.position === 2 && <Cup color="silver" />}
                    {scoreItem.position === 3 && <Cup color="bronze" />}
                  </td>
                  <td className="border border-gray-500 p-3">{scoreItem.username}</td>
                  <td className="border border-gray-500 p-3 text-center">{scoreItem.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </WidgetPanel>
    </main>
  );
}
