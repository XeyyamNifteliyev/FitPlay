import { describe, expect, it } from "vitest";

import { motionToRunnerCommand, RUNNER_MOTION_COMMANDS } from "./motion-map";

describe("motion map", () => {
  it("maps leanLeft to moveLeft", () => {
    expect(motionToRunnerCommand("leanLeft")).toBe("moveLeft");
  });

  it("maps leanRight to moveRight", () => {
    expect(motionToRunnerCommand("leanRight")).toBe("moveRight");
  });

  it("maps stepLeft to moveLeft", () => {
    expect(motionToRunnerCommand("stepLeft")).toBe("moveLeft");
  });

  it("maps stepRight to moveRight", () => {
    expect(motionToRunnerCommand("stepRight")).toBe("moveRight");
  });

  it("maps jump to jump", () => {
    expect(motionToRunnerCommand("jump")).toBe("jump");
  });

  it("maps squat to slide", () => {
    expect(motionToRunnerCommand("squat")).toBe("slide");
  });

  it("maps slide to slide", () => {
    expect(motionToRunnerCommand("slide")).toBe("slide");
  });

  it("maps bothHandsUp to power-up activation", () => {
    expect(motionToRunnerCommand("bothHandsUp")).toBe("activatePowerUp");
  });

  it("returns null for reachLeft", () => {
    expect(motionToRunnerCommand("reachLeft")).toBeNull();
  });

  it("returns null for punchLeft", () => {
    expect(motionToRunnerCommand("punchLeft")).toBeNull();
  });

  it("RUNNER_MOTION_COMMANDS includes all needed commands", () => {
    expect(RUNNER_MOTION_COMMANDS).toContain("leanLeft");
    expect(RUNNER_MOTION_COMMANDS).toContain("leanRight");
    expect(RUNNER_MOTION_COMMANDS).toContain("jump");
    expect(RUNNER_MOTION_COMMANDS).toContain("slide");
    expect(RUNNER_MOTION_COMMANDS).toContain("bothHandsUp");
    expect(RUNNER_MOTION_COMMANDS).toContain("reachLeft");
    expect(RUNNER_MOTION_COMMANDS).toContain("reachRight");
  });
});
