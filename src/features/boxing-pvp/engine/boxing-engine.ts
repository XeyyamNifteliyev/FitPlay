import type { PrototypeGameDefinition } from "@/shared/game-engine/prototype-engine";

export const BOXING_DEFINITION: PrototypeGameDefinition = {
  title: "Boks PvP",
  theme: "boxing",
  durationSeconds: 90,
  highScoreKey: "fitplay:boxing-pvp:highscore",
  prompt: "Zerbeni vaxtinda vur ve blok et",
  metricLabel: "Combo",
  beatSeconds: 1.25,
  lives: 6,
  actions: [
    { id: "jab", label: "Jab", points: 10, cue: "Sol el ireli" },
    { id: "cross", label: "Cross", points: 15, cue: "Sag el ireli" },
    { id: "hook", label: "Hook", points: 20, cue: "Yandan zerbe" },
    { id: "block", label: "Blok", points: 12, cue: "Qollar yuxari" },
    { id: "uppercut", label: "Uppercut", points: 25, cue: "Asagidan yuxari" }
  ]
};
