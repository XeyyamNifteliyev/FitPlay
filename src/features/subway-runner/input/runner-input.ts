import type { RunnerCommand } from "../engine/runner-engine";

export type RunnerInputSource = "keyboard" | "mediapipe";

export type RunnerInputEvent = {
  command: RunnerCommand;
  source: RunnerInputSource;
  at: number;
};

export type RunnerInputHandler = (event: RunnerInputEvent) => void;
