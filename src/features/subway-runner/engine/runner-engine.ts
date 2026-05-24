export type Lane = -1 | 0 | 1;

export type RunnerStatus = "ready" | "running" | "paused" | "gameOver";

export type RunnerMovement = "running" | "jumping" | "sliding";

export type RunnerCommand =
  | "start"
  | "moveLeft"
  | "moveRight"
  | "jump"
  | "slide"
  | "pause"
  | "resume"
  | "restart"
  | "activatePowerUp";

export type ObstacleKind =
  | "barrier"
  | "lowGate"
  | "train"
  | "parkedTrain"
  | "gap"
  | "coin"
  | "powerUp";

export type PowerUpKind = "magnet" | "shield" | "boost" | "hoverboard";

export type ChaserState = {
  distance: number;
  warningLevel: 0 | 1 | 2 | 3;
  caught: boolean;
};

export type RunnerWorldTheme =
  | "bakuMetro"
  | "icherisheher"
  | "bulvar"
  | "neonNight";

export type RunnerObstacle = {
  id: string;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  powerUpKind?: PowerUpKind;
  collected?: boolean;
};

export type RunnerState = {
  status: RunnerStatus;
  playerLane: Lane;
  movement: RunnerMovement;
  movementTimer: number;
  score: number;
  distance: number;
  speed: number;
  elapsed: number;
  obstacles: RunnerObstacle[];
  powerUp: PowerUpKind | "none";
  powerUpTimer: number;
  shieldHits: number;
  themeIndex: number;
  combo: number;
  coins: number;
  highScore: number;
  chaser: ChaserState;
};

const LANES: Lane[] = [-1, 0, 1];
const PLAYER_Z = 0;
const COLLISION_Z = 0.75;
const START_SPEED = 8;
const MAX_SPEED = 18;
const JUMP_DURATION = 2;
const SLIDE_DURATION = 0.56;
const OBSTACLE_RESET_Z = -7;
const OBSTACLE_SPAWN_Z = 38;
const THEME_DISTANCE = 300;
const MAGNET_DURATION = 10;
const BOOST_DURATION = 5;
const SHIELD_HITS = 1;
const HOVERBOARD_HITS = 1;
const BOOST_SPEED_MULTIPLIER = 2;
const BOOST_SCORE_MULTIPLIER = 2;
const CHASER_START_DISTANCE = 26;
const CHASER_MAX_DISTANCE = 32;

const THEMES: RunnerWorldTheme[] = [
  "bakuMetro",
  "icherisheher",
  "bulvar",
  "neonNight"
];

const STARTING_OBSTACLES: RunnerObstacle[] = [
  { id: "coin-1", lane: -1, z: 12, kind: "coin" },
  { id: "coin-2", lane: 0, z: 15, kind: "coin" },
  { id: "coin-3", lane: 1, z: 18, kind: "coin" },
  { id: "barrier-1", lane: 0, z: 24, kind: "barrier" },
  { id: "low-gate-1", lane: -1, z: 36, kind: "lowGate" },
  { id: "train-1", lane: 1, z: 50, kind: "train" },
  { id: "coin-4", lane: 0, z: 62, kind: "coin" },
  { id: "power-1", lane: -1, z: 72, kind: "powerUp", powerUpKind: "hoverboard" },
  { id: "gap-1", lane: 0, z: 84, kind: "gap" },
  { id: "parked-train-1", lane: -1, z: 98, kind: "parkedTrain" },
  { id: "coin-5", lane: 1, z: 110, kind: "coin" },
  { id: "low-gate-2", lane: 1, z: 124, kind: "lowGate" }
];

export function getThemeForIndex(index: number): RunnerWorldTheme {
  return THEMES[index % THEMES.length];
}

export function getCurrentTheme(state: RunnerState): RunnerWorldTheme {
  return getThemeForIndex(state.themeIndex);
}

export function createInitialRunnerState(): RunnerState {
  const highScore = readHighScore();

  return {
    status: "ready",
    playerLane: 0,
    movement: "running",
    movementTimer: 0,
    score: 0,
    distance: 0,
    speed: START_SPEED,
    elapsed: 0,
    obstacles: STARTING_OBSTACLES.map((obstacle) => ({ ...obstacle })),
    powerUp: "none",
    powerUpTimer: 0,
    shieldHits: 0,
    themeIndex: 0,
    combo: 0,
    coins: 0,
    highScore,
    chaser: {
      distance: CHASER_START_DISTANCE,
      warningLevel: 0,
      caught: false
    }
  };
}

export function getObstacleBounds(state: RunnerState): RunnerObstacle[] {
  return state.obstacles;
}

