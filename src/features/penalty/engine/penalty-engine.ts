import type { PrototypeGameDefinition } from "@/shared/game-engine/prototype-engine";

export const PENALTY_DEFINITION: PrototypeGameDefinition = {
  title: "Sports Stadium",
  theme: "penalty",
  durationSeconds: 55,
  highScoreKey: "fitplay:penalty:highscore",
  prompt: "Topu qapi zonasina yonelt",
  metricLabel: "Qol",
  beatSeconds: 1.45,
  lives: 5,
  actions: [
    { id: "left-high", label: "Sol yuxari", points: 20, cue: "Beden sola + kick" },
    { id: "left-low", label: "Sol asagi", points: 15, cue: "Sola asagi" },
    { id: "center", label: "Merkez", points: 10, cue: "Duz kick" },
    { id: "right-low", label: "Sag asagi", points: 15, cue: "Saga asagi" },
    { id: "right-high", label: "Sag yuxari", points: 20, cue: "Beden saga + kick" }
  ]
};
