import type { RunnerCommand } from "../engine/runner-engine";

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type PoseCalibration = {
  centerX: number;
  shoulderY: number;
  hipY: number;
  bodyHeight: number;
};

export type PoseGestureResult = {
  command: RunnerCommand | null;
  label: string;
  confidence: number;
};

export type PoseTrackingMode = "fullBody" | "laptop";

export type PoseSensitivityMode = "normal" | "fast";

export type PoseSensitivityConfig = {
  verticalRatio: number;
  lateralThreshold: number;
  cooldownMs: number;
  videoWidth: number;
  videoHeight: number;
  uiUpdateMs: number;
};

export type VoiceCommand =
  | "camera"
  | "start"
  | "pause"
  | "resume"
  | "calibrate"
  | "restart"
  | "backToGames"
  | "selectSubway"
  | "stop";

const NO_COMMAND: PoseGestureResult = {
  command: null,
  label: "Neytral",
  confidence: 0
};

const LANDMARK = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28
} as const;

const MIN_VISIBILITY = 0.5;

const SENSITIVITY_CONFIG: Record<PoseSensitivityMode, PoseSensitivityConfig> = {
  normal: {
    verticalRatio: 0.09,
    lateralThreshold: 0.07,
    cooldownMs: 620,
    videoWidth: 640,
    videoHeight: 480,
    uiUpdateMs: 120
  },
  fast: {
    verticalRatio: 0.055,
    lateralThreshold: 0.045,
    cooldownMs: 220,
    videoWidth: 320,
    videoHeight: 240,
    uiUpdateMs: 220
  }
};

export function createCalibrationFromLandmarks(
  landmarks: PoseLandmark[],
  mode: PoseTrackingMode = "fullBody"
): PoseCalibration | null {
  if (!hasRequiredVisibility(landmarks, mode)) {
    return null;
  }

  const shoulder = averagePoint(
    landmarks[LANDMARK.leftShoulder],
    landmarks[LANDMARK.rightShoulder]
  );
  const hip = averagePoint(landmarks[LANDMARK.leftHip], landmarks[LANDMARK.rightHip]);
  const lowerBody = hasFullBodyVisibility(landmarks)
    ? averagePoint(landmarks[LANDMARK.leftAnkle], landmarks[LANDMARK.rightAnkle])
    : null;
  const bodyHeight = Math.max(
    0.18,
    lowerBody
      ? lowerBody.y - landmarks[LANDMARK.nose].y
      : (hip.y - landmarks[LANDMARK.nose].y) * 1.45
  );

  return {
    centerX: (shoulder.x + hip.x) / 2,
    shoulderY: shoulder.y,
    hipY: hip.y,
    bodyHeight
  };
}

export function classifyPoseGesture(
  landmarks: PoseLandmark[],
  calibration: PoseCalibration | null,
  mode: PoseTrackingMode = "fullBody",
  sensitivity: PoseSensitivityMode = "normal"
): PoseGestureResult {
  const config = getPoseSensitivityConfig(sensitivity);

  if (!calibration || !hasRequiredVisibility(landmarks, mode)) {
    return {
      command: null,
      label:
        mode === "fullBody"
          ? "TV rejimi: basdan ayaga gorunmelisen"
          : "Beden kamerada tam gorunmur",
      confidence: 0
    };
  }

  const shoulder = averagePoint(
    landmarks[LANDMARK.leftShoulder],
    landmarks[LANDMARK.rightShoulder]
  );
  const hip = averagePoint(landmarks[LANDMARK.leftHip], landmarks[LANDMARK.rightHip]);
  const centerX = (shoulder.x + hip.x) / 2;

  const jumpDelta = calibration.hipY - hip.y;
  const shoulderLift = calibration.shoulderY - shoulder.y;
  const slideDelta = hip.y - calibration.hipY;
  const lateralDelta = centerX - calibration.centerX;
  const verticalThreshold = calibration.bodyHeight * config.verticalRatio;
  const shoulderJumpThreshold = verticalThreshold * 0.45;
  const lateralThreshold = config.lateralThreshold;

  if (jumpDelta > verticalThreshold && shoulderLift > shoulderJumpThreshold) {
    return {
      command: "jump",
      label: "Tullanma",
      confidence: clampConfidence(jumpDelta / verticalThreshold)
    };
  }

  if (slideDelta > verticalThreshold) {
    return {
      command: "slide",
      label: "Slide",
      confidence: clampConfidence(slideDelta / verticalThreshold)
    };
  }

  if (lateralDelta < -lateralThreshold) {
    return {
      command: "moveLeft",
      label: "Sola kec",
      confidence: clampConfidence(Math.abs(lateralDelta) / lateralThreshold)
    };
  }

  if (lateralDelta > lateralThreshold) {
    return {
      command: "moveRight",
      label: "Saga kec",
      confidence: clampConfidence(lateralDelta / lateralThreshold)
    };
  }

  return NO_COMMAND;
}

