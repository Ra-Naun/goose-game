import { Assets, Texture } from "pixi.js";
import { useEffect, useState } from "react";

export const useTexture = (imagePng: string) => {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Assets.load(imagePng).then((loadedTexture) => {
      setTexture(loadedTexture);
      setIsLoading(false);
    });
  }, []);

  return [texture, isLoading] as const;
};
