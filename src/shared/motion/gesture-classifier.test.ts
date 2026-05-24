import { describe, expect, it } from "vitest";

import {
  classifyMotionGesture,
  createCalibrationFromLandmarks,
  getSensitivityConfig,
  hasRequiredVisibility,
  hasUpperBodyVisibility,
  hasFullBodyVisibility,
  type PoseLandmark
} from "./gesture-classifier";

function pose(overrides: Partial<Record<number, Partial<PoseLandmark>>> = {}) {
  const landmarks = Array.from({ length: 33 }, (_, index) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95
  }));

  landmarks[0] = { ...landmarks[0], x: 0.5, y: 0.16 };
  landmarks[11] = { ...landmarks[11], x: 0.42, y: 0.32 };
  landmarks[12] = { ...landmarks[12], x: 0.58, y: 0.32 };
  landmarks[15] = { ...landmarks[15], x: 0.35, y: 0.52 };
  landmarks[16] = { ...landmarks[16], x: 0.65, y: 0.52 };
  landmarks[23] = { ...landmarks[23], x: 0.44, y: 0.58 };
  landmarks[24] = { ...landmarks[24], x: 0.56, y: 0.58 };
  landmarks[25] = { ...landmarks[25], x: 0.45, y: 0.76 };
  landmarks[26] = { ...landmarks[26], x: 0.55, y: 0.76 };
  landmarks[27] = { ...landmarks[27], x: 0.45, y: 0.94 };
  landmarks[28] = { ...landmarks[28], x: 0.55, y: 0.94 };

  Object.entries(overrides).forEach(([index, value]) => {
    const landmarkIndex = Number(index);
    landmarks[landmarkIndex] = { ...landmarks[landmarkIndex], ...value };
  });

  return landmarks;
}

describe("gesture classifier (shared)", () => {
  it("creates calibration with center, shoulder and hip positions", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    expect(calibration).toMatchObject({
      centerX: 0.5,
      hipY: 0.58,
      shoulderY: 0.32
    });
    expect(calibration!.bodyHeight).toBeGreaterThan(0.18);
  });

  it("returns null calibration when shoulders are not visible", () => {
    expect(
      createCalibrationFromLandmarks(pose({ 11: { visibility: 0.1 } }))
    ).toBeNull();
  });

  it("requires lower body in fullBody mode", () => {
    expect(
      createCalibrationFromLandmarks(
        pose({
          25: { visibility: 0.05 },
          26: { visibility: 0.05 },
          27: { visibility: 0.05 },
          28: { visibility: 0.05 }
        })
      )
    ).toBeNull();
  });

  it("allows laptop mode without lower body", () => {
    expect(
      createCalibrationFromLandmarks(
        pose({
          25: { visibility: 0.05 },
          26: { visibility: 0.05 },
          27: { visibility: 0.05 },
          28: { visibility: 0.05 }
        }),
        "laptop"
      )
    ).not.toBeNull();
  });

  it("classifies jump as MotionCommand jump", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({
        11: { y: 0.23 },
        12: { y: 0.23 },
        23: { y: 0.48 },
        24: { y: 0.48 }
      }),
      calibration
    );
    expect(result.command).toBe("jump");
  });

  it("classifies slide as MotionCommand slide", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({
        23: { y: 0.68 },
        24: { y: 0.68 }
      }),
      calibration
    );
    expect(result.command).toBe("slide");
  });

  it("classifies left lean as MotionCommand leanLeft", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({
        11: { x: 0.31 },
        12: { x: 0.47 },
        23: { x: 0.33 },
        24: { x: 0.45 }
      }),
      calibration
    );
    expect(result.command).toBe("leanLeft");
  });

  it("classifies right lean as MotionCommand leanRight", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({
        11: { x: 0.53 },
        12: { x: 0.69 },
        23: { x: 0.55 },
        24: { x: 0.67 }
      }),
      calibration
    );
    expect(result.command).toBe("leanRight");
  });

  it("returns null for neutral pose", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    expect(classifyMotionGesture(pose(), calibration).command).toBeNull();
  });

  it("returns null when calibration is missing", () => {
    expect(classifyMotionGesture(pose(), null).command).toBeNull();
  });

  it("does not classify jump from hip jitter alone", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({ 23: { y: 0.48 }, 24: { y: 0.48 } }),
      calibration
    );
    expect(result.command).toBeNull();
  });

  it("detects bothHandsUp when wrists are above nose", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyMotionGesture(
      pose({
        15: { y: 0.1 },
        16: { y: 0.1 }
      }),
      calibration
    );
    expect(result.command).toBe("bothHandsUp");
  });

  it("fast mode has lower thresholds than normal", () => {
    const fast = getSensitivityConfig("fast");
    const normal = getSensitivityConfig("normal");
    expect(fast.verticalRatio).toBeLessThan(normal.verticalRatio);
    expect(fast.cooldownMs).toBeLessThan(normal.cooldownMs);
  });

  it("hasRequiredVisibility checks upper body for laptop mode", () => {
    const partial = pose({
      25: { visibility: 0.05 },
      26: { visibility: 0.05 },
      27: { visibility: 0.05 },
      28: { visibility: 0.05 }
    });
    expect(hasRequiredVisibility(partial, "laptop")).toBe(true);
    expect(hasRequiredVisibility(partial, "fullBody")).toBe(false);
  });

  it("hasFullBodyVisibility returns false when ankles are hidden", () => {
    const partial = pose({
      27: { visibility: 0.05 },
      28: { visibility: 0.05 }
    });
    expect(hasFullBodyVisibility(partial)).toBe(false);
  });

  it("hasUpperBodyVisibility returns false when shoulders are hidden", () => {
    const partial = pose({
      11: { visibility: 0.05 },
      12: { visibility: 0.05 }
    });
    expect(hasUpperBodyVisibility(partial)).toBe(false);
  });
});
