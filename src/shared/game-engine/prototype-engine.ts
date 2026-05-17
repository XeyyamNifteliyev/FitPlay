export type PrototypeGameTheme = "dance" | "boxing" | "balloon" | "penalty" | "pilates";

export type PrototypeGameAction = {
  id: string;
  label: string;
  points: number;
  cue: string;
};

export type PrototypeGameDefinition = {
  title: string;
  theme: PrototypeGameTheme;
  durationSeconds: number;
  highScoreKey: string;
  prompt: string;
  metricLabel: string;
  beatSeconds: number;
  lives: number;
  actions: PrototypeGameAction[];
};

export type PrototypeGameStatus = "ready" | "running" | "paused" | "done";

export type PrototypeGameState = {
  status: PrototypeGameStatus;
  score: number;
  combo: number;
  lives: number;
  timeLeft: number;
  beatTimer: number;
  actionIndex: number;
  feedback: string;
  accuracyHits: number;
  attempts: number;
};

export function createPrototypeGameState(
  definition: PrototypeGameDefinition
): PrototypeGameState {
  return {
    status: "ready",
    score: 0,
    combo: 0,
    lives: definition.lives,
    timeLeft: definition.durationSeconds,
    beatTimer: definition.beatSeconds,
    actionIndex: 0,
    feedback: "Hazirdir",
    accuracyHits: 0,
    attempts: 0
  };
}

export function currentPrototypeAction(
  definition: PrototypeGameDefinition,
  state: PrototypeGameState
) {
  return definition.actions[state.actionIndex % definition.actions.length];
}

export function startPrototypeGame(
  definition: PrototypeGameDefinition,
  state: PrototypeGameState
): PrototypeGameState {
  if (state.status === "done") return createRunningState(definition);
  if (state.status === "ready") return { ...state, status: "running", feedback: "Basladi" };
  if (state.status === "paused") return { ...state, status: "running", feedback: "Davam" };
  return state;
}

export function pausePrototypeGame(state: PrototypeGameState): PrototypeGameState {
  return state.status === "running"
    ? { ...state, status: "paused", feedback: "Pauza" }
    : state;
}

export function resetPrototypeGame(
  definition: PrototypeGameDefinition
): PrototypeGameState {
  return createRunningState(definition);
}

export function tickPrototypeGame(
  definition: PrototypeGameDefinition,
  state: PrototypeGameState,
  deltaSeconds: number
): PrototypeGameState {
  if (state.status !== "running") return state;

  const timeLeft = Math.max(0, state.timeLeft - deltaSeconds);
  let beatTimer = state.beatTimer - deltaSeconds;
  let next = {
    ...state,
    timeLeft,
    beatTimer
  };

  if (timeLeft <= 0) {
    return { ...next, status: "done", feedback: "Vaxt bitdi" };
  }

  if (beatTimer <= 0) {
    next = missPrototypeAction(definition, next);
    beatTimer = definition.beatSeconds;
    next.beatTimer = beatTimer;
  }

  if (next.lives <= 0) {
    return { ...next, status: "done", feedback: "Oyun bitdi" };
  }

  return next;
}

export function hitPrototypeAction(
  definition: PrototypeGameDefinition,
  state: PrototypeGameState,
  actionId: string
): PrototypeGameState {
  if (state.status !== "running") return state;

  const expected = currentPrototypeAction(definition, state);
  const attempts = state.attempts + 1;

  if (expected.id !== actionId) {
    return {
      ...state,
      combo: 0,
      lives: Math.max(0, state.lives - 1),
      attempts,
      feedback: "Yanlis hereket"
    };
  }

  const combo = state.combo + 1;
  const multiplier = 1 + Math.floor(combo / 5) * 0.25;
  const score = state.score + Math.round(expected.points * multiplier);

  return {
    ...state,
    score,
    combo,
    attempts,
    accuracyHits: state.accuracyHits + 1,
    actionIndex: state.actionIndex + 1,
    beatTimer: definition.beatSeconds,
    feedback: combo >= 5 ? `Combo x${multiplier.toFixed(2)}` : "Duzgun"
  };
}

export function getPrototypeAccuracy(state: PrototypeGameState) {
  if (state.attempts === 0) return 100;
  return Math.round((state.accuracyHits / state.attempts) * 100);
}

function missPrototypeAction(
  definition: PrototypeGameDefinition,
  state: PrototypeGameState
): PrototypeGameState {
  return {
    ...state,
    combo: 0,
    lives: Math.max(0, state.lives - 1),
    attempts: state.attempts + 1,
    actionIndex: state.actionIndex + 1,
    beatTimer: definition.beatSeconds,
    feedback: "Gecikdi"
  };
}

function createRunningState(definition: PrototypeGameDefinition) {
  return {
    ...createPrototypeGameState(definition),
    status: "running" as const,
    feedback: "Basladi"
  };
}
