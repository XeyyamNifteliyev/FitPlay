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

import {
  createCalibrationFromLandmarks as sharedCreateCalibration,
  classifyMotionGesture,
  getSensitivityConfig as sharedGetConfig
} from "../../../shared/motion/gesture-classifier";
import { shouldEmitMotionCommand } from "../../../shared/motion/gesture-cooldowns";
import { parseVoiceCommand as sharedParseVoice, type VoiceCommand as SharedVoiceCommand } from "../../../shared/voice/voice-commands";

const MOTION_TO_RUNNER: Record<string, RunnerCommand | null> = {
  leanLeft: "moveLeft",
  leanRight: "moveRight",
  stepLeft: "moveLeft",
  stepRight: "moveRight",
  jump: "jump",
  slide: "slide",
  squat: "slide"
};

function motionToRunner(motion: string | null): RunnerCommand | null {
  if (!motion) return null;
  return MOTION_TO_RUNNER[motion] ?? null;
}

function sharedVoiceToLocal(cmd: SharedVoiceCommand | null): VoiceCommand | null {
  if (!cmd) return null;
  if (cmd === "openCalibration") return "calibrate";
  if (cmd === "cameraStop") return "stop";
  return cmd as VoiceCommand;
}

export function createCalibrationFromLandmarks(
  landmarks: PoseLandmark[],
  mode: PoseTrackingMode = "fullBody"
): PoseCalibration | null {
  return sharedCreateCalibration(landmarks, mode);
}

export function classifyPoseGesture(
  landmarks: PoseLandmark[],
  calibration: PoseCalibration | null,
  mode: PoseTrackingMode = "fullBody",
  sensitivity: PoseSensitivityMode = "normal"
): PoseGestureResult {
  const result = classifyMotionGesture(landmarks, calibration, mode, sensitivity);
  return {
    command: motionToRunner(result.command),
    label: result.label,
    confidence: result.confidence
  };
}

export function getPoseSensitivityConfig(
  mode: PoseSensitivityMode
): PoseSensitivityConfig {
  return sharedGetConfig(mode);
}

const RUNNER_SIDE_STEPS = new Set<string>(["moveLeft", "moveRight"]);

export function shouldEmitPoseCommand(
  previousCommand: RunnerCommand | null,
  nextCommand: RunnerCommand | null,
  now: number,
  cooldownMs: number,
  previousAt = Number.NEGATIVE_INFINITY
) {
  if (!nextCommand) return false;
  if (previousCommand !== nextCommand) return true;
  if (RUNNER_SIDE_STEPS.has(nextCommand)) return false;
  return now - previousAt >= cooldownMs;
}

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  return sharedVoiceToLocal(sharedParseVoice(transcript));
}
