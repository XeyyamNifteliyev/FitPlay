import type { MotionCommand } from "../../../shared/motion/motion-types";
import type { RunnerCommand } from "../engine/runner-engine";

const RUNNER_MOTION_MAP: Partial<Record<MotionCommand, RunnerCommand>> = {
  stepLeft: "moveLeft",
  leanLeft: "moveLeft",
  stepRight: "moveRight",
  leanRight: "moveRight",
  jump: "jump",
  squat: "slide",
  slide: "slide",
  bothHandsUp: "activatePowerUp"
};

export function motionToRunnerCommand(
  motion: MotionCommand
): RunnerCommand | null {
  return RUNNER_MOTION_MAP[motion] ?? null;
}

export const RUNNER_MOTION_COMMANDS: MotionCommand[] = [
  "stepLeft",
  "stepRight",
  "leanLeft",
  "leanRight",
  "jump",
  "squat",
  "slide",
  "reachLeft",
  "reachRight",
  "bothHandsUp"
];
