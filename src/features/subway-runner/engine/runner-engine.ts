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
  | "restart";

export type ObstacleKind = "barrier" | "lowGate" | "coin";

export type RunnerObstacle = {
  id: string;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
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

const STARTING_OBSTACLES: RunnerObstacle[] = [
  { id: "barrier-1", lane: 0, z: 16, kind: "barrier" },
  { id: "low-gate-1", lane: -1, z: 27, kind: "lowGate" },
  { id: "coin-1", lane: 1, z: 36, kind: "coin" },
  { id: "barrier-2", lane: -1, z: 48, kind: "barrier" },
  { id: "low-gate-2", lane: 1, z: 60, kind: "lowGate" }
];

export function createInitialRunnerState(): RunnerState {
  return {
    status: "ready",
    playerLane: 0,
    movement: "running",
    movementTimer: 0,
    score: 0,
    distance: 0,
    speed: START_SPEED,
    elapsed: 0,
    obstacles: STARTING_OBSTACLES.map((obstacle) => ({ ...obstacle }))
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
  const distance = state.distance + state.speed * deltaSeconds;
  const speed = Math.min(MAX_SPEED, START_SPEED + elapsed * 0.18);
  const movementTimer = Math.max(0, state.movementTimer - deltaSeconds);
  const movement = movementTimer > 0 ? state.movement : "running";
  const obstacles = recycleObstacles(
    state.obstacles.map((obstacle) => ({
      ...obstacle,
      z: obstacle.z - state.speed * deltaSeconds
    })),
    elapsed
  );

  const nextState: RunnerState = {
    ...state,
    elapsed,
    distance,
    speed,
    movement,
    movementTimer,
    score: Math.floor(distance * 12),
    obstacles
  };

  if (hasCollision(nextState)) {
    return { ...nextState, status: "gameOver" };
  }

  return nextState;
}

function clampLane(value: number): Lane {
  if (value < LANES[0]) return -1;
  if (value > LANES[2]) return 1;
  return value as Lane;
}

function hasCollision(state: RunnerState): boolean {
  return state.obstacles.some((obstacle) => {
    if (obstacle.kind === "coin") return false;
    if (obstacle.lane !== state.playerLane) return false;
    if (Math.abs(obstacle.z - PLAYER_Z) > COLLISION_Z) return false;
    if (obstacle.kind === "barrier") return state.movement !== "jumping";
    if (obstacle.kind === "lowGate") return state.movement !== "sliding";
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

    farthestZ += 10 + ((index + Math.floor(elapsed)) % 3) * 3;

    return {
      ...obstacle,
      lane: LANES[(index + Math.floor(elapsed)) % LANES.length],
      z: Math.max(farthestZ, OBSTACLE_SPAWN_Z),
      kind: obstacle.kind
    };
  });
}
