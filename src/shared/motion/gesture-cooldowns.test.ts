import { describe, expect, it } from "vitest";

import {
  getCooldownMs,
  isSideStepCommand,
  shouldEmitMotionCommand
} from "./gesture-cooldowns";

describe("gesture cooldowns", () => {
  it("returns positive cooldown for every MotionCommand", () => {
    const commands = [
      "stepLeft", "stepRight", "leanLeft", "leanRight",
      "jump", "squat", "slide",
      "reachLeft", "reachRight", "bothHandsUp",
      "punchLeft", "punchRight", "block", "clap"
    ] as const;

    for (const cmd of commands) {
      expect(getCooldownMs(cmd)).toBeGreaterThan(0);
    }
  });

  it("jump has a longer cooldown than punch", () => {
    expect(getCooldownMs("jump")).toBeGreaterThan(getCooldownMs("punchLeft"));
  });

  it("identifies side step commands correctly", () => {
    expect(isSideStepCommand("stepLeft")).toBe(true);
    expect(isSideStepCommand("stepRight")).toBe(true);
    expect(isSideStepCommand("leanLeft")).toBe(true);
    expect(isSideStepCommand("leanRight")).toBe(true);
    expect(isSideStepCommand("jump")).toBe(false);
    expect(isSideStepCommand("slide")).toBe(false);
    expect(isSideStepCommand("punchLeft")).toBe(false);
  });

  it("emits command when previous is null", () => {
    expect(shouldEmitMotionCommand(null, "jump", 1000, 600)).toBe(true);
  });

  it("emits command when it changes to a different command", () => {
    expect(shouldEmitMotionCommand("jump", "slide", 1200, 600, 1000)).toBe(true);
  });

  it("does not emit same command within cooldown", () => {
    expect(shouldEmitMotionCommand("jump", "jump", 1200, 600, 1000)).toBe(false);
  });

  it("emits same command after cooldown expires", () => {
    expect(shouldEmitMotionCommand("jump", "jump", 1700, 600, 1000)).toBe(true);
  });

  it("never repeats side step commands with same direction", () => {
    expect(shouldEmitMotionCommand("leanLeft", "leanLeft", 2000, 400, 1000)).toBe(false);
    expect(shouldEmitMotionCommand("stepRight", "stepRight", 2000, 400, 1000)).toBe(false);
  });

  it("side step resets when previous is null (neutral return)", () => {
    expect(shouldEmitMotionCommand(null, "leanLeft", 1600, 400, 1000)).toBe(true);
  });

  it("does not emit null command", () => {
    expect(shouldEmitMotionCommand(null, null, 1000, 600)).toBe(false);
  });
});
