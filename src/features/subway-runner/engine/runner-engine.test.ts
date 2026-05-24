import { describe, expect, it } from "vitest";

import {
  createInitialRunnerState,
  getObstacleBounds,
  handleRunnerCommand,
  tickRunner,
  getCurrentTheme
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
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: 0,
        obstacles: [{ id: "barrier-test", lane: 0, z: 0, kind: "barrier" }]
      },
      0.016
    );

    expect(state.status).toBe("gameOver");
  });

  it("sets game over when the player collides with a train", () => {
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: 0,
        obstacles: [{ id: "train-test", lane: 0, z: 0, kind: "train" }]
      },
      0.016
    );

    expect(state.status).toBe("gameOver");
    expect(state.chaser.caught).toBe(true);
  });

  it("allows jumping over platform gaps", () => {
    let state = handleRunnerCommand(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: 0,
        obstacles: [{ id: "gap-test", lane: 0, z: 0, kind: "gap" }]
      },
      "jump"
    );

    state = tickRunner(state, 0.016);

    expect(state.status).toBe("running");
  });

  it("uses hoverboard as a one-hit train shield", () => {
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: 0,
        powerUp: "hoverboard",
        shieldHits: 1,
        obstacles: [{ id: "train-test", lane: 0, z: 0, kind: "train" }]
      },
      0.016
    );

    expect(state.status).toBe("running");
    expect(state.powerUp).toBe("none");
    expect(state.shieldHits).toBe(0);
    expect(state.chaser.distance).toBeLessThan(26);
  });

  it("pulls nearby coins with magnet across adjacent lanes", () => {
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        playerLane: 0,
        powerUp: "magnet",
        powerUpTimer: 5,
        obstacles: [{ id: "coin-test", lane: 1, z: 2, kind: "coin" }]
      },
      0.016
    );

    expect(state.obstacles[0].collected).toBe(true);
    expect(state.score).toBeGreaterThanOrEqual(50);
    expect(state.combo).toBeGreaterThan(0);
  });

  it("recovers chaser distance while running cleanly", () => {
    const state = tickRunner(
      {
        ...createInitialRunnerState(),
        status: "running",
        obstacles: [],
        chaser: { distance: 10, warningLevel: 2, caught: false }
      },
      1
    );

    expect(state.chaser.distance).toBeGreaterThan(10);
    expect(state.chaser.caught).toBe(false);
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
    expect(state.chaser.caught).toBe(false);
  });

  it("tracks theme index based on distance", () => {
    let state = { ...createInitialRunnerState(), status: "running", obstacles: [] };
    expect(state.themeIndex).toBe(0);

    state = { ...state, distance: 300 };
    state = tickRunner(state, 0.016);
    expect(state.themeIndex).toBeGreaterThanOrEqual(1);
  });

  it("starts with no power-up active", () => {
    const state = createInitialRunnerState();
    expect(state.powerUp).toBe("none");
    expect(state.powerUpTimer).toBe(0);
    expect(state.shieldHits).toBe(0);
  });

  it("defaults to bakuMetro theme at index 0", () => {
    const state = createInitialRunnerState();
    expect(getCurrentTheme(state)).toBe("bakuMetro");
  });

  it("cycles themes through the four world themes", () => {
    expect(getCurrentTheme({ ...createInitialRunnerState(), themeIndex: 0 })).toBe("bakuMetro");
    expect(getCurrentTheme({ ...createInitialRunnerState(), themeIndex: 1 })).toBe("icherisheher");
    expect(getCurrentTheme({ ...createInitialRunnerState(), themeIndex: 2 })).toBe("bulvar");
    expect(getCurrentTheme({ ...createInitialRunnerState(), themeIndex: 3 })).toBe("neonNight");
    expect(getCurrentTheme({ ...createInitialRunnerState(), themeIndex: 4 })).toBe("bakuMetro");
  });
});
