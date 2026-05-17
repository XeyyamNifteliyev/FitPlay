"use client";

import { PrototypeGameShell } from "@/shared/components/PrototypeGameShell";
import { BOXING_DEFINITION } from "./engine/boxing-engine";

type BoxingPvPProps = {
  onBackToGames: () => void;
};

export function BoxingPvP({ onBackToGames }: BoxingPvPProps) {
  return (
    <PrototypeGameShell
      definition={BOXING_DEFINITION}
      onBackToGames={onBackToGames}
    />
  );
}
