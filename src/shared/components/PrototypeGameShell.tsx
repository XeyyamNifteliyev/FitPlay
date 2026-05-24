"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { GameHUD } from "./GameHUD";
import { GameOverModal } from "./GameOverModal";
import { GameTopbar } from "./GameTopbar";
import {
  createPrototypeGameState,
  currentPrototypeAction,
  getPrototypeAccuracy,
  hitPrototypeAction,
  pausePrototypeGame,
  resetPrototypeGame,
  startPrototypeGame,
  tickPrototypeGame,
  type PrototypeGameDefinition
} from "../game-engine/prototype-engine";
import { useGameLoop } from "../hooks/use-game-loop";
import { useHighScore } from "../hooks/use-high-score";

type PrototypeGameShellProps = {
  definition: PrototypeGameDefinition;
  onBackToGames: () => void;
};

const THEME_COPY: Record<
  PrototypeGameDefinition["theme"],
  { arena: string; motion: string; prop: string }
> = {
  dance: {
    arena: "Neon dance floor",
    motion: "Qol, addim ve ritm",
    prop: "Beat"
  },
  boxing: {
    arena: "Live boxing ring",
    motion: "Jab, blok ve combo",
    prop: "Round"
  },
  balloon: {
    arena: "Party sky room",
    motion: "El ile balon vur",
    prop: "Pop"
  },
  penalty: {
    arena: "Stadium penalty zone",
    motion: "Kick ve qapici refleksi",
    prop: "Shot"
  },
  pilates: {
    arena: "Balance garden",
    motion: "Poza, nefes ve balans",
    prop: "Flow"
  }
};

export function PrototypeGameShell({
  definition,
  onBackToGames
}: PrototypeGameShellProps) {
  const [state, setState] = useState(() => createPrototypeGameState(definition));
  const { highScore, submitScore } = useHighScore(definition.highScoreKey);
  const activeAction = currentPrototypeAction(definition, state);
  const accuracy = getPrototypeAccuracy(state);
  const beatProgress = Math.max(
    0,
    Math.min(1, state.beatTimer / definition.beatSeconds)
  );
  const themeCopy = THEME_COPY[definition.theme];

  useEffect(() => {
    setState(createPrototypeGameState(definition));
  }, [definition]);

  useEffect(() => {
    if (state.status === "done") {
      submitScore(state.score);
    }
  }, [state.score, state.status, submitScore]);

  useGameLoop(
    useCallback(
      (delta) => {
        setState((current) => tickPrototypeGame(definition, current, delta));
      },
      [definition]
    ),
    state.status === "running"
  );

  const reset = () => setState(resetPrototypeGame(definition));
  const start = () => setState((current) => startPrototypeGame(definition, current));
  const pause = () => setState((current) => pausePrototypeGame(current));

  const hit = (actionId: string) =>
    setState((current) => hitPrototypeAction(definition, current, actionId));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        start();
      }

      if (event.key === " " || event.key === "Space") {
        event.preventDefault();
        hit(activeAction.id);
      }

      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        pause();
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        reset();
      }

      const index = Number(event.key) - 1;
      if (index >= 0 && index < definition.actions.length) {
        event.preventDefault();
        hit(definition.actions[index].id);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeAction.id, definition, hit, pause, reset, start]);

  return (
    <>
      <GameTopbar title={definition.title} onBack={onBackToGames} />
      <section className={`prototype-game prototype-game--${definition.theme}`}>
        <GameHUD
          items={[
            { label: "Skor", value: state.score },
            { label: "Rekord", value: highScore },
            { label: "Vaxt", value: `${Math.ceil(state.timeLeft)}s` },
            { label: definition.metricLabel, value: state.combo }
          ]}
        />

        <div className="prototype-stage">
          <div className="prototype-stage__lights" />
          <div className="prototype-stage__orbit" />
          <div className="prototype-stage__world" aria-hidden="true">
            <span className="world-prop world-prop--one" />
            <span className="world-prop world-prop--two" />
            <span className="world-prop world-prop--three" />
            <span className="world-prop world-prop--four" />
          </div>
          <div
            className="prototype-stage__beat"
            style={{ transform: `scaleX(${beatProgress})` }}
          />
          <div
            className={`prototype-stage__avatar prototype-stage__avatar--${definition.theme}`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="prototype-stage__target">
            <small>{definition.prompt}</small>
            <strong>{activeAction.label}</strong>
            <em>{activeAction.cue}</em>
          </div>
          <div className="prototype-stage__arena-label">
            <span>{themeCopy.arena}</span>
            <strong>{themeCopy.prop}</strong>
            <span>{themeCopy.motion}</span>
          </div>
          <div className="prototype-stage__feedback">
            <span>{state.feedback}</span>
            <span>{accuracy}% accuracy</span>
            <span>{state.lives} can</span>
          </div>
          <div className="prototype-stage__pads">
            {definition.actions.slice(0, 4).map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={action.id === activeAction.id ? "is-hot" : ""}
                onClick={() => hit(action.id)}
              >
                <span>{index + 1}</span>
                <strong>{action.label}</strong>
                <small>{action.cue}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="prototype-controls">
          {state.status === "running" ? (
            <button type="button" onClick={pause}>
              Pauza
            </button>
          ) : (
            <button type="button" onClick={start}>
              {state.status === "ready" ? "Basla" : "Davam et"}
            </button>
          )}
          <button type="button" onClick={reset}>
            Yeniden
          </button>
          <button
            type="button"
            onClick={() => hit(activeAction.id)}
            disabled={state.status !== "running"}
          >
            Aktiv hereket
          </button>
          <span>Kamera modu: pose input ucun hazirdir</span>
          <span>Space: test ucun aktiv hereket</span>
          <span>P: pauza</span>
        </div>

        {state.status === "done" ? (
          <GameOverModal
            title={`${definition.title} tamamlandi`}
            score={state.score}
            highScore={Math.max(highScore, state.score)}
            primaryLabel="Yeniden oyna"
            onPrimary={reset}
            onBack={onBackToGames}
          />
        ) : null}
      </section>
    </>
  );
}
