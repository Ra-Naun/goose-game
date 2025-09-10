import { useMatchesHistory } from "@/src/hooks/games/tapGoose/useMatchHistory";
import { useUserStore } from "@/src/store/userStore";
import { AvailableMatches } from "@/src/components/pages/Games/TapGoose/Lobby/AvailableMatches";
import { MatchesHistory } from "@/src/components/pages/Games/TapGoose/Lobby/MatchesHistory";
import { WidgetPanel } from "@/src/components/WidgetPanel";
import { OnlineUsers } from "@/src/components/pages/Games/TapGoose/Lobby/OnlineUsers";
import { useWebSocketEventHandlers } from "@/src/hooks/games/tapGoose/useWebSocketEventHandlers";

export const Lobby: React.FC = () => {
  useWebSocketEventHandlers();
  const user = useUserStore((state) => state.user!);
  const {
    data: matchesHistory,
    isLoading: loadingHistory,
    isError: errorHistory,
    error: loadHistoryError,
  } = useMatchesHistory(user.id);

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row gap-6 pt-3 pb-3 sm:pt-6 sm:pb-6 sm:justify-between overflow-x-hidden">
      <main className="flex flex-col gap-6 flex-shrink-0 xl:w-1/2 md:w-1/2 sm:w-1/2 w-full max-w-full">
        <WidgetPanel className="w-full" role="list">
          <AvailableMatches />
        </WidgetPanel>

        <WidgetPanel className="w-full" role="list">
          <MatchesHistory
            isLoading={loadingHistory}
            isError={errorHistory}
            error={loadHistoryError}
            matchesHistory={matchesHistory}
          />
        </WidgetPanel>
      </main>
      <aside className="flex flex-col gap-6 flex-shrink-0 xl:w-1/4 md:w-1/3 sm:w-1/2 w-full">
        <WidgetPanel className="w-full" role="list">
          <OnlineUsers />
        </WidgetPanel>
      </aside>
    </div>
  );
};
