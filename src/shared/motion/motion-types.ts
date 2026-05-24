export type MotionCommand =
  | "stepLeft"
  | "stepRight"
  | "leanLeft"
  | "leanRight"
  | "jump"
  | "squat"
  | "slide"
  | "reachLeft"
  | "reachRight"
  | "bothHandsUp"
  | "punchLeft"
  | "punchRight"
  | "block"
  | "clap";

export type MotionEvent = {
  command: MotionCommand;
  confidence: number;
  velocity?: number;
  heldMs?: number;
  at: number;
};

export type CameraStatus = {
  ready: boolean;
  fullBodyVisible: boolean;
  missing: Array<"head" | "hands" | "hips" | "knees" | "feet">;
  distance: "tooClose" | "good" | "tooFar";
  fps: number;
};

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
