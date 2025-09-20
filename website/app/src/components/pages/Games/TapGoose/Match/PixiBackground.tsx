import { Sprite, TextureSource, Texture } from "pixi.js";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { useExtend } from "@pixi/react";

type PixiBackgroundProps = {
  width: number;
  height: number;
  texture: Texture<TextureSource<any>>;
};

export const PixiBackground = (props: PixiBackgroundProps) => {
  const { width, height, texture } = props;
  useExtend({ Sprite });
  if (!texture) return <Loading />;

  return <pixiSprite texture={texture} width={width} height={height} x={0} y={0} anchor={0} />;
};
