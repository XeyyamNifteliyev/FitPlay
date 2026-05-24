"use client";

import { useVoiceCommands } from "../../../shared/voice/use-voice-commands";

type RunnerVoiceHandlers = {
  onCamera: () => void | Promise<void>;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCalibrate: () => void;
  onRestart: () => void;
  onBackToGames: () => void;
  onSelectSubway: () => void;
  onCameraStop: () => void;
};

export function useRunnerVoice(handlers: RunnerVoiceHandlers) {
  return useVoiceCommands(handlers);
}
