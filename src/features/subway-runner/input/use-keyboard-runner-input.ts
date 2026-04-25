"use client";

import { useEffect } from "react";

import type { RunnerCommand } from "../engine/runner-engine";
import type { RunnerInputHandler } from "./runner-input";

const KEYBOARD_COMMANDS: Record<string, RunnerCommand> = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  ArrowDown: "slide",
  " ": "jump",
  Space: "jump",
  r: "restart",
  R: "restart",
  p: "pause",
  P: "pause",
  Enter: "start"
};

export function useKeyboardRunnerInput(onInput: RunnerInputHandler) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const command = KEYBOARD_COMMANDS[event.key];

      if (!command) return;

      event.preventDefault();
      onInput({ command, source: "keyboard", at: performance.now() });
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onInput]);
}
