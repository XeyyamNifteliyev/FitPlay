import { describe, expect, it } from "vitest";

import {
  classifyPoseGesture,
  createCalibrationFromLandmarks,
  getPoseSensitivityConfig,
  parseVoiceCommand,
  shouldEmitPoseCommand,
  type PoseLandmark
} from "./pose-gesture";

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

describe("pose gesture classifier", () => {
  it("creates calibration only when core landmarks are visible", () => {
    expect(createCalibrationFromLandmarks(pose())).toMatchObject({
      centerX: 0.5,
      hipY: 0.58,
      shoulderY: 0.32
    });

    expect(createCalibrationFromLandmarks(pose({ 11: { visibility: 0.1 } }))).toBeNull();
  });

  it("requires the lower body in TV full-body mode", () => {
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

  it("allows calibration when legs are outside the laptop test frame", () => {
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
    ).toMatchObject({
      centerX: 0.5,
      hipY: 0.58
    });
  });

  it("classifies jump when hips and shoulders move above the calibrated position", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyPoseGesture(
      pose({
        11: { y: 0.23 },
        12: { y: 0.23 },
        23: { y: 0.48 },
        24: { y: 0.48 }
      }),
      calibration
    );

    expect(result.command).toBe("jump");
    expect(result.label).toBe("Tullanma");
  });

  it("does not classify a jump from hip jitter alone", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyPoseGesture(
      pose({
        23: { y: 0.48 },
        24: { y: 0.48 }
      }),
      calibration
    );

    expect(result.command).toBeNull();
  });

  it("uses lower movement thresholds in fast sensitivity mode", () => {
    expect(getPoseSensitivityConfig("fast").verticalRatio).toBeLessThan(
      getPoseSensitivityConfig("normal").verticalRatio
    );
    expect(getPoseSensitivityConfig("fast").cooldownMs).toBeLessThan(
      getPoseSensitivityConfig("normal").cooldownMs
    );
  });

  it("classifies slide when hips drop below the calibrated position", () => {
    const calibration = createCalibrationFromLandmarks(pose());
    const result = classifyPoseGesture(
      pose({
        23: { y: 0.68 },
        24: { y: 0.68 }
      }),
      calibration
    );

    expect(result.command).toBe("slide");
    expect(result.label).toBe("Slide");
  });

  it("classifies left and right body shifts", () => {
    const calibration = createCalibrationFromLandmarks(pose());

    expect(
      classifyPoseGesture(
        pose({
          11: { x: 0.31 },
          12: { x: 0.47 },
          23: { x: 0.33 },
          24: { x: 0.45 }
        }),
        calibration
      ).command
    ).toBe("moveLeft");

    expect(
      classifyPoseGesture(
        pose({
          11: { x: 0.53 },
          12: { x: 0.69 },
          23: { x: 0.55 },
          24: { x: 0.67 }
        }),
        calibration
      ).command
    ).toBe("moveRight");
  });

  it("returns no command for a neutral calibrated pose", () => {
    const calibration = createCalibrationFromLandmarks(pose());

    expect(classifyPoseGesture(pose(), calibration).command).toBeNull();
  });

  it("prevents repeated pose commands inside the cooldown window", () => {
    expect(shouldEmitPoseCommand(null, "jump", 1000, 600)).toBe(true);
    expect(shouldEmitPoseCommand("jump", "jump", 1200, 600, 1000)).toBe(false);
    expect(shouldEmitPoseCommand("jump", "jump", 1700, 600, 1000)).toBe(true);
    expect(shouldEmitPoseCommand("jump", "slide", 1200, 600, 1000)).toBe(true);
  });

  it("does not repeat the same side step until the pose returns neutral", () => {
    expect(shouldEmitPoseCommand(null, "moveRight", 1000, 220)).toBe(true);
    expect(shouldEmitPoseCommand("moveRight", "moveRight", 1500, 220, 1000)).toBe(
      false
    );
    expect(shouldEmitPoseCommand(null, "moveRight", 1600, 220, 1000)).toBe(true);
  });

  it("parses Azerbaijani voice commands for hands-free play", () => {
    expect(parseVoiceCommand("kamera ac")).toBe("camera");
    expect(parseVoiceCommand("basla")).toBe("start");
    expect(parseVoiceCommand("başla")).toBe("start");
    expect(parseVoiceCommand("bashla")).toBe("start");
    expect(parseVoiceCommand("başlat")).toBe("start");
    expect(parseVoiceCommand("başlayır")).toBe("start");
    expect(parseVoiceCommand("başlıyaq")).toBe("start");
    expect(parseVoiceCommand("kalibrasiya et")).toBe("calibrate");
    expect(parseVoiceCommand("yeniden basla")).toBe("restart");
    expect(parseVoiceCommand("pauza")).toBe("pause");
    expect(parseVoiceCommand("dayan")).toBe("pause");
    expect(parseVoiceCommand("davam et")).toBe("resume");
    expect(parseVoiceCommand("oyunlara qayit")).toBe("backToGames");
    expect(parseVoiceCommand("menyu")).toBe("backToGames");
    expect(parseVoiceCommand("subway runner")).toBe("selectSubway");
    expect(parseVoiceCommand("kamera dayandir")).toBe("stop");
    expect(parseVoiceCommand("salam")).toBeNull();
  });
});
