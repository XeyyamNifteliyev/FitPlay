import type { MotionCommand } from "./motion-types";

const COOLDOWNS: Record<MotionCommand, number> = {
  stepLeft: 380,
  stepRight: 380,
  leanLeft: 420,
  leanRight: 420,
  jump: 900,
  squat: 700,
  slide: 700,
  reachLeft: 180,
  reachRight: 180,
  bothHandsUp: 900,
  punchLeft: 280,
  punchRight: 280,
  block: 250,
  clap: 500
};

const SIDE_STEP_COMMANDS: ReadonlySet<MotionCommand> = new Set([
  "stepLeft",
  "stepRight",
  "leanLeft",
  "leanRight"
]);

export function getCooldownMs(command: MotionCommand): number {
  return COOLDOWNS[command];
}

export function isSideStepCommand(command: MotionCommand): boolean {
  return SIDE_STEP_COMMANDS.has(command);
}

export function shouldEmitMotionCommand(
  previousCommand: MotionCommand | null,
  nextCommand: MotionCommand | null,
  now: number,
  cooldownMs: number,
  previousAt = Number.NEGATIVE_INFINITY
): boolean {
  if (!nextCommand) {
    return false;
  }

  if (previousCommand !== nextCommand) {
    return true;
  }

  if (isSideStepCommand(nextCommand)) {
    return false;
  }

  return now - previousAt >= cooldownMs;
}
