"use client";

import { useCallback } from "react";

import type { MotionEvent } from "../../../shared/motion/motion-types";
import { useMotionInput } from "../../../shared/motion/use-motion-input";
import type { RunnerInputHandler } from "./runner-input";
import { motionToRunnerCommand, RUNNER_MOTION_COMMANDS } from "./motion-map";

export function useRunnerMotion(
  onInput: RunnerInputHandler,
  trackingMode: "fullBody" | "laptop" = "fullBody",
  sensitivityMode: "fast" | "normal" = "fast"
) {
  const handleMotionEvent = useCallback(
    (event: MotionEvent) => {
      const runnerCommand = motionToRunnerCommand(event.command);
      if (runnerCommand) {
        onInput({ command: runnerCommand, source: "mediapipe", at: event.at });
      }
    },
    [onInput]
  );

  return useMotionInput({
    sensitivity: sensitivityMode,
    bodyMode: trackingMode,
    commands: RUNNER_MOTION_COMMANDS,
    onMotionEvent: handleMotionEvent
  });
}
