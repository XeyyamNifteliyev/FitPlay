"use client";

import { useCallback, useEffect, useState } from "react";

export function useHighScore(key: string) {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    setHighScore(stored ? Number(stored) || 0 : 0);
  }, [key]);

  const submitScore = useCallback(
    (score: number) => {
      setHighScore((current) => {
        const next = Math.max(current, Math.floor(score));
        window.localStorage.setItem(key, String(next));
        return next;
      });
    },
    [key]
  );

  return { highScore, submitScore };
}
