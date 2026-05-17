import { describe, expect, it } from "vitest";

import {
  createPrototypeGameState,
  getPrototypeAccuracy,
  hitPrototypeAction,
  startPrototypeGame,
  tickPrototypeGame,
  type PrototypeGameDefinition
} from "./prototype-engine";

const definition: PrototypeGameDefinition = {
  title: "Test",
  theme: "dance",
  durationSeconds: 10,
  highScoreKey: "test",
  prompt: "Test prompt",
  metricLabel: "Combo",
  beatSeconds: 1,
  lives: 3,
  actions: [
    { id: "left", label: "Left", points: 10, cue: "L" },
    { id: "right", label: "Right", points: 20, cue: "R" }
  ]
};

describe("prototype game engine", () => {
  it("scores correct actions and advances the cue", () => {
    let state = startPrototypeGame(definition, createPrototypeGameState(definition));
    state = hitPrototypeAction(definition, state, "left");

    expect(state.score).toBe(10);
    expect(state.combo).toBe(1);
    expect(state.actionIndex).toBe(1);
  });

  it("penalizes wrong or missed actions", () => {
    let state = startPrototypeGame(definition, createPrototypeGameState(definition));
    state = hitPrototypeAction(definition, state, "right");
    expect(state.lives).toBe(2);
    expect(state.combo).toBe(0);

    state = tickPrototypeGame(definition, state, 1.1);
    expect(state.lives).toBe(1);
  });

  it("finishes when time runs out and reports accuracy", () => {
    let state = startPrototypeGame(definition, createPrototypeGameState(definition));
    state = hitPrototypeAction(definition, state, "left");
    state = tickPrototypeGame(definition, state, 10);

    expect(state.status).toBe("done");
    expect(getPrototypeAccuracy(state)).toBe(100);
  });
});
