import type { PrototypeGameDefinition } from "@/shared/game-engine/prototype-engine";

export const ZUMBA_DEFINITION: PrototypeGameDefinition = {
  title: "Dance Quest",
  theme: "dance",
  durationSeconds: 75,
  highScoreKey: "fitplay:zumba-dance:highscore",
  prompt: "Beat penceresinde hereket et",
  metricLabel: "Combo",
  beatSeconds: 1.05,
  lives: 5,
  actions: [
    { id: "left-arm", label: "Sol qol yuxari", points: 12, cue: "Sol ciyin ustu" },
    { id: "right-arm", label: "Sag qol yuxari", points: 12, cue: "Sag ciyin ustu" },
    { id: "both-arms", label: "Iki qol", points: 18, cue: "Iki el havada" },
    { id: "squat", label: "Squat", points: 16, cue: "Dizleri buk" },
    { id: "jump", label: "Tullan", points: 20, cue: "Beat ile yuxari" }
  ]
};
