import { useTick } from "@pixi/react";
import type { Sprite } from "pixi.js";
import { useEffect, useRef, useState } from "react";

export const useGoosePosition = (width: number, height: number) => {
  const spriteRef = useRef<Sprite>(null);
  const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
  const velocityRef = useRef<{ vx: number; vy: number }>({
    vx: (Math.random() - 0.5) * 4, // скорость по x в пределах -2 ... 2
    vy: (Math.random() - 0.5) * 4, // скорость по y
  });

  useEffect(() => {
    function randomVelocity() {
      const defaultSpeed = 2;
      const maxAdditionalSpeed = 2;
      const speed = defaultSpeed + Math.random() * maxAdditionalSpeed;
      const angle = Math.random() * 2 * Math.PI;
      velocityRef.current.vx = speed * Math.cos(angle);
      velocityRef.current.vy = speed * Math.sin(angle);
    }
    randomVelocity();

    const changeSpeedInterval = 1 * 1000; // каждую 1 сек

    const interval = setInterval(randomVelocity, changeSpeedInterval);
    return () => clearInterval(interval);
  }, []);

  useTick((ticker) => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;

      const bounds = sprite.getBounds();
      const halfWidth = bounds.width / 2;
      const halfHeight = bounds.height / 2;

      setPosition((pos) => {
        let newX = pos.x + velocityRef.current.vx * ticker.deltaTime;
        let newY = pos.y + velocityRef.current.vy * ticker.deltaTime;

        if (newX - halfWidth < 0) {
          newX = halfWidth;
          velocityRef.current.vx *= -1;
        } else if (newX + halfWidth > width) {
          newX = width - halfWidth;
          velocityRef.current.vx *= -1;
        }

        if (newY - halfHeight < 0) {
          newY = halfHeight;
          velocityRef.current.vy *= -1;
        } else if (newY + halfHeight > height) {
          newY = height - halfHeight;
          velocityRef.current.vy *= -1;
        }

        return { x: newX, y: newY };
      });
    }
  });

  return [position, spriteRef] as const;
};
