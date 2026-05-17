"use client";

import { PrototypeGameShell } from "@/shared/components/PrototypeGameShell";
import { PENALTY_DEFINITION } from "./engine/penalty-engine";

type PenaltyProps = {
  onBackToGames: () => void;
};

export function Penalty({ onBackToGames }: PenaltyProps) {
  return (
    <PrototypeGameShell
      definition={PENALTY_DEFINITION}
      onBackToGames={onBackToGames}
    />
  );
}
