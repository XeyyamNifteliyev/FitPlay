import type {
  MotionCommand,
  PoseLandmark,
  PoseCalibration,
  PoseTrackingMode,
  PoseSensitivityMode,
  PoseSensitivityConfig
} from "./motion-types";

export type MotionGestureResult = {
  command: MotionCommand | null;
  label: string;
  confidence: number;
};

const NO_COMMAND: MotionGestureResult = {
  command: null,
  label: "Neytral",
  confidence: 0
};

const LANDMARK = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftWrist: 15,
  rightWrist: 16,
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
  const hip = averagePoint(
    landmarks[LANDMARK.leftHip],
    landmarks[LANDMARK.rightHip]
  );
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

export function classifyMotionGesture(
  landmarks: PoseLandmark[],
  calibration: PoseCalibration | null,
  mode: PoseTrackingMode = "fullBody",
  sensitivity: PoseSensitivityMode = "normal"
): MotionGestureResult {
  const config = getSensitivityConfig(sensitivity);

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
  const hip = averagePoint(
    landmarks[LANDMARK.leftHip],
    landmarks[LANDMARK.rightHip]
  );
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
      command: "leanLeft",
      label: "Sola eyil",
      confidence: clampConfidence(Math.abs(lateralDelta) / lateralThreshold)
    };
  }

  if (lateralDelta > lateralThreshold) {
    return {
      command: "leanRight",
      label: "Saga eyil",
      confidence: clampConfidence(lateralDelta / lateralThreshold)
    };
  }

  const leftWrist = landmarks[LANDMARK.leftWrist];
  const rightWrist = landmarks[LANDMARK.rightWrist];
  const nose = landmarks[LANDMARK.nose];

  if (
    leftWrist &&
    rightWrist &&
    leftWrist.y < nose.y &&
    rightWrist.y < nose.y
  ) {
    return {
      command: "bothHandsUp",
      label: "Eller yuxari",
      confidence: 0.8
    };
  }

  return NO_COMMAND;
}

export function getSensitivityConfig(
  mode: PoseSensitivityMode
): PoseSensitivityConfig {
  return SENSITIVITY_CONFIG[mode];
}

export function hasRequiredVisibility(
  landmarks: PoseLandmark[],
  mode: PoseTrackingMode
) {
  if (mode === "laptop") {
    return hasUpperBodyVisibility(landmarks);
  }

  return hasUpperBodyVisibility(landmarks) && hasFullBodyVisibility(landmarks);
}

export function hasUpperBodyVisibility(landmarks: PoseLandmark[]) {
  return [
    LANDMARK.nose,
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip
  ].every(
    (index) => (landmarks[index]?.visibility ?? 1) >= MIN_VISIBILITY
  );
}

export function hasFullBodyVisibility(landmarks: PoseLandmark[]) {
  return [
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle
  ].every(
    (index) => (landmarks[index]?.visibility ?? 1) >= MIN_VISIBILITY
  );
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
