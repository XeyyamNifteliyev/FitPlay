"use client";

import { PrototypeGameShell } from "@/shared/components/PrototypeGameShell";
import { BALLOON_DEFINITION } from "./engine/balloon-engine";

type BalloonPopProps = {
  onBackToGames: () => void;
};

export function BalloonPop({ onBackToGames }: BalloonPopProps) {
  return (
    <PrototypeGameShell
      definition={BALLOON_DEFINITION}
      onBackToGames={onBackToGames}
    />
  );
}