export function handleRunnerCommand(
  state: RunnerState,
  command: RunnerCommand
): RunnerState {
  if (command === "restart") {
    return createInitialRunnerState();
  }

  if (command === "start") {
    return state.status === "ready" || state.status === "paused"
      ? { ...state, status: "running" }
      : state;
  }

  if (command === "pause") {
    return state.status === "running" ? { ...state, status: "paused" } : state;
  }

  if (command === "resume") {
    return state.status === "paused" ? { ...state, status: "running" } : state;
  }

  if (state.status === "gameOver") {
    return state;
  }

  if (command === "moveLeft") {
    return { ...state, playerLane: clampLane(state.playerLane - 1) };
  }

  if (command === "moveRight") {
    return { ...state, playerLane: clampLane(state.playerLane + 1) };
  }

  if (command === "jump") {
    if (state.movement === "jumping" && state.movementTimer > 0) {
      return state;
    }

    return {
      ...state,
      status: state.status === "ready" ? "running" : state.status,
      movement: "jumping",
      movementTimer: JUMP_DURATION
    };
  }

  if (command === "slide") {
    if (state.movement === "sliding" && state.movementTimer > 0) {
      return state;
    }

    return {
      ...state,
      status: state.status === "ready" ? "running" : state.status,
      movement: "sliding",
      movementTimer: SLIDE_DURATION
    };
  }

  if (command === "activatePowerUp") {
    return state;
  }

  return state;
}

export function tickRunner(state: RunnerState, deltaSeconds: number): RunnerState {
  if (
    state.status === "ready" ||
    state.status === "paused" ||
    state.status === "gameOver"
  ) {
    return state;
  }

  const elapsed = state.elapsed + deltaSeconds;
  const isBoost = state.powerUp === "boost";
  const effectiveSpeed = isBoost
    ? Math.min(MAX_SPEED * BOOST_SPEED_MULTIPLIER, state.speed * BOOST_SPEED_MULTIPLIER)
    : state.speed;
  const distance = state.distance + effectiveSpeed * deltaSeconds;
  const speed = Math.min(MAX_SPEED, START_SPEED + elapsed * 0.18);
  const movementTimer = Math.max(0, state.movementTimer - deltaSeconds);
  const movement = movementTimer > 0 ? state.movement : "running";
  const themeIndex = Math.floor(distance / THEME_DISTANCE);

  const obstacles = recycleObstacles(
    state.obstacles.map((obstacle) => ({
      ...obstacle,
      z: obstacle.z - effectiveSpeed * deltaSeconds
    })),
    elapsed
  );

  const collected = collectItems(obstacles, state, effectiveSpeed, deltaSeconds);
  const scoreMultiplier = isBoost ? BOOST_SCORE_MULTIPLIER : 1;
  const coinScore = collected.coins * 50 * scoreMultiplier;
  const distanceScore = Math.floor(distance * 12 * scoreMultiplier);
  const score = Math.max(distanceScore, state.score) + coinScore;
  const coins = state.coins + collected.coins;

  let powerUp = state.powerUp;
  let powerUpTimer = state.powerUpTimer;
  let shieldHits = state.shieldHits;
  let combo = state.combo;

  if (collected.powerUp) {
    if (collected.powerUp === "shield") {
      powerUp = "shield";
      shieldHits = SHIELD_HITS;
      powerUpTimer = 0;
    } else if (collected.powerUp === "hoverboard") {
      powerUp = "hoverboard";
      shieldHits = HOVERBOARD_HITS;
      powerUpTimer = 0;
    } else if (collected.powerUp === "magnet") {
      powerUp = "magnet";
      powerUpTimer = MAGNET_DURATION;
    } else if (collected.powerUp === "boost") {
      powerUp = "boost";
      powerUpTimer = BOOST_DURATION;
    }
    combo += 1;
  }

  if (collected.coins > 0) {
    combo += collected.coins;
  }

  const chaser = updateChaser(state.chaser, deltaSeconds, combo);

  if (powerUpTimer > 0) {
    powerUpTimer = Math.max(0, powerUpTimer - deltaSeconds);
    if (powerUpTimer <= 0 && powerUp !== "shield") {
      powerUp = "none";
    }
  }

  const nextState: RunnerState = {
    ...state,
    elapsed,
    distance,
    speed,
    movement,
    movementTimer,
    score,
    highScore: Math.max(state.highScore, score),
    coins,
    obstacles: collected.obstacles,
    powerUp,
    powerUpTimer,
    shieldHits,
    themeIndex,
    combo,
    chaser
  };

  if (hasCollision(nextState)) {
    if (shieldHits > 0) {
      const nextChaser = applyMistakeToChaser(nextState.chaser);
      return {
        ...nextState,
        shieldHits: 0,
        powerUp: "none",
        powerUpTimer: 0,
        combo: 0,
        chaser: nextChaser
      };
    }
    return {
      ...nextState,
      status: "gameOver",
      combo: 0,
      highScore: persistHighScore(nextState.highScore),
      chaser: { distance: 0, warningLevel: 3, caught: true }
    };
  }

  return nextState;
}

