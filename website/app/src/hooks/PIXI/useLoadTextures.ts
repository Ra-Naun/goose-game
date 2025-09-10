import { UserNotificationService } from "@/src/services/userNotificationService";
import { Assets, Texture } from "pixi.js";
import { useEffect, useState } from "react";

export const useLoadTextures = (...imagesPng: Array<string>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTextures, setLoadedTextures] = useState<{ [imgPath: string]: Texture }>({});

  useEffect(() => {
    (async () => {
      try {
        const textures = await Assets.load(imagesPng);
        setLoadedTextures({ ...loadedTextures, ...textures });
        setIsLoading(false);
      } catch (error) {
        UserNotificationService.showError(`Failed to load textures: ${(error as Error).message}`);
      }
      setIsLoading(false);
    })();
  }, []);

  return [isLoading, loadedTextures] as const;
};
