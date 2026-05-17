import type { PrototypeGameDefinition } from "@/shared/game-engine/prototype-engine";

export const BALLOON_DEFINITION: PrototypeGameDefinition = {
  title: "Balon Partlatma",
  theme: "balloon",
  durationSeconds: 60,
  highScoreKey: "fitplay:balloon-pop:highscore",
  prompt: "Parlayan balonu partlat",
  metricLabel: "Pop",
  beatSeconds: 1.15,
  lives: 8,
  actions: [
    { id: "red", label: "Qirmizi", points: 5, cue: "+5 xal" },
    { id: "yellow", label: "Sari", points: 10, cue: "+10 xal" },
    { id: "blue", label: "Mavi", points: 15, cue: "+15 xal" },
    { id: "gold", label: "Qizili", points: 25, cue: "Nadir balon" }
  ]
};
