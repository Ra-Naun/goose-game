import { Loading } from "@/src/components/Goose-UI/Loading";
import { useGoosePosition } from "@/src/hooks/games/tapGoose/useGoosePosition";
import { useExtend } from "@pixi/react";
import { Assets, Sprite } from "pixi.js";
import { useMemo } from "react";

import goosePng from "./images/goose.png";

export function PixiGoose({ onTap, width, height }: { onTap: () => void; width: number; height: number }) {
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
