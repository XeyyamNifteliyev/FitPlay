"use client";

import { PrototypeGameShell } from "@/shared/components/PrototypeGameShell";
import { PILATES_DEFINITION } from "./engine/pilates-engine";

type PilatesFlowProps = {
  onBackToGames: () => void;
};

export function PilatesFlow({ onBackToGames }: PilatesFlowProps) {
  return (
    <PrototypeGameShell
      definition={PILATES_DEFINITION}
      onBackToGames={onBackToGames}
    />
  );
}
