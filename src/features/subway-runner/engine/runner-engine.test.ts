import { describe, expect, it } from "vitest";

import {
  createInitialRunnerState,
  getObstacleBounds,
  handleRunnerCommand,
  tickRunner
} from "./runner-engine";

describe("runner engine", () => {
  it("keeps lane movement inside the three-lane track", () => {
    let state = createInitialRunnerState();

    state = handleRunnerCommand(state, "moveLeft");
    state = handleRunnerCommand(state, "moveLeft");
    state = handleRunnerCommand(state, "moveLeft");
    expect(state.playerLane).toBe(-1);

    state = handleRunnerCommand(state, "moveRight");
    state = handleRunnerCommand(state, "moveRight");
    state = handleRunnerCommand(state, "moveRight");
    expect(state.playerLane).toBe(1);
  });

  it("starts and expires jump and slide movement states", () => {
    let state = { ...createInitialRunnerState(), obstacles: [] };

    state = handleRunnerCommand(state, "jump");
    expect(state.movement).toBe("jumping");

    state = tickRunner(state, 2.05);
    expect(state.movement).toBe("running");

    state = handleRunnerCommand(state, "slide");
    expect(state.movement).toBe("sliding");

    state = tickRunner(state, 0.7);
    expect(state.movement).toBe("running");
  });

  it("does not extend a jump when repeated jump commands arrive while airborne", () => {
    let state = handleRunnerCommand(
      { ...createInitialRunnerState(), obstacles: [] },
      "jump"
    );

    state = tickRunner(state, 1);
    const timerAfterOneSecond = state.movementTimer;
    state = handleRunnerCommand(state, "jump");

    expect(state.movement).toBe("jumping");
    expect(state.movementTimer).toBe(timerAfterOneSecond);

    state = tickRunner(state, 1.05);
    expect(state.movement).toBe("running");
  });

  it("increases score while running", () => {
    const state = tickRunner(
      { ...createInitialRunnerState(), status: "running" },
      1
    );

    expect(state.score).toBeGreaterThan(0);
    expect(state.distance).toBeGreaterThan(0);
  });

  it("pauses and resumes without advancing the runner", () => {
    let state = tickRunner(
      { ...createInitialRunnerState(), status: "running", obstacles: [] },
      1
    );
    const distanceBeforePause = state.distance;

    state = handleRunnerCommand(state, "pause");
    expect(state.status).toBe("paused");

    state = tickRunner(state, 2);
    expect(state.distance).toBe(distanceBeforePause);

    state = handleRunnerCommand(state, "resume");
    expect(state.status).toBe("running");

    state = tickRunner(state, 1);
    expect(state.distance).toBeGreaterThan(distanceBeforePause);
  });

  it("sets game over when the player collides with an obstacle", () => {
    const obstacle = getObstacleBounds(createInitialRunnerState())[0];
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: obstacle.lane,
        obstacles: [{ ...obstacle, z: 0 }]
      },
      0.016
    );

    expect(state.status).toBe("gameOver");
  });

  it("resets score, status, lane, and movement when restarted", () => {
    const gameOver = {
      ...createInitialRunnerState(),
      status: "gameOver" as const,
      score: 500,
      distance: 120,
      playerLane: 1 as const,
      movement: "sliding" as const
    };

    const state = handleRunnerCommand(gameOver, "restart");

    expect(state.status).toBe("ready");
    expect(state.score).toBe(0);
    expect(state.distance).toBe(0);
    expect(state.playerLane).toBe(0);
    expect(state.movement).toBe("running");
  });
});
