import { useRef, useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react";
import { Sprite, Container, Assets } from "pixi.js";
import { useParams } from "@tanstack/react-router";
import { Application, useExtend } from "@pixi/react";

import { useUserStore } from "@/src/store/userStore";
import { WidgetPanel } from "@/src/components/WidgetPanel";

import goosePng from "./images/goose.png";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { useTexture } from "@/src/hooks/PIXI/useTexture";
import { useGoosePosition } from "@/src/hooks/games/tapGoose/useGoosePosition";

function Goose({ onTap, width, height }: { onTap: () => void; width: number; height: number }) {
  useExtend({ Sprite });
  const texture = useMemo(() => Assets.get(goosePng), []);
  const [position, spriteRef] = useGoosePosition(width, height);

  if (!texture) return <Loading />;

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      onPointerTap={onTap}
      eventMode="dynamic"
      anchor={0.5}
      x={position.x}
      y={position.y}
      scale={0.5}
      cursor="pointer"
    />
  );
}

const useViewerSizes = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Поддержка адаптивности по размеру контейнера
  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    }
    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return { width, height, containerRef };
};

interface MatchParams {
  matchId: string;
}

export function Match() {
  useExtend({ Container });

  const { matchId } = useParams({ strict: false }) as MatchParams;

  const user = useUserStore((state) => state.user);

  const { width, height, containerRef } = useViewerSizes();

  const [timeLeft, setTimeLeft] = useState(1);
  const [started, setStarted] = useState(false);
  const [scores, setScores] = useState<{ playerId: string; score: number }[]>([]);

  // Таймер обратного отсчёта и запуск матча
  useEffect(() => {
    if (!started) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStarted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started]);

  const handleGooseTap = useCallback(() => {
    console.log("Goose tapped!");

    if (!started || !user) return;
    setScores((prev) => {
      const exist = prev.find((p) => p.playerId === user.id);
      if (!exist) return [...prev, { playerId: user.id, score: 1 }];
      return prev.map((p) => (p.playerId === user.id ? { ...p, score: p.score + 1 } : p));
    });
  }, [started, user]);

  // Сортировка и добавление позиции игрокам
  const sortedScores = scores
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, position: i + 1 }));

  const userScore = sortedScores.find((p) => p.playerId === user?.id);

  const [gooseTexture, isLoadingGooseTexture] = useTexture(goosePng);

  return (
    <div className="flex gap-4 p-4">
      <WidgetPanel className="w-full h-[600px]">
        <div ref={containerRef} className="w-full h-full text-gray-100 flex-1 rounded-lg overflow-hidden">
          {!gooseTexture || isLoadingGooseTexture ? (
            <Loading />
          ) : (
            <>
              {!started ? (
                <div className="flex items-center justify-center h-full text-6xl font-bold">
                  Match starts in {timeLeft}s
                </div>
              ) : (
                <>
                  <Application width={width} height={height} className="h-full w-full ">
                    <Goose width={width} height={height} onTap={handleGooseTap} />
                  </Application>
                </>
              )}
            </>
          )}
        </div>
      </WidgetPanel>

      <aside className="w-64">
        <WidgetPanel className="w-full h-full">
          <h3 className="font-semibold mb-4">Scores</h3>
          <ul>
            {sortedScores.map(({ playerId, score, position }) => (
              <li
                key={playerId}
                className={`py-1 border-b last:border-b-0 ${playerId === user?.id ? "bg-yellow-200 font-bold" : ""}`}
              >
                #{position} {playerId}: {score}
              </li>
            ))}
          </ul>
          {userScore && (
            <div className="mt-4 text-center font-bold">
              Your score: {userScore.score} (#{userScore.position})
            </div>
          )}
        </WidgetPanel>
      </aside>
    </div>
  );
}
