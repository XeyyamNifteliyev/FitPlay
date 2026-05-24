import type { PrototypeGameDefinition } from "@/shared/game-engine/prototype-engine";

export const PILATES_DEFINITION: PrototypeGameDefinition = {
  title: "Balance Garden",
  theme: "pilates",
  durationSeconds: 120,
  highScoreKey: "fitplay:pilates-flow:highscore",
  prompt: "Pozani stabil saxla",
  metricLabel: "Flow",
  beatSeconds: 2.4,
  lives: 7,
  actions: [
    { id: "mountain", label: "Mountain", points: 12, cue: "Duz dayan" },
    { id: "warrior", label: "Warrior", points: 18, cue: "Bir ayaq ireli" },
    { id: "tree", label: "Tree", points: 22, cue: "Balans" },
    { id: "plank", label: "Plank", points: 20, cue: "Beden duz xett" },
    { id: "bridge", label: "Bridge", points: 18, cue: "Korpus yuxari" }
  ]
};
