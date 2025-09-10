import { MatchStatus, type GameMatch } from "@/src/API/types/match.types";
import { useEffect, useState } from "react";

export const useTimeToEndLeft = (match?: GameMatch | null) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (match?.status !== MatchStatus.ONGOING || !match.startTime) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const timeLeft =
        match.status === MatchStatus.ONGOING && match.startTime
          ? Math.max(0, Math.floor((match.startTime + match.matchDurationSeconds * 1000 - Date.now()) / 1000))
          : null;
      setTimeLeft(timeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [match?.status, match?.startTime, match?.matchDurationSeconds]);

  return timeLeft;
};
