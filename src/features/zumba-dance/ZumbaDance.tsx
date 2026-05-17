"use client";

import { PrototypeGameShell } from "@/shared/components/PrototypeGameShell";
import { ZUMBA_DEFINITION } from "./engine/zumba-engine";

type ZumbaDanceProps = {
  onBackToGames: () => void;
};

export function ZumbaDance({ onBackToGames }: ZumbaDanceProps) {
  return (
    <PrototypeGameShell
      definition={ZUMBA_DEFINITION}
      onBackToGames={onBackToGames}
    />
  );
}
