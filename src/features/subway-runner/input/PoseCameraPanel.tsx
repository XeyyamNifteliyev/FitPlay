"use client";

import type { RunnerInputHandler } from "./runner-input";
import { usePoseRunnerInput } from "./use-pose-runner-input";
import { useVoiceRunnerControl } from "./use-voice-runner-control";

type PoseCameraPanelProps = {
  onInput: RunnerInputHandler;
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onRestartGame: () => void;
  onBackToGames: () => void;
  onSelectSubway: () => void;
};

export function PoseCameraPanel({
  onInput,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onRestartGame,
  onBackToGames,
  onSelectSubway
}: PoseCameraPanelProps) {
  const pose = usePoseRunnerInput(onInput);
  const voice = useVoiceRunnerControl({
    onCamera: pose.start,
    onStart: onStartGame,
    onPause: onPauseGame,
    onResume: onResumeGame,
    onCalibrate: pose.calibrate,
    onRestart: onRestartGame,
    onBackToGames,
    onSelectSubway,
    onStop: pose.stop
  });

  return (
    <aside className="pose-panel" aria-label="Kamera ile idare">
      <div className="pose-panel__video">
        <video ref={pose.videoRef} playsInline muted />
        <span className={`pose-status pose-status--${pose.status}`}>
          {statusLabel(pose.status)}
        </span>
      </div>

      <div className="pose-panel__body">
        <div>
          <span className="hud-label">Kamera input</span>
          <strong>{pose.gestureLabel}</strong>
        </div>
        <div className="pose-metrics">
          <span>FPS: {pose.fps}</span>
          <span>AI: {pose.latencyMs} ms</span>
        </div>
        <p>{pose.message}</p>
        <div className="mode-toggle" aria-label="Kamera rejimi">
          <button
            type="button"
            className={pose.trackingMode === "fullBody" ? "is-active" : ""}
            onClick={() => pose.setTrackingMode("fullBody")}
          >
            TV tam beden
          </button>
          <button
            type="button"
            className={pose.trackingMode === "laptop" ? "is-active" : ""}
            onClick={() => pose.setTrackingMode("laptop")}
          >
            Laptop test
          </button>
        </div>
        <div className="mode-toggle" aria-label="Reaksiya sureti">
          <button
            type="button"
            className={pose.sensitivityMode === "fast" ? "is-active" : ""}
            onClick={() => pose.setSensitivityMode("fast")}
          >
            Fast
          </button>
          <button
            type="button"
            className={pose.sensitivityMode === "normal" ? "is-active" : ""}
            onClick={() => pose.setSensitivityMode("normal")}
          >
            Stabil
          </button>
        </div>
        <div className="pose-panel__actions">
          <button type="button" onClick={pose.start} disabled={pose.status === "loading"}>
            Kamerani ac
          </button>
          <button
            type="button"
            onClick={pose.calibrate}
            disabled={pose.status === "idle" || pose.status === "loading"}
          >
            Kalibrasiya et
          </button>
          <button type="button" onClick={pose.stop} disabled={pose.status === "idle"}>
            Dayandir
          </button>
        </div>
        <div className="voice-panel">
          <span className={`pose-status pose-status--${voice.status}`}>
            {voice.status === "listening" ? "Ses aktivdir" : "Ses"}
          </span>
          <p>{voice.message}</p>
          {voice.lastTranscript ? <p>Son esitdiyim: {voice.lastTranscript}</p> : null}
          <div className="pose-panel__actions">
            <button
              type="button"
              onClick={voice.startListening}
              disabled={voice.status === "listening"}
            >
              Sesi ac
            </button>
            <button
              type="button"
              onClick={voice.stopListening}
              disabled={voice.status !== "listening"}
            >
              Sesi sondur
            </button>
          </div>
        </div>
        <p className="pose-help">
          Ses: basla, pauza, davam et, yeniden, oyunlara qayit, kamera ac,
          kalibrasiya. TV rejiminde basdan ayaga qeder gorunmek lazimdir.
        </p>
      </div>
    </aside>
  );
}

function statusLabel(status: ReturnType<typeof usePoseRunnerInput>["status"]) {
  if (status === "loading") return "Hazirlanir";
  if (status === "camera") return "Kamera";
  if (status === "calibrated") return "Kalibrasiya";
  if (status === "error") return "Xeta";
  return "Sondurulub";
}
