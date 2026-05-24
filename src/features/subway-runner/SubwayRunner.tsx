"use client";

import { useCallback, useState } from "react";

import {
  createInitialRunnerState,
  handleRunnerCommand,
  tickRunner,
  getCurrentTheme,
  type RunnerState
} from "./engine/runner-engine";
import { PoseCameraPanel } from "./input/PoseCameraPanel";
import type { RunnerInputHandler } from "./input/runner-input";
import { useKeyboardRunnerInput } from "./input/use-keyboard-runner-input";
import { RunnerScene } from "./render/RunnerScene";

type SubwayRunnerProps = {
  onBackToGames: () => void;
};

export function SubwayRunner({ onBackToGames }: SubwayRunnerProps) {
  const [state, setState] = useState<RunnerState>(() => createInitialRunnerState());
  const [lastInput, setLastInput] = useState("Klaviatura hazirdir");

  const dispatch = useCallback((command: Parameters<typeof handleRunnerCommand>[1]) => {
    setState((current) => handleRunnerCommand(current, command));
  }, []);

  const handleInput = useCallback<RunnerInputHandler>(
    (event) => {
      setLastInput(`${event.source}: ${event.command}`);
      dispatch(event.command);
    },
    [dispatch]
  );

  useKeyboardRunnerInput(handleInput);

  const onFrame = useCallback((delta: number) => {
    setState((current) => tickRunner(current, delta));
  }, []);

  return (
    <section className="runner-shell" aria-label="FitRun Metro Chase oyunu">
      <div className="runner-hud" aria-live="polite">
        <div>
          <span className="hud-label">Mesafe</span>
          <strong>{Math.floor(state.distance)} m</strong>
        </div>
        <div>
          <span className="hud-label">Xal</span>
          <strong>{state.score}</strong>
        </div>
        <div>
          <span className="hud-label">Pul</span>
          <strong>{state.coins}</strong>
        </div>
        <div>
          <span className="hud-label">Rekord</span>
          <strong>{state.highScore}</strong>
        </div>
        <div>
          <span className="hud-label">Suret</span>
          <strong>{state.speed.toFixed(1)}</strong>
        </div>
        <div>
          <span className="hud-label">Hereket</span>
          <strong>{movementLabel(state.movement)}</strong>
        </div>
        {state.powerUp !== "none" ? (
          <div>
            <span className="hud-label">Power-up</span>
            <strong>{powerUpLabel(state.powerUp, state.powerUpTimer)}</strong>
          </div>
        ) : null}
        {state.combo > 0 ? (
          <div>
            <span className="hud-label">Combo</span>
            <strong>x{state.combo}</strong>
          </div>
        ) : null}
      </div>

      <div className="runner-stage">
        <RunnerScene state={state} onFrame={onFrame} onStart={() => dispatch("start")} />
        {state.chaser.warningLevel > 0 ? (
          <div className={`chaser-alert chaser-alert--${state.chaser.warningLevel}`}>
            <span>Metro muhafizesi yaxinlasir</span>
            <strong>{Math.max(0, Math.round(state.chaser.distance))} m</strong>
          </div>
        ) : null}
        <PoseCameraPanel
          onInput={handleInput}
          onStartGame={() => dispatch("start")}
          onPauseGame={() => dispatch("pause")}
          onResumeGame={() => dispatch("resume")}
          onRestartGame={() => dispatch("restart")}
          onBackToGames={onBackToGames}
          onSelectSubway={() => dispatch("start")}
        />
      </div>

      <div className="runner-controls">
        <span>{lastInput}</span>
        <span>Tema: {themeLabel(getCurrentTheme(state))}</span>
        <span>FitRun Metro Chase: qatarlar, pullar, muhafizeci chase</span>
        <span>Kamera: sola/saga addim</span>
        <span>Kamera: tullan</span>
        <span>Kamera: comel / slide</span>
        <span>Iki el yuxari: power-up</span>
        <span>Klaviatura yalniz test ucundur</span>
        <span>R: yeniden basla</span>
        <span>P: pauza</span>
      </div>

      {state.status !== "running" ? (
        <div className="runner-overlay">
          <p>{overlayLabel(state.status)}</p>
          <span>Kamera qarsisinda tam beden gorunsun, sonra basla de.</span>
          <button
            type="button"
            onClick={() =>
              dispatch(
                state.status === "gameOver"
                  ? "restart"
                  : state.status === "paused"
                    ? "resume"
                    : "start"
              )
            }
          >
            {state.status === "gameOver"
              ? "Yeniden basla"
              : state.status === "paused"
                ? "Davam et"
                : "Basla"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function movementLabel(movement: RunnerState["movement"]) {
  if (movement === "jumping") return "Tullanma";
  if (movement === "sliding") return "Slide";
  return "Qacis";
}

function powerUpLabel(powerUp: RunnerState["powerUp"], timer: number) {
  const labels: Record<string, string> = {
    magnet: `Magnet (${timer.toFixed(0)}s)`,
    shield: "Qalxan",
    boost: `Boost (${timer.toFixed(0)}s)`,
    hoverboard: "Hoverboard qoruma"
  };
  return labels[powerUp] ?? "";
}

function themeLabel(theme: string) {
  const labels: Record<string, string> = {
    bakuMetro: "Baki Metrosu",
    icherisheher: "Icherisheher",
    bulvar: "Bulvar",
    neonNight: "Neon Gece"
  };
  return labels[theme] ?? theme;
}

function overlayLabel(status: RunnerState["status"]) {
  if (status === "gameOver") return "Oyun bitdi";
  if (status === "paused") return "Pauza";
  return "FitRun Metro Chase hazirdir";
}
