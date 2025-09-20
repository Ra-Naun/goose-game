import { Loading } from "@/src/components/Goose-UI/Loading";
import { useGoosePosition } from "@/src/hooks/games/tapGoose/useGoosePosition";
import { useExtend } from "@pixi/react";
import { Sprite, Texture, TextureSource } from "pixi.js";

type PixiGooseProps = { onTap: () => void; width: number; height: number; texture: Texture<TextureSource<any>> };

export const PixiGoose = (props: PixiGooseProps) => {
  const { onTap, width, height, texture } = props;
  useExtend({ Sprite });
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
};