function readHighScore() {
  if (typeof window === "undefined") return 0;
  const value = Number.parseInt(
    window.localStorage.getItem("fitrun-metro-high-score") ?? "0",
    10
  );
  return Number.isFinite(value) ? value : 0;
}

function persistHighScore(score: number) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("fitrun-metro-high-score", String(score));
  }
  return score;
}

function collectItems(
  obstacles: RunnerObstacle[],
  state: RunnerState,
  speed: number,
  delta: number
) {
  let coins = 0;
  let powerUp: PowerUpKind | null = null;
  const magnetRange = state.powerUp === "magnet" ? 4.2 : 0;
  const updated = obstacles.map((obstacle) => {
    if (obstacle.collected) return obstacle;

    if (obstacle.kind === "coin") {
      const isClose = Math.abs(obstacle.z - PLAYER_Z) < 1.2;
      const sameLane = obstacle.lane === state.playerLane;
      const magnetPull =
        magnetRange > 0 &&
        Math.abs(obstacle.z - PLAYER_Z) < magnetRange &&
        Math.abs(obstacle.lane - state.playerLane) <= 1;

      if ((isClose && sameLane) || magnetPull) {
        coins += 1;
        return { ...obstacle, collected: true };
      }
    }

    if (
      obstacle.kind === "powerUp" &&
      Math.abs(obstacle.z - PLAYER_Z) < 1.2 &&
      obstacle.lane === state.playerLane
    ) {
      powerUp = obstacle.powerUpKind ?? null;
      return { ...obstacle, collected: true };
    }

    return obstacle;
  });

  return { obstacles: updated, coins, powerUp };
}

function clampLane(value: number): Lane {
  if (value < LANES[0]) return -1;
  if (value > LANES[2]) return 1;
  return value as Lane;
}

function hasCollision(state: RunnerState): boolean {
  return state.obstacles.some((obstacle) => {
    if (obstacle.collected) return false;
    if (obstacle.kind === "coin" || obstacle.kind === "powerUp") return false;
    if (obstacle.lane !== state.playerLane) return false;
    if (Math.abs(obstacle.z - PLAYER_Z) > COLLISION_Z) return false;
    if (obstacle.kind === "barrier") return state.movement !== "jumping";
    if (obstacle.kind === "lowGate") return state.movement !== "sliding";
    if (obstacle.kind === "gap") return state.movement !== "jumping";
    if (obstacle.kind === "train" || obstacle.kind === "parkedTrain") return true;
    return false;
  });
}

function recycleObstacles(
  obstacles: RunnerObstacle[],
  elapsed: number
): RunnerObstacle[] {
  let farthestZ = Math.max(...obstacles.map((obstacle) => obstacle.z));

  return obstacles.map((obstacle, index) => {
    if (obstacle.z > OBSTACLE_RESET_Z) {
      return obstacle;
    }

    farthestZ += 9 + ((index + Math.floor(elapsed)) % 4) * 3;

    const kinds: ObstacleKind[] = [
      "coin",
      "coin",
      "barrier",
      "lowGate",
      "train",
      "parkedTrain",
      "gap",
      "powerUp"
    ];
    const kind = kinds[(index + Math.floor(elapsed * 0.35)) % kinds.length];

    return {
      ...obstacle,
      lane: LANES[(index + Math.floor(elapsed)) % LANES.length],
      z: Math.max(farthestZ, OBSTACLE_SPAWN_Z),
      kind,
      collected: false,
      powerUpKind:
        kind === "powerUp"
          ? (["magnet", "shield", "boost", "hoverboard"] as PowerUpKind[])[
              (index + Math.floor(elapsed)) % 4
            ]
          : undefined
    };
  });
}

function updateChaser(
  chaser: ChaserState,
  deltaSeconds: number,
  combo: number
): ChaserState {
  const recovery = combo > 0 ? 1.2 : 0.55;
  const distance = Math.min(
    CHASER_MAX_DISTANCE,
    chaser.distance + recovery * deltaSeconds
  );
  return {
    distance,
    warningLevel: getWarningLevel(distance),
    caught: false
  };
}

function applyMistakeToChaser(chaser: ChaserState): ChaserState {
  const distance = Math.max(4, chaser.distance - 11);
  return {
    distance,
    warningLevel: getWarningLevel(distance),
    caught: false
  };
}

function getWarningLevel(distance: number): ChaserState["warningLevel"] {
  if (distance <= 6) return 3;
  if (distance <= 12) return 2;
  if (distance <= 18) return 1;
  return 0;
}
