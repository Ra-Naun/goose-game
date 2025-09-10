import { MatchStatus, type GameMatch } from "@/src/API/types/match.types";
import { useEffect, useState } from "react";

export const useTimeToStartLeft = (match?: GameMatch | null) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (match?.status !== MatchStatus.WAITING) {
      setTimeLeft(null);
      return;
    }
    const timer = setInterval(() => {
      const timeLeft =
        match.status === MatchStatus.WAITING
          ? Math.max(0, Math.floor((match.createdTime + match.cooldownMs - Date.now()) / 1000))
          : null;
      setTimeLeft(timeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [match?.status, match?.createdTime, match?.cooldownMs]);

  return timeLeft;
};
