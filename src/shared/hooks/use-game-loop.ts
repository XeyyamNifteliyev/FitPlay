"use client";

import { useEffect, useRef } from "react";

export function useGameLoop(
  onFrame: (deltaSeconds: number) => void,
  isRunning = true
) {
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  useEffect(() => {
    if (!isRunning) return;

    let animationId = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      frameRef.current(delta);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isRunning]);
}
