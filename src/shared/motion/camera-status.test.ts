import { describe, expect, it } from "vitest";

import { computeCameraStatus } from "./camera-status";
import type { PoseLandmark } from "./motion-types";

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

describe("camera status", () => {
  it("returns not ready with all missing when landmarks are null", () => {
    const status = computeCameraStatus(null, "fullBody", 30);
    expect(status.ready).toBe(false);
    expect(status.fullBodyVisible).toBe(false);
    expect(status.missing).toContain("head");
    expect(status.fps).toBe(30);
  });

  it("returns ready with full body visible for complete pose in fullBody mode", () => {
    const status = computeCameraStatus(pose(), "fullBody", 60);
    expect(status.ready).toBe(true);
    expect(status.fullBodyVisible).toBe(true);
    expect(status.missing).toHaveLength(0);
  });

  it("returns ready for laptop mode without lower body", () => {
    const status = computeCameraStatus(
      pose({
        25: { visibility: 0.05 },
        26: { visibility: 0.05 },
        27: { visibility: 0.05 },
        28: { visibility: 0.05 }
      }),
      "laptop",
      30
    );
    expect(status.ready).toBe(true);
  });

  it("reports missing feet when ankles are not visible in fullBody mode", () => {
    const status = computeCameraStatus(
      pose({ 27: { visibility: 0.05 }, 28: { visibility: 0.05 } }),
      "fullBody",
      30
    );
    expect(status.missing).toContain("feet");
  });

  it("reports missing head when nose is not visible", () => {
    const status = computeCameraStatus(
      pose({ 0: { visibility: 0.05 } }),
      "fullBody",
      30
    );
    expect(status.missing).toContain("head");
  });

  it("returns good distance for normal body height", () => {
    const status = computeCameraStatus(pose(), "fullBody", 30);
    expect(status.distance).toBe("good");
  });

  it("returns tooClose when body fills most of the frame", () => {
    const closePose = pose();
    closePose[0] = { x: 0.5, y: 0.05, visibility: 0.95 };
    closePose[23] = { x: 0.44, y: 0.75, visibility: 0.95 };
    closePose[24] = { x: 0.56, y: 0.75, visibility: 0.95 };
    const status = computeCameraStatus(closePose, "fullBody", 30);
    expect(status.distance).toBe("tooClose");
  });

  it("returns tooFar when body is very small in frame", () => {
    const farPose = pose();
    farPose[0] = { x: 0.5, y: 0.48, visibility: 0.95 };
    farPose[23] = { x: 0.49, y: 0.52, visibility: 0.95 };
    farPose[24] = { x: 0.51, y: 0.52, visibility: 0.95 };
    const status = computeCameraStatus(farPose, "fullBody", 30);
    expect(status.distance).toBe("tooFar");
  });
});
