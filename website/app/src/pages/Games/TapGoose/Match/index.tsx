import { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "pixi.js";
import { useExtend } from "@pixi/react";
import { Navigate, useParams } from "@tanstack/react-router";

import { useUserStore } from "@/src/store/user/userStore";
import { WidgetPanel } from "@/src/components/Goose-UI/WidgetPanel";
import { useViewerSizes } from "@/src/hooks/games/tapGoose/useViewerSizes";
import { PixiViewer } from "@/src/components/pages/Games/TapGoose/Match/PixiViewer";
import { Scores } from "@/src/components/pages/Games/TapGoose/Match/Scores";
import { useTimeToStartLeft } from "@/src/hooks/games/tapGoose/useTimeToStartLeft";
import { MatchStatus } from "@/src/API/types/match.types";
import { useWebSocketEventHandlers } from "@/src/hooks/games/tapGoose/useWebSocketEventHandlers";
import { useActiveUserMatch } from "@/src/hooks/games/tapGoose/useActiveUserMatches";
import { matchService } from "@/src/services/matchService";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { useTimeToEndLeft } from "@/src/hooks/games/tapGoose/useTimeToEndLeft";
import { tapGooseMatchHistoryPath } from "@/src/router/paths";
import { useActiveUserGameStore } from "@/src/store/games/tapGoose/activeUserGamesStore";
import { useOnlineUsers } from "@/src/hooks/user/useOnlineUsers";

interface MatchParams {
  matchId: string;
}

export function Match() {
  useWebSocketEventHandlers();
  useExtend({ Container });

  const { matchId } = useParams({ strict: false }) as MatchParams;
  const user = useUserStore((state) => state.user!);

  // Локальный оптимистичный счет для плавного UI обновления
  const [localScoreDelta, setLocalScoreDelta] = useState(0);

  const {
    data: activeMatch,
    isLoading: isLoadingActiveMatch,
    isError: isErrorActiveMatch,
  } = useActiveUserMatch(matchId);

  const notEndedActiveMatch = activeMatch?.status !== MatchStatus.FINISHED ? activeMatch : null;

  const serverScore = notEndedActiveMatch?.scores[user.id] || 0;
  const serverScoreLastUpdateTime = notEndedActiveMatch?.scoresLastTimeUpdate[user.id];

  // Сброс локального счетчика, когда приходят новые данные с сервера
  useEffect(() => {
    setLocalScoreDelta(0);
  }, [serverScore, serverScoreLastUpdateTime]);

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleGooseTap = useCallback(async () => {
    if (!notEndedActiveMatch || notEndedActiveMatch.status !== MatchStatus.ONGOING) {
      return;
    }

    console.log("Goose tapped!");
    if (notEndedActiveMatch?.status !== MatchStatus.ONGOING) return;

    setLocalScoreDelta((prev) => prev + 1);
    try {
      await matchService.tapGooseWS({ matchId });
    } catch (error) {
      UserNotificationService.showError((error as Error).message);
      setLocalScoreDelta((prev) => prev - 1);
    }
  }, [notEndedActiveMatch, notEndedActiveMatch?.status, user]);

  const timeToStartLeft = useTimeToStartLeft(notEndedActiveMatch);
  const timeToEndLeft = useTimeToEndLeft(notEndedActiveMatch);

  const { width, height, containerRef } = useViewerSizes();

  const { data: onlineUsers } = useOnlineUsers();

  const onlineUsersSet = useMemo(() => new Set([...onlineUsers.map((item) => item.id)]), [onlineUsers]);

  let errorMsg = "";

  switch (true) {
    case !!isErrorActiveMatch: {
      errorMsg = "Error loading active match.";
      break;
    }

    case !isLoadingActiveMatch && !activeMatch: {
      errorMsg = "Match not found";
      break;
    }

    default:
      break;
  }

  const removeActiveMatch = useActiveUserGameStore((state) => state.removeMatch);

  // Итоговый счет с учетом локального оптимистичного нажатия
  const displayScores = useMemo(
    () =>
      notEndedActiveMatch?.scores
        ? { ...notEndedActiveMatch.scores, [user.id]: serverScore + localScoreDelta }
        : undefined,
    [notEndedActiveMatch, serverScore, localScoreDelta, user.id],
  );

  if (activeMatch?.status === MatchStatus.FINISHED) {
    setTimeout(() => {
      removeActiveMatch();
    }, 0);
    return <Navigate to={tapGooseMatchHistoryPath} params={{ matchId }} />;
  }

  return (
    <div className="flex gap-4 p-4 w-full h-full flex-col md:flex-row">
      <WidgetPanel className="w-full text-gray-100 p-0!">
        <div ref={containerRef} className="flex-1 rounded-lg overflow-hidden w-full h-full">
          <PixiViewer
            width={width}
            height={height}
            started={notEndedActiveMatch?.status === MatchStatus.ONGOING}
            errorMsg={errorMsg}
            isLoading={isLoadingActiveMatch}
            timeToStartLeft={timeToStartLeft}
            timeToEndLeft={timeToEndLeft}
            handleGooseTap={handleGooseTap}
          />
        </div>
      </WidgetPanel>

      <aside className="md:w-1/4 w-full md:min-h-full min-h-1/3">
        <WidgetPanel className="w-full h-full">
          {!!displayScores && !!notEndedActiveMatch && (
            <Scores
              scores={displayScores}
              players={notEndedActiveMatch.players}
              userId={user.id}
              onlineUserIds={onlineUsersSet}
            />
          )}
        </WidgetPanel>
      </aside>
    </div>
  );
}
