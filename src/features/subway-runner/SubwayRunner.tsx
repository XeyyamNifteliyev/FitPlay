"use client";

import { useCallback, useState } from "react";

import {
  createInitialRunnerState,
  handleRunnerCommand,
  tickRunner,
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
    <section className="runner-shell" aria-label="Subway Runner oyunu">
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
          <span className="hud-label">Suret</span>
          <strong>{state.speed.toFixed(1)}</strong>
        </div>
        <div>
          <span className="hud-label">Hereket</span>
          <strong>{movementLabel(state.movement)}</strong>
        </div>
      </div>

      <div className="runner-stage">
        <RunnerScene state={state} onFrame={onFrame} onStart={() => dispatch("start")} />
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
        <span>Sol/Sag ox: zolaq</span>
        <span>Space: tullan</span>
        <span>Asagi ox: slide</span>
        <span>Kamera: tullan, comel, sola/saga eyil</span>
        <span>R: yeniden basla</span>
        <span>P: pauza</span>
      </div>

      {state.status !== "running" ? (
        <div className="runner-overlay">
          <p>{overlayLabel(state.status)}</p>
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

function overlayLabel(status: RunnerState["status"]) {
  if (status === "gameOver") return "Oyun bitdi";
  if (status === "paused") return "Pauza";
  return "Subway Runner hazirdir";
}