export function getPoseSensitivityConfig(
  mode: PoseSensitivityMode
): PoseSensitivityConfig {
  return SENSITIVITY_CONFIG[mode];
}

export function shouldEmitPoseCommand(
  previousCommand: RunnerCommand | null,
  nextCommand: RunnerCommand | null,
  now: number,
  cooldownMs: number,
  previousAt = Number.NEGATIVE_INFINITY
) {
  if (!nextCommand) {
    return false;
  }

  if (previousCommand !== nextCommand) {
    return true;
  }

  if (isSideStepCommand(nextCommand)) {
    return false;
  }

  return now - previousAt >= cooldownMs;
}

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const normalized = normalizeVoice(transcript);

  if (includesAny(normalized, ["oyunlara qayit", "oyunlara kayit", "menyu", "geri"])) {
    return "backToGames";
  }

  if (
    includesAny(normalized, [
      "subway runner",
      "sabvey runner",
      "subway",
      "qacis oyunu",
      "qacis"
    ])
  ) {
    return "selectSubway";
  }

  if (includesAny(normalized, ["davam et", "devam et", "resume", "davam"])) {
    return "resume";
  }

  if (
    includesAny(normalized, [
      "kamerani dayandir",
      "kamera dayandir",
      "kamerani saxla",
      "camera stop",
      "stop camera"
    ])
  ) {
    return "stop";
  }

  if (includesAny(normalized, ["kamera ac", "kamerani ac", "camera", "kamera"])) {
    return "camera";
  }

  if (includesAny(normalized, ["kalibrasiya", "kalibre", "calibrate"])) {
    return "calibrate";
  }

  if (includesAny(normalized, ["yeniden", "restart", "tekrar"])) {
    return "restart";
  }

  if (includesAny(normalized, ["pauza", "pause", "dayan", "saxla"])) {
    return "pause";
  }

  if (
    includesAny(normalized, [
      "basla",
      "bashla",
      "baslat",
      "baslayir",
      "basliyaq",
      "start",
      "oyna"
    ])
  ) {
    return "start";
  }

  return null;
}

function hasRequiredVisibility(landmarks: PoseLandmark[], mode: PoseTrackingMode) {
  if (mode === "laptop") {
    return hasUpperBodyVisibility(landmarks);
  }

  return hasUpperBodyVisibility(landmarks) && hasFullBodyVisibility(landmarks);
}

function hasUpperBodyVisibility(landmarks: PoseLandmark[]) {
  return [
    LANDMARK.nose,
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip
  ].every((index) => (landmarks[index]?.visibility ?? 1) >= MIN_VISIBILITY);
}

function hasFullBodyVisibility(landmarks: PoseLandmark[]) {
  return [
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle
  ].every((index) => (landmarks[index]?.visibility ?? 1) >= MIN_VISIBILITY);
}

function averagePoint(left: PoseLandmark, right: PoseLandmark) {
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2
  };
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isSideStepCommand(command: RunnerCommand) {
  return command === "moveLeft" || command === "moveRight";
}

function normalizeVoice(value: string) {
  return value
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .replaceAll("ə", "e")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ğ", "g")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate));
}
