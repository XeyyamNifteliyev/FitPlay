import type {
  PoseLandmark,
  PoseTrackingMode,
  CameraStatus
} from "./motion-types";
import {
  hasRequiredVisibility,
  hasUpperBodyVisibility,
  hasFullBodyVisibility
} from "./gesture-classifier";

export function computeCameraStatus(
  landmarks: PoseLandmark[] | null,
  mode: PoseTrackingMode,
  fps: number
): CameraStatus {
  if (!landmarks) {
    return {
      ready: false,
      fullBodyVisible: false,
      missing: ["head", "hands", "hips", "knees", "feet"],
      distance: "tooFar",
      fps
    };
  }

  const missing = computeMissing(landmarks, mode);
  const fullBodyVisible =
    mode === "laptop" ? hasUpperBodyVisibility(landmarks) : hasFullBodyVisibility(landmarks);
  const ready = hasRequiredVisibility(landmarks, mode);
  const distance = estimateDistance(landmarks);

  return {
    ready,
    fullBodyVisible,
    missing,
    distance,
    fps
  };
}

function computeMissing(
  landmarks: PoseLandmark[],
  mode: PoseTrackingMode
): Array<"head" | "hands" | "hips" | "knees" | "feet"> {
  const missing: Array<"head" | "hands" | "hips" | "knees" | "feet"> = [];
  const MIN = 0.5;

  if ((landmarks[0]?.visibility ?? 1) < MIN) {
    missing.push("head");
  }

  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  if (
    (leftWrist?.visibility ?? 1) < MIN &&
    (rightWrist?.visibility ?? 1) < MIN
  ) {
    missing.push("hands");
  }

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  if (
    (leftHip?.visibility ?? 1) < MIN &&
    (rightHip?.visibility ?? 1) < MIN
  ) {
    missing.push("hips");
  }

  if (mode === "fullBody") {
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    if (
      (leftKnee?.visibility ?? 1) < MIN &&
      (rightKnee?.visibility ?? 1) < MIN
    ) {
      missing.push("knees");
    }

    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    if (
      (leftAnkle?.visibility ?? 1) < MIN &&
      (rightAnkle?.visibility ?? 1) < MIN
    ) {
      missing.push("feet");
    }
  }

  return missing;
}

function estimateDistance(
  landmarks: PoseLandmark[]
): "tooClose" | "good" | "tooFar" {
  const nose = landmarks[0];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!nose || !leftHip || !rightHip) {
    return "tooFar";
  }

  const bodyHeight = Math.abs(
    ((leftHip.y + rightHip.y) / 2) - nose.y
  );

  if (bodyHeight > 0.65) return "tooClose";
  if (bodyHeight < 0.25) return "tooFar";
  return "good";
}
